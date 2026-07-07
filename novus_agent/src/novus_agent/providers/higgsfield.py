"""Higgsfield via MCP (https://mcp.higgsfield.ai/mcp, streamable HTTP).

Two capabilities:
  1. generate_image  - bespoke hero/section imagery tuned to trade + city
  2. website deploy  - create_website -> website_repo_access -> git push the
     static preview -> deploy_website(env='preview') -> live URL

Everything is defensive: tool result shapes are parsed loosely, and every
public method returns None/raises cleanly so the media/deploy pipelines can
fall through to the next provider without stopping a nightly run.
"""
from __future__ import annotations

import asyncio
import json
import re
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any

from ..settings import get_settings
from ..util import log

IMAGE_URL_RE = re.compile(r"https://[^\s\"']+?\.(?:png|jpe?g|webp)(?:\?[^\s\"']*)?", re.I)
URL_RE = re.compile(r"https://[^\s\"']+")
UUID_RE = re.compile(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", re.I)


def _walk_strings(obj: Any):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for v in obj.values():
            yield from _walk_strings(v)
    elif isinstance(obj, (list, tuple)):
        for v in obj:
            yield from _walk_strings(v)


class HiggsfieldClient:
    def __init__(self) -> None:
        s = get_settings()
        self.url = s.higgsfield_mcp_url
        self.token = s.higgsfield_mcp_token
        self.image_model = "marketing_studio_image"  # Higgsfield's commercial default

    # ----- MCP plumbing -----

    async def _acall(self, tool: str, args: dict[str, Any]) -> Any:
        from mcp import ClientSession
        from mcp.client.streamable_http import streamablehttp_client

        headers = {"Authorization": f"Bearer {self.token}"} if self.token else None
        async with streamablehttp_client(self.url, headers=headers) as (read, write, _):
            async with ClientSession(read, write) as session:
                await session.initialize()
                result = await session.call_tool(tool, args)
                out: list[Any] = []
                for item in getattr(result, "content", []) or []:
                    text = getattr(item, "text", None)
                    if text is None:
                        continue
                    try:
                        out.append(json.loads(text))
                    except (json.JSONDecodeError, TypeError):
                        out.append(text)
                return out if len(out) != 1 else out[0]

    def call(self, tool: str, args: dict[str, Any], timeout: float = 180.0) -> Any:
        res = asyncio.run(asyncio.wait_for(self._acall(tool, args), timeout))
        log.debug("higgsfield %s -> %.400s", tool, json.dumps(res, default=str))
        return res

    def available(self) -> bool:
        try:
            asyncio.run(asyncio.wait_for(self._alist_tools(), 20))
            return True
        except Exception as e:  # noqa: BLE001 - connectivity probe
            log.info("Higgsfield MCP not reachable: %s", e)
            return False

    async def _alist_tools(self) -> list[str]:
        from mcp import ClientSession
        from mcp.client.streamable_http import streamablehttp_client

        headers = {"Authorization": f"Bearer {self.token}"} if self.token else None
        async with streamablehttp_client(self.url, headers=headers) as (read, write, _):
            async with ClientSession(read, write) as session:
                await session.initialize()
                tools = await session.list_tools()
                return [t.name for t in tools.tools]

    # ----- imagery -----

    def generate_image(self, prompt: str, aspect_ratio: str = "16:9") -> str | None:
        """Generate one image; return a public URL or None."""
        try:
            res = self.call("generate_image", {"params": {
                "model": self.image_model, "prompt": prompt,
                "aspect_ratio": aspect_ratio, "count": 1,
            }}, timeout=240)
        except Exception as e:  # noqa: BLE001
            log.warning("Higgsfield generate_image failed: %s", e)
            return None

        url = self._first_image_url(res)
        if url:
            return url

        # Job submitted but no URL yet: poll recent generations for a result.
        job_ids = set()
        for s_ in _walk_strings(res):
            job_ids.update(UUID_RE.findall(s_))
        deadline = time.time() + 180
        while time.time() < deadline:
            time.sleep(10)
            try:
                gens = self.call("show_generations", {})
            except Exception:  # noqa: BLE001
                continue
            url = self._first_image_url(gens, prefer_ids=job_ids)
            if url:
                return url
        log.warning("Higgsfield image job did not yield a URL in time")
        return None

    @staticmethod
    def _first_image_url(obj: Any, prefer_ids: set[str] | None = None) -> str | None:
        best = None
        for s_ in _walk_strings(obj):
            for m in IMAGE_URL_RE.findall(s_):
                if prefer_ids and not any(j in s_ for j in prefer_ids):
                    best = best or m
                    continue
                return m
        return best

    # ----- website deploy -----

    def deploy_preview(self, slug: str, html: str, existing_website_id: str | None = None
                       ) -> tuple[str, str]:
        """Publish a single-file preview. Returns (preview_url, website_id).

        Flow per Higgsfield's website tools: create_website (once per lead) ->
        website_repo_access -> push the static page -> deploy_website(preview).
        """
        website_id = existing_website_id or self._create_website(slug)
        repo = self.call("website_repo_access", {"website_id": website_id})
        git_url = self._find_git_url(repo)
        if not git_url:
            raise RuntimeError(f"no git URL in website_repo_access result: {repo!r:.300}")

        self._push_static_page(git_url, slug, html)

        res = self.call("deploy_website", {"website_id": website_id, "env": "preview"}, timeout=600)
        url = self._deploy_url(res)
        deadline = time.time() + 480
        while not url and time.time() < deadline:
            time.sleep(15)
            status = self.call("website_status", {"website_id": website_id})
            url = self._deploy_url(status)
        if not url:
            raise RuntimeError("Higgsfield deploy did not return a preview URL in time")
        return url, website_id

    def _create_website(self, slug: str) -> str:
        # 'website' = plain site, no Higgsfield sign-in integration (Novus previews).
        res = self.call("create_website", {"type": "website"})
        for s_ in _walk_strings(res):
            m = re.search(r"\b(?:site|website)[_-]?[a-z0-9]{6,}\b", s_, re.I)
            if m and "id" in s_.lower():
                return m.group(0)
        # Common case: result is a dict with an id-ish field.
        if isinstance(res, dict):
            for k in ("website_id", "id"):
                if res.get(k):
                    return str(res[k])
        raise RuntimeError(f"could not find website_id in create_website result: {res!r:.300}")

    @staticmethod
    def _find_git_url(obj: Any) -> str | None:
        for s_ in _walk_strings(obj):
            for u in URL_RE.findall(s_):
                if u.endswith(".git") or "/git/" in u or "repo" in u:
                    return u
        return None

    @staticmethod
    def _deploy_url(obj: Any) -> str | None:
        for s_ in _walk_strings(obj):
            if "pending" in s_.lower() and "status" in s_.lower():
                return None
        for s_ in _walk_strings(obj):
            for u in URL_RE.findall(s_):
                if u.endswith(".git") or "mcp.higgsfield" in u:
                    continue
                if any(k in u for k in ("preview", "pages.dev", "workers.dev", "higgsfield")):
                    return u.rstrip(").,")
        return None

    @staticmethod
    def _push_static_page(git_url: str, slug: str, html: str) -> None:
        tmp = Path(tempfile.mkdtemp(prefix="novus-hf-"))
        try:
            subprocess.run(["git", "clone", "--depth", "1", git_url, str(tmp)],
                           check=True, capture_output=True, timeout=120)
            # Serve the preview both as a root file and as a static asset,
            # covering template variants that serve / or /index.html from public/.
            (tmp / "index.html").write_text(html, encoding="utf-8")
            pub = tmp / "public"
            pub.mkdir(exist_ok=True)
            (pub / "index.html").write_text(html, encoding="utf-8")
            env = {"GIT_AUTHOR_NAME": "Novus Agent", "GIT_AUTHOR_EMAIL": "agent@novusco.local",
                   "GIT_COMMITTER_NAME": "Novus Agent", "GIT_COMMITTER_EMAIL": "agent@novusco.local",
                   "PATH": "/usr/bin:/bin:/usr/local/bin"}
            subprocess.run(["git", "add", "-A"], cwd=tmp, check=True, capture_output=True, env=env)
            subprocess.run(["git", "commit", "-m", f"novusco-preview-{slug}"],
                           cwd=tmp, check=True, capture_output=True, env=env)
            subprocess.run(["git", "push"], cwd=tmp, check=True, capture_output=True,
                           timeout=120, env=env)
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
