"""Preview deployment. Backends: higgsfield (spec default) | netlify | local.

`auto` picks: higgsfield if its MCP is reachable -> netlify if a token is set
-> local (the dashboard serves ./previews). Site IDs are remembered per slug in
app_state so re-deploys update the same URL. Naming: novusco-preview-<slug>.
"""
from __future__ import annotations

import io
import json
import zipfile
from pathlib import Path

import httpx

from .db import db_session, state_get, state_set
from .settings import get_settings
from .util import log


def deploy(slug: str, html_path: Path) -> tuple[str, str]:
    """Deploy one preview. Returns (public_url, backend_name)."""
    s = get_settings()
    html = html_path.read_text(encoding="utf-8")
    backend = s.preview_deploy_backend.lower()

    order: list[str]
    if backend == "auto":
        order = ["higgsfield", "netlify", "local"]
    else:
        order = [backend, "local"] if backend != "local" else ["local"]

    last_err: Exception | None = None
    for b in order:
        try:
            if b == "higgsfield":
                url = _deploy_higgsfield(slug, html)
            elif b == "netlify":
                url = _deploy_netlify(slug, html)
            else:
                url = _deploy_local(slug, html_path)
            return url, b
        except Exception as e:  # noqa: BLE001 - fall through to the next backend
            last_err = e
            log.warning("deploy via %s failed for %s: %s", b, slug, e)
    raise RuntimeError(f"all deploy backends failed for {slug}: {last_err}")


def _deploy_local(slug: str, html_path: Path) -> str:
    base = get_settings().preview_base_url.rstrip("/")
    return f"{base}/previews/{slug}/"


def _deploy_higgsfield(slug: str, html: str) -> str:
    s = get_settings()
    if s.novus_demo:
        raise RuntimeError("higgsfield disabled in demo mode")
    from .providers.higgsfield import HiggsfieldClient

    hf = HiggsfieldClient()
    if not hf.available():
        raise RuntimeError("Higgsfield MCP not reachable")
    with db_session() as sess:
        existing = state_get(sess, f"hf_site:{slug}")
    url, website_id = hf.deploy_preview(f"novusco-preview-{slug}", html, existing)
    with db_session() as sess:
        state_set(sess, f"hf_site:{slug}", website_id)
        sess.commit()
    return url


def _deploy_netlify(slug: str, html: str) -> str:
    s = get_settings()
    token = s.netlify_auth_token
    if not token:
        raise RuntimeError("NETLIFY_AUTH_TOKEN not set")
    headers = {"Authorization": f"Bearer {token}"}
    site_name = f"novusco-preview-{slug}"[:63].rstrip("-")

    with db_session() as sess:
        site_id = state_get(sess, f"netlify_site:{slug}")

    if not site_id:
        r = httpx.post("https://api.netlify.com/api/v1/sites",
                       headers=headers, json={"name": site_name}, timeout=30)
        if r.status_code == 422:  # name taken (e.g. re-run after db reset)
            r = httpx.post("https://api.netlify.com/api/v1/sites", headers=headers,
                           json={}, timeout=30)
        r.raise_for_status()
        site = r.json()
        site_id = site["id"]
        with db_session() as sess:
            state_set(sess, f"netlify_site:{slug}", site_id)
            sess.commit()

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("index.html", html)
    r = httpx.post(f"https://api.netlify.com/api/v1/sites/{site_id}/deploys",
                   headers={**headers, "Content-Type": "application/zip"},
                   content=buf.getvalue(), timeout=120)
    r.raise_for_status()
    dep = r.json()
    url = dep.get("ssl_url") or dep.get("url")
    if not url:
        raise RuntimeError(f"netlify deploy returned no URL: {json.dumps(dep)[:200]}")
    return url
