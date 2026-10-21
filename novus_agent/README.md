# Novus Pipeline Agent

A self-running, local agent for **Novus Co.** that every day, on its own:

1. picks the next target city from a ranked top-50 list it maintains (Module 0)
2. finds ~15–20 local/home-service businesses with weak or no websites (Module 1)
3. audits each and scores it with a **Novus Score** (0–100) + A/B/C grade (Module 2)
4. builds a **premium, bespoke, deployed website preview** for the best leads (Module 3)
5. runs an **automated self-check** on every preview and email — only passing work advances (Module 3.5)
6. writes a personalized cold email + a 3-touch follow-up sequence linking the live preview (Module 4)
7. sends — governed by the `AUTO_SEND` switch with warm-up + compliance rails (Module 5)
8. polls replies and drafts due follow-ups; STOP/bounces are suppressed forever (Module 6)
9. logs everything to a local SQLite CRM, writes a daily report, and serves a dashboard (Modules 7–8)

Every reasoning/design/writing step runs on **Claude Fable 5** (`claude-fable-5`) via the
Anthropic API. The loop is **non-interactive by design**: a scheduled run never prompts for
anything. The only thing you ever touch is the send switch.

---

## Quickstart

```bash
cd novus_agent
python3 -m venv .venv && source .venv/bin/activate
pip install -e .            # core
pip install -r requirements.txt   # + gmail, higgsfield MCP, playwright extras

cp .env.example .env        # fill in keys (see reference below)
novus doctor                # verify config + integrations
novus daily                 # one full unattended run
novus dashboard             # http://127.0.0.1:8787
```

**Try it with zero keys first** — demo mode runs the entire pipeline offline with
deterministic fictional Tampa businesses:

```bash
novus --demo daily
novus --demo dashboard
```

> Playwright render checks: after `pip install playwright`, run `playwright install chromium`
> once. Without it the two browser checks (console errors, mobile overflow) are recorded as
> "skipped" and the rest of the QA gate still applies.

---

## The daily loop

```
cities.pick_today → research → grade → preview → selfcheck → draft
        → (send if AUTO_SEND) → followups → daily report
```

Each stage is fenced: one failure never kills the run. Everything lands in
`novus.db` (SQLite), `previews/`, `reports/YYYY-MM-DD.md`, and `logs/novus.log`.

### CLI

```
novus daily                                    # the full unattended run (what the scheduler calls)
novus cities --rebuild                         # (re)build the top-50 city list with Fable 5
novus research --city "Tampa, FL" --niche roofing --limit 18
novus grade | novus preview | novus selfcheck | novus draft
novus approve [--ids 1,2] [--yes]              # review + send the queue (AUTO_SEND=false path)
novus followups                                # poll replies + draft due touches
novus dashboard [--port 8787]                  # kanban, lead table, approve button, metrics
novus doctor                                   # config/integration health check
novus gmail-auth                               # one-time Gmail OAuth (the only interactive step)
novus kill [--off]                             # instant send kill switch
novus schedule                                 # built-in APScheduler daily runner
novus report                                   # regenerate today's report
novus --demo <anything>                        # offline deterministic providers
```

---

## Installing the daily schedule

Pick ONE of the three (cron is the recommended default on Linux, launchd on macOS):

**cron (Linux):**
```bash
./scripts/install_cron.sh 08:00     # installs: 0 8 * * * cd <repo> && novus daily >> logs/cron.log
crontab -l                          # verify
```

**launchd (macOS):** edit the two `REPLACE_ME` paths in
`scripts/com.novusco.agent.plist`, then:
```bash
cp scripts/com.novusco.agent.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.novusco.agent.plist
```

**APScheduler (any OS, keeps a process running):**
```bash
novus schedule            # fires `novus daily` at DAILY_RUN_TIME every day
```

The agent never asks for permissions or confirmations mid-run, so scheduled runs
cannot block. (If you ever drive this project from Claude Code instead, use
headless mode — `claude -p "..." --dangerously-skip-permissions` — for the same
reason; the agent itself does not need Claude Code at all.)

---

## .env reference (every variable)

| Variable | Meaning |
|---|---|
| `ANTHROPIC_API_KEY` | Fable 5 access. **Required** for real runs. The org must allow 30-day data retention (Fable 5 is unavailable under ZDR — requests 400). |
| `CLAUDE_MODEL` | `claude-fable-5`. Used for every reasoning/design/writing step. |
| `CLAUDE_FALLBACK_MODEL` | `claude-opus-4-8`. Server-side rescue when a Fable 5 safety classifier false-positives (`stop_reason: refusal`); the same call is transparently re-served. |
| `CLAUDE_MAX_TOKENS` / `CLAUDE_PAGE_MAX_TOKENS` | Output budgets; page generation streams automatically above 16k. |
| `CLAUDE_EFFORT` | `low`–`max`. `high` is the tuned default. |
| `SERP_API_KEY` | SerpApi key — the **decided search backend**. Daily headless scraping of Google gets CAPTCHA'd; don't. |
| `SEARCH_HEADLESS_FALLBACK` | `true` allows a best-effort Playwright Google scrape when SERP fails. Off by default, discouraged. |
| `GOOGLE_PLACES_API_KEY` | Website detection, GBP signals (rating/reviews/photos), and the business's own photos for its preview. |
| `STOCK_API_KEY` / `STOCK_PROVIDER` | Pexels key — licensed stock fallback imagery. |
| `HIGGSFIELD_MCP_URL` / `HIGGSFIELD_MCP_TOKEN` | Higgsfield MCP endpoint (image generation + website deploy). Token only if your account requires one. |
| `PREVIEW_DEPLOY_BACKEND` | `auto` \| `higgsfield` \| `netlify` \| `local`. `auto` = Higgsfield if reachable → Netlify if token set → local. |
| `NETLIFY_AUTH_TOKEN` | Optional battle-tested static-hosting fallback for previews. |
| `PREVIEW_BASE_URL` | Base URL for the `local` backend (dashboard serves `./previews`). |
| `NOVUS_SENDER_EMAIL` / `NOVUS_BUSINESS_NAME` | Outreach identity. |
| `NOVUS_MAILING_ADDRESS` | **Required (CAN-SPAM).** Drafting refuses to run while empty. Appears in every email. |
| `NOVUS_OPTOUT_LINE` | Opt-out sentence appended to every email. |
| `AUTO_SEND` | `false` = queue for one-tap approval. `true` = hands-off sending inside all rails below. |
| `DAILY_LEAD_TARGET` | New leads captured per day (aim 15–20). |
| `DAILY_SEND_CAP` | Hard daily ceiling regardless of AUTO_SEND. |
| `WARMUP_START` / `WARMUP_WEEKLY_STEP` | Warm-up ramp: day-1 allowance, +N per week until the cap. |
| `MIN_AUTOSEND_GRADE` | Only this grade or better auto-sends (self-check PASS also required). |
| `PER_DOMAIN_DAILY_LIMIT` | Per-recipient-domain throttle (free-mail domains like gmail.com exempt, or the pipeline would stall). |
| `KILL_SWITCH_FILE` | If this file exists, ALL sending halts instantly (`novus kill`). |
| `MAX_QA_RETRIES` | Preview/email regenerations before a lead is PARKED. |
| `MAX_PREVIEWS_PER_DAY` | Cost control on preview generation. |
| `CITY_REFRESH_DAYS` / `CITY_NICHE_COOLDOWN_DAYS` | Monthly list rebuild; same city+niche never re-scraped inside the cooldown. |
| `FOLLOWUP_2_DAYS` / `FOLLOWUP_3_DAYS` | Touch 2 at day 3, touch 3 at day 7 (from the initial send). |
| `REQUEST_JITTER_MIN/MAX` | Polite delay between external calls. |
| `SCORE_WEIGHTS` | Optional JSON override of the Novus Score weights. |
| `DAILY_RUN_TIME` | Fire time for `novus schedule`. |
| `DASHBOARD_HOST/PORT` | Dashboard bind (127.0.0.1 by default — it's an operator console). |
| `NOVUS_DB_PATH` | SQLite location. |
| `NOVUS_DEMO` | `true` = deterministic offline providers. |
| `LOG_LEVEL` | Python log level. |
| `GMAIL_CREDENTIALS_FILE` / `GMAIL_TOKEN_FILE` | OAuth client + saved token paths (see Gmail setup). |

---

## Gmail setup (drafts, sends, reply/STOP/bounce detection)

1. Google Cloud Console → create a project → enable the **Gmail API**.
2. Credentials → **OAuth client ID (Desktop app)** → download JSON → save as
   `novus_agent/credentials.json`.
3. `novus gmail-auth` — a browser opens once; the token is saved to `token.json`.

Until then the agent degrades gracefully: drafts become `.eml` files in `./outbox`
(open them in any mail app), "sending" moves them to `outbox/sent/`, and reply
polling logs a loud warning. Everything else works identically.

## Higgsfield / Netlify preview deploys

- **Higgsfield (spec default):** each preview becomes a Higgsfield website
  (`novusco-preview-<business-slug>`) via the MCP flow
  `create_website → website_repo_access → git push → deploy_website(env=preview)`.
  Site IDs are remembered, so a regenerated preview updates the same URL.
  Requires `git` on PATH and a reachable `HIGGSFIELD_MCP_URL`. Heads-up: each
  deploy runs Higgsfield's CI build, so a batch of 8 previews takes minutes,
  and the account needs website credits.
- **Netlify:** dead-simple ZIP deploys, ideal for single-file pages. Set
  `NETLIFY_AUTH_TOKEN` and either `PREVIEW_DEPLOY_BACKEND=netlify` or leave `auto`.
- **local:** always available; the dashboard serves `previews/<slug>/` at
  `PREVIEW_BASE_URL`. Used automatically when nothing else is configured (and in demo).

## Imagery policy (copyright-clean, enforced in `media.py`)

1. Higgsfield-generated bespoke hero/section imagery (tuned to trade + city)
2. the business's **own** Google photos — only on that business's own preview,
   resolved to public CDN URLs (no API key in pages); use within Places API terms
3. licensed stock (Pexels)
4. a designed CSS/SVG treatment — never scraped images, never broken `<img>`s

## Never-fabricate policy (enforced in `selfcheck.py`)

Reviews are the business's real Google reviews, or the skeleton's clearly-labeled
placeholder block ("Sample review shown as a placeholder…"). The content judge
fails any preview with invented named testimonials or invented stats, and the
email judge fails deceptive subjects (fake "Re:", bait). Failures regenerate,
then park.

---

## The Novus Score

`no_site +40 · not_mobile +15 · no_https +10 · slow/outdated +10 · no_booking_cta +8 ·
weak_gbp +7 · public_contact +5 · active_ig +5` → capped at 100.
Grades: **A 70–100 · B 40–69 · C 0–39** (C parks immediately; A is worked first).

A business with **no site at all** counts the site-quality flags as true — its web
presence has no mobile view, no HTTPS, no CTA — which is exactly why no-site leads
with active Instagram + public email are the A-grade sweet spot. Override any weight
via `SCORE_WEIGHTS='{"no_site": 45}'`.

## The self-check gate (Module 3.5)

Preview (all must pass): deployed URL/file loads · every image resolves · no
placeholder-service art · no JS console errors + no 390px horizontal overflow
(Playwright; skipped-with-warning if not installed) · motion present **and**
`prefers-reduced-motion` respected · hero names the right city + trade · services
match the trade · the 4 areas are real · reviews real-or-labeled-placeholder ·
Novus footer present · **taste pass**: Fable 5 self-critiques against the
"would a design-led studio charge $3k–5k for this?" bar (score ≥ 80).

Email (all must pass): no unfilled tokens · honest subject · personalized ·
preview link present · opt-out + mailing address present · recipient not suppressed.

FAIL → regenerate with concrete fix directives (up to `MAX_QA_RETRIES`) → PARKED.

## Sending rails (always on, both auto and manual paths)

- kill-switch file check before every single send
- suppression check before every single send (STOP + bounces live forever in the
  `suppression` table)
- hard `DAILY_SEND_CAP`, per-domain throttle
- AUTO_SEND additionally requires: warm-up allowance, `MIN_AUTOSEND_GRADE`,
  self-check PASS

### Flipping AUTO_SEND on, safely

1. Run 3–5 days with `AUTO_SEND=false`; eyeball queues in the dashboard, send with
   one tap. Confirm previews/copy are consistently good and replies land.
2. `novus gmail-auth` done, `NOVUS_MAILING_ADDRESS` set, `novus doctor` all green.
3. Set `AUTO_SEND=true`. Day one sends `WARMUP_START` (5); each week adds
   `WARMUP_WEEKLY_STEP` until `DAILY_SEND_CAP`. Only A-grade, QA-passed leads go out.
4. Watch `reports/` and the dashboard for the first week. Panic button:
   `novus kill` (instant, absolute).

## Deliverability & compliance (read this once)

- Every email carries your business name, physical mailing address, and a working
  opt-out line; STOP replies and bounces are honored forever, automatically.
  Subjects are judged for honesty before queueing. That's the CAN-SPAM baseline —
  **you** remain responsible for compliance in your jurisdictions.
- **A single Gmail account is not built for scaled cold volume.** Keep caps modest
  (the defaults are), warm up slowly, and before pushing `DAILY_SEND_CAP` higher,
  move to a dedicated sending domain + ESP with SPF/DKIM/DMARC. Sudden volume on a
  personal Gmail risks the account.
- Respect the SERP/Places terms of the APIs you enable; the agent rate-limits
  politely (`REQUEST_JITTER_*`).

---

## Data model

`leads` — the CRM row per business (identity, score/grade, audit JSON, preview
path/URL, self-check JSON, drafts, touches, follow-up dates, deal value, notes).
Statuses: `NEW → SCORED → PREVIEW_BUILT → QA_PASSED → DRAFTED → QUEUED → SENT →
REPLIED → CALL_BOOKED → PROPOSAL → WON / LOST / PARKED`.

`cities` — the ranked top-50 with component scores + rotation state.
`batches` — every (date, city, niche) research run (powers the cooldown).
`suppression` — STOP/bounce/manual blocks, checked before every send, forever.
`email_log` — every outbound touch (powers caps, throttles, metrics).
`app_state` — rotation pointers, warm-up start date, per-slug deploy site IDs.
`events` — the audit trail behind the daily report and dashboard activity feed.

## Repo layout

```
novus_agent/
├── src/novus_agent/
│   ├── settings.py  util.py  db.py  prompts.py  claude_client.py
│   ├── cities.py  research.py  grading.py  media.py  preview.py  deploy.py
│   ├── selfcheck.py  outreach.py  send.py  followups.py
│   ├── orchestrator.py  report.py  dashboard.py  cli.py  demo.py
│   └── providers/  (serp, places, stock, higgsfield MCP, gmail)
├── templates/   ← the three Novus brand skeletons (bold-trade, clean-service, premium-local)
├── scripts/     ← cron installer + launchd plist
├── previews/  reports/  outbox/  logs/   (generated, gitignored)
├── .env.example  requirements.txt  pyproject.toml
```

The skeletons are also loadable from an installed `novus-preview-templates` skill
(`~/.claude/skills/novus-preview-templates/`) if you keep them there; `./templates/`
is the fallback and source of truth in this repo.

## Troubleshooting

- `novus doctor` first — it checks every key, the DB, templates, Gmail, Playwright,
  the Higgsfield MCP, and the kill switch.
- **All previews parked?** Read `selfcheck_json` in the dashboard's lead panel —
  the taste judge and content judge record exactly why, and the fix directives
  they issued.
- **Nothing sends with AUTO_SEND=true?** Check grade (`MIN_AUTOSEND_GRADE`),
  self-check status, warm-up allowance in the dashboard header, suppression, and
  whether `.novus_kill` exists.
- **Fable 5 returns 400 on every call?** Your Anthropic org is set to zero data
  retention; Fable 5 requires 30-day retention.
- **Playwright browser mismatch** (`Executable doesn't exist…`): run
  `playwright install chromium`, or point `NOVUS_CHROMIUM_PATH` at any Chrome/Chromium
  binary — the self-check falls back to it automatically.
