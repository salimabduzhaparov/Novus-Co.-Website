"""Module 8 - local FastAPI dashboard.

Pipeline kanban, sortable lead table, per-lead panel (audit, self-check, live
preview embed, drafts), one-tap approve/send, city rotation, and metrics.
Binds to 127.0.0.1 by default - it is an operator console, not a public site.
"""
from __future__ import annotations

import json

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import select

from .db import STATUSES, Batch, City, EventLog, Lead, db_session
from .report import metrics
from .settings import get_settings
from .util import today

app = FastAPI(title="Novus Pipeline Agent", docs_url=None, redoc_url=None)


def _lead_row(l: Lead) -> dict:
    return {
        "id": l.id, "business_name": l.business_name, "trade": l.trade, "city": l.city,
        "email": l.email, "phone": l.phone, "instagram_handle": l.instagram_handle,
        "has_website": l.has_website, "website_url": l.website_url,
        "novus_score": l.novus_score, "grade": l.grade, "status": l.status,
        "preview_url": l.preview_url, "selfcheck_passed": l.selfcheck_passed,
        "touches_sent": l.touches_sent, "reply_received": l.reply_received,
        "next_follow_up_date": str(l.next_follow_up_date or ""),
        "deal_value": l.deal_value, "created_at": str(l.created_at)[:16],
    }


@app.get("/api/summary")
def api_summary() -> JSONResponse:
    s = get_settings()
    from .send import kill_switch_active, list_queue, sends_today, warmup_allowance
    with db_session() as sess:
        batch = sess.scalars(select(Batch).order_by(Batch.id.desc())).first()
        allowance = warmup_allowance(sess) if s.auto_send else None
        sent_today = sends_today(sess)
    return JSONResponse({
        "metrics": metrics(),
        "today": {"date": today().isoformat(),
                  "city": batch.city if batch else None,
                  "niche": batch.niche if batch else None},
        "auto_send": s.auto_send,
        "warmup_allowance": allowance,
        "sent_today": sent_today,
        "daily_send_cap": s.daily_send_cap,
        "kill_switch": kill_switch_active(),
        "queue_len": len(list_queue()),
        "statuses": STATUSES,
    })


@app.get("/api/leads")
def api_leads(status: str | None = None, sort: str = "score") -> list[dict]:
    with db_session() as sess:
        q = select(Lead)
        if status:
            q = q.where(Lead.status == status)
        if sort == "score":
            q = q.order_by(Lead.novus_score.desc().nulls_last())
        elif sort == "created":
            q = q.order_by(Lead.created_at.desc())
        else:
            q = q.order_by(Lead.business_name)
        return [_lead_row(l) for l in sess.scalars(q).all()]


@app.get("/api/lead/{lead_id}")
def api_lead(lead_id: int) -> dict:
    with db_session() as sess:
        l = sess.get(Lead, lead_id)
        if l is None:
            raise HTTPException(404)
        row = _lead_row(l)
        row["notes"] = l.notes
        row["audit"] = json.loads(l.audit_json) if l.audit_json else None
        row["selfcheck"] = json.loads(l.selfcheck_json) if l.selfcheck_json else None
        row["drafts"] = json.loads(l.drafts_json) if l.drafts_json else None
        row["email_draft_id"] = l.email_draft_id
        row["template_used"] = l.template_used
        return row


@app.get("/api/cities")
def api_cities() -> list[dict]:
    with db_session() as sess:
        return [{"rank": c.rank, "name": c.name, "state": c.state,
                 "pay_probability": c.pay_probability,
                 "last_targeted": str(c.last_targeted or ""),
                 "times_targeted": c.times_targeted, "rationale": c.rationale}
                for c in sess.scalars(select(City).order_by(City.rank)).all()]


@app.get("/api/queue")
def api_queue() -> list[dict]:
    from .send import list_queue
    return list_queue()


class ApproveBody(BaseModel):
    ids: list[int] | None = None


@app.post("/api/approve")
def api_approve(body: ApproveBody) -> dict:
    from .send import approve_and_send
    return {"sent": approve_and_send(body.ids)}


@app.get("/api/events")
def api_events(limit: int = 120) -> list[dict]:
    with db_session() as sess:
        rows = sess.scalars(select(EventLog).order_by(EventLog.id.desc())).all()[:limit]
        return [{"at": str(e.at)[:16], "stage": e.stage, "lead_id": e.lead_id,
                 "message": e.message} for e in rows]


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return PAGE


def serve(host: str | None = None, port: int | None = None) -> None:
    import uvicorn
    s = get_settings()
    previews = s.path("previews")
    previews.mkdir(parents=True, exist_ok=True)
    app.mount("/previews", StaticFiles(directory=str(previews), html=True), name="previews")
    uvicorn.run(app, host=host or s.dashboard_host, port=port or s.dashboard_port,
                log_level="warning")


PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Novus Pipeline</title>
<style>
:root{--bg:#101214;--panel:#191d21;--line:#262c31;--ink:#e8e6e1;--dim:#9aa3ab;--acc:#e07b39;--ok:#69b076;--bad:#d06060}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font:14px/1.5 system-ui,sans-serif}
header{display:flex;align-items:center;gap:18px;padding:14px 22px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--bg);z-index:5}
h1{font-size:16px}h1 b{color:var(--acc)}
nav{display:flex;gap:4px;margin-left:auto}
nav button{background:none;border:1px solid transparent;color:var(--dim);padding:7px 14px;border-radius:8px;cursor:pointer;font:inherit}
nav button.on{color:var(--ink);border-color:var(--line);background:var(--panel)}
main{padding:20px 22px;max-width:1500px;margin:0 auto}
.strip{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px}
.stat{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 16px;min-width:120px}
.stat b{display:block;font-size:19px}.stat span{color:var(--dim);font-size:12px}
.badge{padding:2px 9px;border-radius:99px;font-size:11px;font-weight:700}
.badge.A{background:#2c4632;color:#8fd19b}.badge.B{background:#46402c;color:#d1c18f}.badge.C{background:#462c2c;color:#d19b8f}
.kanban{display:grid;grid-auto-flow:column;grid-auto-columns:230px;gap:12px;overflow-x:auto;padding-bottom:10px}
.col{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px;min-height:120px}
.col h3{font-size:11px;letter-spacing:.1em;color:var(--dim);margin:2px 4px 10px;text-transform:uppercase}
.cardk{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:9px 10px;margin-bottom:8px;cursor:pointer}
.cardk:hover{border-color:var(--acc)}
.cardk .nm{font-weight:600;font-size:13px}.cardk .mt{color:var(--dim);font-size:11px;display:flex;gap:8px;margin-top:3px;align-items:center}
table{width:100%;border-collapse:collapse;background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden}
th,td{padding:9px 12px;text-align:left;border-bottom:1px solid var(--line);font-size:13px}
th{color:var(--dim);font-size:11px;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;user-select:none}
tr:hover td{background:#1e2429}td a{color:var(--acc)}
.drawer{position:fixed;top:0;right:-720px;width:min(720px,96vw);height:100vh;background:var(--panel);border-left:1px solid var(--line);transition:right .25s ease;z-index:20;display:flex;flex-direction:column}
.drawer.open{right:0}
.drawer .hd{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--line)}
.drawer .bd{overflow:auto;padding:16px 18px;flex:1}
.drawer iframe{width:100%;height:430px;border:1px solid var(--line);border-radius:8px;background:#fff}
.drawer pre{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:12px;font-size:12px;overflow:auto;white-space:pre-wrap;margin:8px 0 16px}
.drawer h4{margin:14px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--dim)}
.btn{background:var(--acc);color:#141210;font-weight:700;border:0;border-radius:8px;padding:9px 16px;cursor:pointer;font:inherit}
.btn.gray{background:var(--line);color:var(--ink)}
.x{margin-left:auto;background:none;border:0;color:var(--dim);font-size:20px;cursor:pointer}
.pill{font-size:11px;border:1px solid var(--line);padding:2px 8px;border-radius:99px;color:var(--dim)}
.warn{background:#3b2a1f;border:1px solid #7a4a24;color:#eab308;padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:13px}
.ok-dot{color:var(--ok)}.bad-dot{color:var(--bad)}
.log{font-family:ui-monospace,monospace;font-size:12px;color:var(--dim)}
.log b{color:var(--ink)}
input[type=checkbox]{accent-color:var(--acc);width:15px;height:15px}
</style></head><body>
<header>
  <h1>Novus <b>Pipeline</b></h1><span id="today" class="pill"></span><span id="mode" class="pill"></span>
  <nav>
    <button data-tab="pipeline" class="on">Pipeline</button>
    <button data-tab="leads">Leads</button>
    <button data-tab="queue">Queue</button>
    <button data-tab="cities">Cities</button>
    <button data-tab="activity">Activity</button>
  </nav>
</header>
<main>
  <div id="killwarn"></div>
  <div class="strip" id="stats"></div>
  <section id="tab-pipeline"><div class="kanban" id="kanban"></div></section>
  <section id="tab-leads" hidden>
    <table><thead><tr>
      <th data-s="business_name">Business</th><th data-s="city">City</th><th data-s="grade">Grade</th>
      <th data-s="novus_score">Score ▾</th><th data-s="status">Status</th><th>Preview</th><th>QA</th>
    </tr></thead><tbody id="leadrows"></tbody></table>
  </section>
  <section id="tab-queue" hidden>
    <div style="display:flex;gap:10px;margin-bottom:14px;align-items:center">
      <button class="btn" onclick="approve(false)">Send selected</button>
      <button class="btn gray" onclick="approve(true)">Send ALL</button>
      <span class="pill" id="qcount"></span>
    </div>
    <table><thead><tr><th></th><th>Business</th><th>Touch</th><th>Grade</th><th>QA</th><th>Subject</th><th>Preview</th></tr></thead>
    <tbody id="queuerows"></tbody></table>
  </section>
  <section id="tab-cities" hidden>
    <table><thead><tr><th>#</th><th>City</th><th>Pay prob.</th><th>Last targeted</th><th>Hits</th><th>Why</th></tr></thead>
    <tbody id="cityrows"></tbody></table>
  </section>
  <section id="tab-activity" hidden><div id="events" class="log"></div></section>
</main>
<aside class="drawer" id="drawer">
  <div class="hd"><b id="d-name"></b><span id="d-grade"></span><button class="x" onclick="closeDrawer()">×</button></div>
  <div class="bd" id="d-body"></div>
</aside>
<script>
const $=q=>document.querySelector(q);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let leadsCache=[],sortKey='novus_score',sortDir=-1;
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('nav button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  document.querySelectorAll('main section').forEach(s=>s.hidden=true);
  $('#tab-'+b.dataset.tab).hidden=false;
});
async function j(u,opt){const r=await fetch(u,opt);return r.json()}
function stat(label,val){return `<div class="stat"><b>${val??'—'}</b><span>${label}</span></div>`}
async function refresh(){
  const s=await j('/api/summary');const m=s.metrics;
  $('#today').textContent=`${s.today.date} · ${s.today.city??'no batch yet'}${s.today.niche?' / '+s.today.niche:''}`;
  $('#mode').textContent=s.auto_send?`AUTO_SEND on · ${s.sent_today}/${s.warmup_allowance} today`:`manual approval · queue ${s.queue_len}`;
  $('#killwarn').innerHTML=s.kill_switch?'<div class="warn">⛔ KILL SWITCH ENGAGED — all sending halted (delete the kill file or run `novus kill --off`)</div>':'';
  $('#stats').innerHTML=
    stat('total leads',m.total_leads)+stat('A / B / C',`${m.by_grade.A??0} / ${m.by_grade.B??0} / ${m.by_grade.C??0}`)+
    stat('previews built',m.previews_built)+stat('QA pass rate',m.qa_pass_rate==null?'—':Math.round(m.qa_pass_rate*100)+'%')+
    stat('sent today / total',`${m.emails_sent_today} / ${m.emails_sent_total}`)+stat('replies',m.replies)+
    stat('calls booked',m.calls_booked)+stat('pipeline $',Math.round(m.pipeline_value))+stat('won $',Math.round(m.won_value));
  leadsCache=await j('/api/leads');renderKanban(s.statuses);renderLeads();
  renderQueue(await j('/api/queue'));renderCities(await j('/api/cities'));renderEvents(await j('/api/events'));
}
function renderKanban(statuses){
  $('#kanban').innerHTML=statuses.map(st=>{
    const cards=leadsCache.filter(l=>l.status===st);
    return `<div class="col"><h3>${st} · ${cards.length}</h3>`+cards.map(l=>
      `<div class="cardk" onclick="openLead(${l.id})"><div class="nm">${esc(l.business_name)}</div>
       <div class="mt"><span class="badge ${l.grade??''}">${l.grade??'–'}</span><span>${l.novus_score??''}</span><span>${esc(l.city.split(',')[0])}</span></div></div>`).join('')+`</div>`;
  }).join('');
}
function renderLeads(){
  const rows=[...leadsCache].sort((a,b)=>{const x=a[sortKey],y=b[sortKey];return((x>y)-(x<y))*sortDir});
  $('#leadrows').innerHTML=rows.map(l=>`<tr onclick="openLead(${l.id})" style="cursor:pointer">
    <td>${esc(l.business_name)}</td><td>${esc(l.city)}</td><td><span class="badge ${l.grade??''}">${l.grade??'–'}</span></td>
    <td>${l.novus_score??''}</td><td>${l.status}</td>
    <td>${l.preview_url?`<a href="${esc(l.preview_url)}" target="_blank" onclick="event.stopPropagation()">open ↗</a>`:''}</td>
    <td>${l.selfcheck_passed==null?'—':(l.selfcheck_passed?'<span class="ok-dot">PASS</span>':'<span class="bad-dot">FAIL</span>')}</td></tr>`).join('');
}
document.querySelectorAll('th[data-s]').forEach(th=>th.onclick=()=>{
  sortDir=(sortKey===th.dataset.s)?-sortDir:-1;sortKey=th.dataset.s;renderLeads();
});
function renderQueue(q){
  $('#qcount').textContent=q.length+' awaiting approval';
  $('#queuerows').innerHTML=q.map(x=>`<tr>
    <td><input type="checkbox" class="qsel" value="${x.id}"></td>
    <td>${esc(x.business)}<div style="color:var(--dim);font-size:11px">${esc(x.email)}</div></td>
    <td>#${x.touch}</td><td><span class="badge ${x.grade??''}">${x.grade??'–'}</span></td>
    <td>${x.selfcheck_passed?'<span class="ok-dot">PASS</span>':'<span class="bad-dot">check</span>'}</td>
    <td>${esc(x.subject)}</td>
    <td>${x.preview_url?`<a href="${esc(x.preview_url)}" target="_blank">open ↗</a>`:''}</td></tr>`).join('');
}
async function approve(all){
  const ids=all?null:[...document.querySelectorAll('.qsel:checked')].map(c=>+c.value);
  if(!all&&!ids.length)return alert('select rows first');
  if(!confirm(all?'Send the entire queue?':'Send '+ids.length+' email(s)?'))return;
  const r=await j('/api/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids})});
  alert(r.sent+' sent');refresh();
}
function renderCities(cs){
  $('#cityrows').innerHTML=cs.map(c=>`<tr><td>${c.rank}</td><td>${esc(c.name)}, ${esc(c.state)}</td>
    <td>${c.pay_probability.toFixed(2)}</td><td>${c.last_targeted||'—'}</td><td>${c.times_targeted}</td>
    <td style="color:var(--dim);max-width:480px">${esc(c.rationale??'')}</td></tr>`).join('');
}
function renderEvents(es){
  $('#events').innerHTML=es.map(e=>`<div><b>${e.at}</b> [${e.stage}] ${esc(e.message)}</div>`).join('');
}
async function openLead(id){
  const l=await j('/api/lead/'+id);
  $('#d-name').textContent=l.business_name;
  $('#d-grade').innerHTML=`<span class="badge ${l.grade??''}">${l.grade??'–'}</span> <span class="pill">${l.status}</span> <span class="pill">score ${l.novus_score??'—'}</span>`;
  let h='';
  h+=`<div style="color:var(--dim)">${esc(l.trade)} · ${esc(l.city)} · ${esc(l.email??'')} ${l.phone?'· '+esc(l.phone):''} ${l.instagram_handle?'· @'+esc(l.instagram_handle):''}</div>`;
  if(l.notes)h+=`<h4>Why they need us</h4><div>${esc(l.notes)}</div>`;
  if(l.preview_url)h+=`<h4>Preview <a href="${esc(l.preview_url)}" target="_blank" style="color:var(--acc)">open ↗</a> <span class="pill">${esc(l.template_used??'')}</span></h4><iframe src="${esc(l.preview_url)}" loading="lazy"></iframe>`;
  if(l.drafts){h+=`<h4>Email drafts</h4>`;for(const k of ['initial','followup2','followup3'])if(l.drafts[k])h+=`<pre><b>${k} — ${esc(l.drafts[k].subject)}</b>\n\n${esc(l.drafts[k].body)}</pre>`}
  if(l.selfcheck)h+=`<h4>Self-check</h4><pre>${esc(JSON.stringify(l.selfcheck,null,2))}</pre>`;
  if(l.audit)h+=`<h4>Audit</h4><pre>${esc(JSON.stringify(l.audit,null,2))}</pre>`;
  $('#d-body').innerHTML=h;$('#drawer').classList.add('open');
}
function closeDrawer(){$('#drawer').classList.remove('open')}
refresh();setInterval(refresh,30000);
</script>
</body></html>"""
