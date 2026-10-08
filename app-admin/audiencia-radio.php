<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pageTitle = 'Audiencia de Radio';
$pageSubtitle = 'Personas que escuchan La Voz de Jesús · registrados e invitados';
$apiUrl = '../api/radio-audience.php';
require __DIR__ . '/includes/header.php';
?>

<style>
:root{--aud-blue:#35a8d8;--aud-blue-dark:#168bc2;--aud-gold:#e4b33c;--aud-navy:#10233f;--aud-green:#18a76a;--aud-soft:#f5f8fb}
.audience-shell{display:grid;gap:16px;background:linear-gradient(180deg,#f7f9fc 0,#f4f7fa 100%);padding:4px 0 24px}
.audience-toolbar{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;padding:4px 2px}
.audience-toolbar h2{margin:0;color:var(--aud-navy);font-size:24px;letter-spacing:-.02em}
.audience-toolbar p{margin:4px 0 0;color:#667085;font-size:13px}
.audience-filters{display:flex;gap:8px;align-items:end;flex-wrap:wrap}
.audience-filters label{display:grid;gap:4px;font-size:10px;font-weight:800;color:#475467;text-transform:uppercase}
.audience-filters input,.audience-filters select{min-height:38px;border:1px solid #d9e0e8;border-radius:8px;background:#fff;padding:7px 10px;font:inherit;color:#344054}
.audience-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
.audience-kpi{position:relative;background:#fff;border:1px solid #e6ebf1;border-radius:13px;padding:15px 16px;box-shadow:0 3px 12px rgba(16,35,63,.05);overflow:hidden}
.audience-kpi:after{content:"";position:absolute;left:0;bottom:0;width:100%;height:3px;background:linear-gradient(90deg,var(--aud-blue),#9bdcf2)}
.audience-kpi:nth-child(1):after{background:linear-gradient(90deg,#16a46c,#7ad9af)}
.audience-kpi:nth-child(3):after{background:linear-gradient(90deg,#8a63d2,#c7b5f3)}
.audience-kpi:nth-child(4):after{background:linear-gradient(90deg,#e5ad2f,#f5d77b)}
.audience-kpi:nth-child(5):after{background:linear-gradient(90deg,#35a8d8,#9bdcf2)}
.audience-kpi .kpi-icon{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;background:#eaf7fc;color:var(--aud-blue-dark);font-size:16px;float:left;margin-right:10px}
.audience-kpi:nth-child(1) .kpi-icon{background:#e9f8f1;color:#16945f}.audience-kpi:nth-child(3) .kpi-icon{background:#f0eafb;color:#8057c7}.audience-kpi:nth-child(4) .kpi-icon{background:#fff5da;color:#b47d00}
.audience-kpi span{display:block;color:#667085;font-size:11px;font-weight:700;margin-top:2px}
.audience-kpi strong{display:block;margin-top:8px;font-size:29px;line-height:1;color:var(--aud-navy);letter-spacing:-.03em}
.audience-kpi small{display:block;margin-top:7px;color:#98a2b3;font-size:10px}
.audience-panel{background:#fff;border:1px solid #e5eaf0;border-radius:15px;box-shadow:0 4px 16px rgba(16,35,63,.05);overflow:hidden}
.audience-grid-main{display:grid;grid-template-columns:minmax(0,2.15fr) minmax(310px,1fr);gap:14px}
.audience-map-card{padding:0!important}
.audience-map-head{display:flex;justify-content:space-between;align-items:center;padding:15px 18px 8px}
.audience-map-head h3{margin:0;color:var(--aud-navy);font-size:16px}
.audience-map-head .map-live-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;background:#e9f8f1;color:#168b59;font-size:10px;font-weight:800}
.audience-map-head .map-live-pill i{width:7px;height:7px;border-radius:50%;background:#16a46c;box-shadow:0 0 0 4px rgba(22,164,108,.12)}
.audience-map-stats{display:grid;grid-template-columns:1fr 1fr;text-align:center;padding:9px 18px 0}
.audience-map-stat strong{display:block;font-size:31px;line-height:1;color:var(--aud-blue);font-weight:600}
.audience-map-stat span{display:block;margin-top:5px;font-size:13px;color:#667085}
.audience-map-card #audience-map{min-height:360px;background:linear-gradient(180deg,#fafdff,#fff)}
.audience-map-card #audience-map svg{height:360px}
.audience-map-legend{display:flex;align-items:center;gap:10px;padding:0 20px 12px;color:#475467;font-size:11px}
.audience-map-gradient{height:10px;flex:0 1 160px;border-radius:5px;background:linear-gradient(90deg,#d9f0f8,#54b5dc,#168bc2)}
.audience-live-legend{padding:0 20px 15px;color:#98a2b3;font-size:10px}
.audience-map-tooltip{position:absolute;display:none;padding:9px 11px;background:#10233f;color:#fff;border-radius:8px;font-size:11px;box-shadow:0 5px 15px rgba(0,0,0,.16);pointer-events:none;z-index:3;min-width:130px}
.audience-panel-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:14px 16px;border-bottom:1px solid #edf0f4}
.audience-panel-head h3{margin:0;font-size:15px;color:var(--aud-navy)}
.audience-panel-body{padding:15px}
.audience-range{font-size:10px;color:#98a2b3}
.country-list,.city-list{display:grid;gap:9px}
.country-row{display:grid;grid-template-columns:27px minmax(0,1fr) auto;gap:8px;align-items:center}
.country-row .flag{font-size:15px}
.country-row strong{font-size:12px;color:#344054}
.country-row small{display:block;color:#98a2b3;font-size:10px}
.country-row b{font-size:12px;color:var(--aud-navy)}
.bar{height:6px;background:#eef2f6;border-radius:999px;overflow:hidden;margin-top:5px}
.bar i{display:block;height:100%;background:linear-gradient(90deg,#67c3e5,#258fbe);border-radius:999px}
.audience-two{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:14px}
.audience-mini-card{min-width:0}
.chart{height:205px;display:flex;align-items:end;gap:4px;padding:10px 4px 0}
.chart-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:end;height:100%;gap:5px}
.chart-bar{width:100%;max-width:19px;border-radius:5px 5px 2px 2px;background:linear-gradient(180deg,#63c1e4,#2995c5);min-height:3px}
.chart-label{font-size:9px;color:#98a2b3}
.metric-bars{display:grid;gap:13px;padding:4px 0}
.metric-item{display:grid;grid-template-columns:88px 1fr 30px;gap:8px;align-items:center;font-size:11px;color:#475467}
.metric-item .metric-track{height:8px;background:#eef2f6;border-radius:99px;overflow:hidden}
.metric-item .metric-fill{height:100%;background:#35a8d8;border-radius:99px}
.metric-item b{text-align:right;color:var(--aud-navy)}
.audience-live-header{display:flex;align-items:center;gap:10px}
.live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#19a463;box-shadow:0 0 0 4px rgba(25,164,99,.12)}
.live-count-pill{background:#e9f8f1;color:#168b59;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:800}
.audience-table-wrap{overflow:auto}
.audience-table{width:100%;border-collapse:collapse;font-size:11px}
.audience-table th,.audience-table td{text-align:left;padding:10px 9px;border-bottom:1px solid #edf0f4;white-space:nowrap}
.audience-table th{color:#667085;background:#fafbfc;font-size:9px;text-transform:uppercase;letter-spacing:.04em}
.audience-table td{color:#344054}
.audience-table .status-active{color:#138a55;font-weight:800}
.badge{display:inline-flex;align-items:center;border-radius:999px;padding:4px 8px;font-size:9px;font-weight:800}
.badge-user{background:#eaf4ff;color:#1769aa}.badge-guest{background:#fff6db;color:#8a6400}
.action-link{border:0;background:none;color:#1769aa;font-weight:800;cursor:pointer;padding:3px}
.audience-note{font-size:10px;color:#98a2b3;line-height:1.5}
.session-filters{display:flex;align-items:center;gap:7px}
.audience-empty{padding:26px;text-align:center;color:#98a2b3;font-size:12px}
@media(max-width:1180px){.audience-kpis{grid-template-columns:repeat(3,1fr)}.audience-two{grid-template-columns:1fr 1fr}.audience-grid-main{grid-template-columns:1fr}}
@media(max-width:760px){.audience-shell{gap:12px}.audience-toolbar{align-items:flex-start}.audience-toolbar h2{font-size:21px}.audience-kpis{grid-template-columns:repeat(2,1fr);gap:9px}.audience-kpi{padding:12px}.audience-kpi strong{font-size:24px}.audience-kpi .kpi-icon{width:28px;height:28px;font-size:14px}.audience-two{grid-template-columns:1fr}.audience-map-card #audience-map,.audience-map-card #audience-map svg{min-height:320px;height:320px}.audience-map-stat strong{font-size:28px}}
</style>

<div class="audience-shell" id="radio-audience">
  <div class="audience-toolbar">
    <div>
      <h2>Radio / Audiencia</h2>
      <p>Desde dónde nos escuchan · descubre cómo La Voz de Jesús llega al mundo.</p>
    </div>
    <div class="audience-filters">
      <label>Desde<input id="aud-from" type="date"></label>
      <label>Hasta<input id="aud-to" type="date"></label>
      <button class="btn btn-gold" id="aud-apply" type="button">Aplicar</button>
      <button class="btn btn-soft" id="aud-refresh" type="button">Actualizar</button>
    </div>
  </div>

  <section class="audience-kpis">
    <article class="audience-kpi"><div class="kpi-icon">👥</div><span>Oyentes ahora</span><strong id="kpi-connected">—</strong><small>Conectados en este momento</small></article>
    <article class="audience-kpi"><div class="kpi-icon">🌎</div><span>Oyentes únicos</span><strong id="kpi-unique">—</strong><small id="kpi-unique-detail">Registrados + invitados</small></article>
    <article class="audience-kpi"><div class="kpi-icon">▶</div><span>Sesiones hoy</span><strong id="kpi-sessions">—</strong><small>Inicios de reproducción</small></article>
    <article class="audience-kpi"><div class="kpi-icon">◷</div><span>Tiempo promedio</span><strong id="kpi-duration">—</strong><small>Duración de escucha</small></article>
    <article class="audience-kpi"><div class="kpi-icon">🌐</div><span>Países</span><strong id="kpi-countries">—</strong><small>Con audiencia registrada</small></article>
  </section>

  <div class="audience-grid-main">
    <section class="audience-panel audience-map-card">
      <div class="audience-map-head">
        <h3>Audiencia en el mundo</h3>
        <span class="map-live-pill"><i></i><span id="map-live-pill-text">0 conectados</span></span>
      </div>
      <div class="audience-map-stats">
        <div class="audience-map-stat"><strong id="map-country-count">0</strong><span>Países conectados</span></div>
        <div class="audience-map-stat"><strong id="map-listener-count">0</strong><span>Oyentes conectados</span></div>
      </div>
      <div class="audience-panel-body" id="audience-map"><div class="map-loading">Cargando mapa…</div><div class="audience-map-tooltip" id="map-tooltip"></div></div>
      <div class="audience-map-legend"><span>1</span><div class="audience-map-gradient"></div><span id="map-max-value">0</span></div>
      <div class="audience-live-legend">● Oyentes conectados · <strong id="map-live-count">0</strong> ubicados aproximadamente · Ubicación aproximada, no se almacena la IP original.</div>
    </section>

    <section class="audience-panel">
      <div class="audience-panel-head"><h3>Top países</h3><span class="audience-range" id="country-range"></span></div>
      <div class="audience-panel-body"><div class="country-list" id="country-list"></div></div>
    </section>
  </div>

  <div class="audience-two">
    <section class="audience-panel audience-mini-card">
      <div class="audience-panel-head"><h3>Oyentes por hora</h3><span class="audience-range">Hoy</span></div>
      <div class="audience-panel-body"><div class="chart" id="hourly-chart"></div></div>
    </section>

    <section class="audience-panel audience-mini-card">
      <div class="audience-panel-head"><h3>Principales ciudades</h3></div>
      <div class="audience-panel-body"><div class="country-list" id="city-list"></div></div>
    </section>

    <section class="audience-panel audience-mini-card">
      <div class="audience-panel-head"><h3>Dispositivos</h3></div>
      <div class="audience-panel-body"><div class="metric-bars" id="device-stats"></div></div>
    </section>
  </div>

  <section class="audience-panel">
    <div class="audience-panel-head">
      <div class="audience-live-header"><span class="live-dot"></span><h3>Oyentes en tiempo real</h3><span class="live-count-pill" id="live-count-pill">0 conectados ahora</span></div>
      <button class="btn btn-soft" id="aud-live-refresh" type="button">Actualizar</button>
    </div>
    <div class="audience-table-wrap">
      <table class="audience-table"><thead><tr><th>#</th><th>Oyente</th><th>Tipo</th><th>Ubicación</th><th>Dispositivo</th><th>Navegador</th><th>Conectado hace</th><th>Estado</th><th></th></tr></thead>
      <tbody id="live-body"><tr><td colspan="9"><div class="audience-empty">Cargando…</div></td></tr></tbody></table>
    </div>
  </section>

  <section class="audience-panel">
    <div class="audience-panel-head">
      <div><h3>Historial de sesiones</h3><div class="audience-note">Usuarios registrados relacionados con <code>lvj_com_usuarios</code>; invitados permanecen anónimos.</div></div>
      <button class="btn btn-soft" id="aud-export" type="button">Exportar CSV</button>
    </div>
    <div class="audience-table-wrap">
      <table class="audience-table"><thead><tr><th>Fecha</th><th>Usuario / sesión</th><th>Tipo</th><th>País</th><th>Ciudad</th><th>Dispositivo</th><th>Duración</th><th>Estado</th></tr></thead>
      <tbody id="session-body"><tr><td colspan="8"><div class="audience-empty">Cargando…</div></td></tr></tbody></table>
    </div>
  </section>

  <p class="audience-note">Privacidad: el módulo registra una huella técnica de la sesión y un hash de IP para evitar almacenar la IP original. La ubicación depende de la geolocalización disponible en el servidor.</p>
</div>

<script type="module">
const root = document.getElementById("radio-audience");
const API = <?php echo json_encode($apiUrl); ?>;
const state = { summary:null, sessions:[], live:[] };

const today = new Date();
const iso = d => d.toISOString().slice(0,10);
const from = document.getElementById("aud-from");
const to = document.getElementById("aud-to");
from.value = iso(today); to.value = iso(today);

const fmt = n => new Intl.NumberFormat("es-CO").format(Number(n || 0));
const duration = mins => {
  const value = Number(mins || 0);
  if (value < 1) return Math.round(value * 60) + " s";
  const h = Math.floor(value / 60);
  const m = Math.round(value % 60);
  return h ? h + " h " + m + " min" : m + " min";
};
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

async function getJson(url){
  const response = await fetch(url, {cache:"no-store"});
  const data = await response.json();
  if(!response.ok || data.success === false) throw new Error(data.message || data.error || "No fue posible consultar la audiencia.");
  return data;
}

function renderSummary(data){
  state.summary=data;
  document.getElementById("kpi-connected").textContent=fmt(data.connected);
  document.getElementById("kpi-unique").textContent=fmt(data.unique_today);
  document.getElementById("kpi-unique-detail").textContent="Registrados "+fmt(data.registered_unique)+" · Invitados "+fmt(data.guest_unique);
  document.getElementById("kpi-sessions").textContent=fmt(data.sessions_today);
  document.getElementById("kpi-duration").textContent=duration(data.avg_duration_minutes);
  document.getElementById("kpi-countries").textContent=fmt(data.countries_count);
  document.getElementById("country-range").textContent=from.value===to.value?from.value:"Periodo seleccionado";

  const countries=(data.countries||[]).map(x=>({...x,pais:({CO:"Colombia",US:"Estados Unidos",MX:"México",PE:"Perú",BR:"Brasil",AR:"Argentina",CL:"Chile",EC:"Ecuador",PA:"Panamá",VE:"Venezuela",ES:"España",CA:"Canadá"}[String(x.pais||"").toUpperCase()] || x.pais)}));
  const max=Math.max(1,...countries.map(x=>Number(x.oyentes||0)));
  document.getElementById("country-list").innerHTML=countries.length?countries.map((x,i)=>`
    <div class="country-row"><span class="flag">🌐</span><div><strong>${esc(x.pais)}</strong><div class="bar"><i style="width:${Math.max(3,Math.round(Number(x.oyentes||0)/max*100))}%"></i></div></div><b>${fmt(x.oyentes)}</b></div>`).join(""):"<div class='audience-note'>Todavía no hay datos para este periodo.</div>";

  const cities=data.cities||[];
  const cityMax=Math.max(1,...cities.map(x=>Number(x.oyentes||0)));
  document.getElementById("city-list").innerHTML=cities.length?cities.slice(0,12).map(x=>`
    <div class="country-row"><span class="flag">📍</span><div><strong>${esc(x.ciudad)}</strong><small>${esc(x.pais||"")}</small><div class="bar"><i style="width:${Math.max(3,Math.round(Number(x.oyentes||0)/cityMax*100))}%"></i></div></div><b>${fmt(x.oyentes)}</b></div>`).join(""):"<div class='audience-note'>No hay ciudades disponibles.</div>";

  const hours=data.hourly||Array(24).fill(0), maxHour=Math.max(1,...hours);
  document.getElementById("hourly-chart").innerHTML=hours.map((v,h)=>`
    <div class="chart-col" title="${h}:00 · ${fmt(v)} sesiones"><div class="chart-bar" style="height:${Math.max(3,Math.round(Number(v||0)/maxHour*170))}px"></div><span class="chart-label">${String(h).padStart(2,"0")}</span></div>`).join("");
}

function renderLive(rows){
  state.live=rows||[];
  const body=document.getElementById("live-body");
  const pill=document.getElementById("live-count-pill");
  const mapPill=document.getElementById("map-live-pill-text");
  pill.textContent=fmt(state.live.length)+(state.live.length===1?" conectado ahora":" conectados ahora");
  mapPill.textContent=fmt(state.live.length)+(state.live.length===1?" conectado":" conectados");
  if(!state.live.length){
    body.innerHTML="<tr><td colspan='9'><div class='audience-empty'>No hay oyentes conectados en este momento.</div></td></tr>";
    return;
  }
  const now=Date.now();
  body.innerHTML=state.live.map((x,i)=>{
    const name=x.usuario_nombre||"Oyente invitado";
    const type=x.usuario_id?"Registrado":"Invitado";
    const loc=[x.ciudad,x.pais].filter(Boolean).join(", ")||"Ubicación no disponible";
    const started=new Date(String(x.inicio_at||"").replace(" ","T")+"Z").getTime();
    const mins=Number.isFinite(started)?Math.max(0,Math.floor((now-started)/60000)):0;
    return `<tr><td><strong>${i+1}</strong></td><td><strong>${esc(name)}</strong></td><td><span class="badge ${x.usuario_id?'badge-user':'badge-guest'}">${type}</span></td><td>${esc(loc)}</td><td>${esc(x.dispositivo||"—")}</td><td>${esc(x.navegador||"—")}</td><td>${mins<1?"Ahora":mins+" min"}</td><td class="status-active">● Conectado</td><td><button class="action-link" data-detail="${Number(x.id)}">Ver</button></td></tr>`;
  }).join("");
  body.querySelectorAll("[data-detail]").forEach(btn=>btn.addEventListener("click",()=>showDetail(btn.dataset.detail)));
}

function renderDeviceStats(rows){
  const host=document.getElementById("device-stats");
  const counts={};
  (rows||[]).forEach(x=>{const key=x.dispositivo||"Otro";counts[key]=(counts[key]||0)+1;});
  const items=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const total=Math.max(1,(rows||[]).length);
  host.innerHTML=items.length?items.map(([name,count])=>`<div class="metric-item"><span>${esc(name)}</span><div class="metric-track"><div class="metric-fill" style="width:${Math.round(count/total*100)}%"></div></div><b>${Math.round(count/total*100)}%</b></div>`).join(""):"<div class='audience-empty'>Sin datos</div>";
}

function renderSessions(rows){
  state.sessions=rows||[];
  renderDeviceStats(state.sessions);
  const body=document.getElementById("session-body");
  if(!state.sessions.length){body.innerHTML="<tr><td colspan='8' style='text-align:center;padding:28px;color:#667085'>No hay sesiones para el periodo seleccionado.</td></tr>";return;}
  body.innerHTML=state.sessions.map(x=>{
    const name=x.usuario_nombre||("Sesión "+String(x.id));
    const type=x.usuario_id?"Registrado":"Invitado";
    const status=x.estado==="activo"||x.estado==="pausado"?"En curso":x.estado;
    const mins=Math.round(Number(x.duracion_segundos||0)/60);
    return `<tr><td>${esc(x.inicio_at)}</td><td><strong>${esc(name)}</strong></td><td><span class="badge ${x.usuario_id?'badge-user':'badge-guest'}">${type}</span></td><td>${esc(x.pais||"—")}</td><td>${esc(x.ciudad||"—")}</td><td>${esc(x.dispositivo||"—")}</td><td>${mins?duration(mins):"—"}</td><td>${esc(status)}</td></tr>`;
  }).join("");
}

async function load(){
  try{
    const params=new URLSearchParams({action:"summary",from:from.value,to:to.value,minutes:"2"});
    const data=await getJson(API+"?"+params);
    renderSummary(data);
    const sessions=await getJson(API+"?action=sessions&from="+encodeURIComponent(from.value)+"&to="+encodeURIComponent(to.value)+"&limit=100");
    renderSessions(sessions.sessions||[]);
    const live = await loadLive();
    await drawMap(data.countries||[], live);
  }catch(error){
    console.error(error);
    document.getElementById("country-list").innerHTML="<div class='audience-note'>Error al cargar la audiencia.</div>";
  }
}

async function loadLive(){
  try{
    const data=await getJson(API+"?action=sessions&from="+encodeURIComponent(iso(new Date(Date.now()-86400000)))+"&to="+encodeURIComponent(iso(new Date()))+"&limit=200");
    const cutoff=Date.now()-2*60*1000;
    const live=(data.sessions||[]).filter(x=>x.ultima_actividad_at && new Date(String(x.ultima_actividad_at).replace(" ","T")+"Z").getTime()>=cutoff && x.estado === "activo");
    renderLive(live);
    if (state.summary) await drawMap(state.summary.countries||[], live);
    return live;
  }catch(error){
    console.error(error);
    return [];
  }
}

async function showDetail(id){
  try{
    const data=await getJson(API+"?action=session&id="+encodeURIComponent(id));
    const s=data.session;
    const events=(data.events||[]).map(e=>`<li><strong>${esc(e.evento)}</strong> · ${esc(e.fecha_at)}</li>`).join("");
    alert("Sesión #"+s.id+"\n"+(s.usuario_nombre||"Oyente invitado")+"\n"+[s.ciudad,s.pais].filter(Boolean).join(", ")+"\n\nEventos:\n"+(data.events||[]).map(e=>e.evento+" · "+e.fecha_at).join("\n"));
  }catch(error){alert(error.message);}
}

async function drawMap(countries, liveRows=[]){
  const host=document.getElementById("audience-map");
  try{
    const [d3,topojson,world]=await Promise.all([
      import("https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm"),
      import("https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm"),
      import("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json/+esm")
    ]);

    const liveCountries = {};
    (liveRows || []).forEach(row => {
      const raw = String(row.pais || "").trim();
      if (!raw) return;
      const key = raw.toUpperCase();
      liveCountries[key] = (liveCountries[key] || 0) + 1;
    });
    const mapCountries = Object.entries(liveCountries).map(([pais, oyentes]) => ({pais, oyentes}));
    const countryCount = mapCountries.length;
    const totalListeners = (liveRows || []).length;
    const maxListeners = Math.max(1,...mapCountries.map(row=>Number(row.oyentes||0)));
    document.getElementById("map-country-count").textContent=fmt(countryCount);
    document.getElementById("map-listener-count").textContent=fmt(totalListeners);
    document.getElementById("map-max-value").textContent=fmt(maxListeners);

    host.innerHTML='<svg viewBox="0 0 1200 400" aria-label="Mapa mundial de audiencia"></svg><div class="audience-map-tooltip" id="map-tooltip"></div>';
    const svg=d3.select(host).select("svg");
    const geo=topojson.feature(world,world.objects.countries);
    const projection=d3.geoNaturalEarth1().scale(190).translate([600,200]);
    const path=d3.geoPath(projection);

    const byCode={
      "Colombia":"CO","United States":"US","Estados Unidos":"US","Mexico":"MX","México":"MX",
      "Honduras":"HN","El Salvador":"SV","Canada":"CA","Canadá":"CA","Spain":"ES","España":"ES",
      "Peru":"PE","Perú":"PE","Chile":"CL","Argentina":"AR","Brazil":"BR","Brasil":"BR",
      "Ecuador":"EC","Panama":"PA","Panamá":"PA","Venezuela":"VE","Costa Rica":"CR",
      "Dominican Republic":"DO","Guatemala":"GT","Nicaragua":"NI"
    };

    const valuesByCode={};
    mapCountries.forEach(row=>{
      const raw=String(row.pais||"").trim();
      const code=raw.length===2 ? raw.toUpperCase() : (byCode[raw] || raw);
      if(code) valuesByCode[code]=Number(row.oyentes||0);
    });

    const color=d3.scaleLinear()
      .domain([0,maxListeners])
      .range(["#e7f5fb","#35a8d8"]);

    svg.selectAll("path")
      .data(geo.features)
      .join("path")
      .attr("d",path)
      .attr("fill",feature=>{
        const name=String(feature.properties?.name||"");
        const code=(feature.properties?.iso_a2 || feature.properties?.ISO_A2 || feature.properties?.iso2 || byCode[name] || name).toString().toUpperCase();
        const value=valuesByCode[code] || 0;
        return value>0 ? color(value) : "#f4f5f6";
      })
      .attr("stroke","#d5d8dc")
      .attr("stroke-width",".7")
      .style("cursor","pointer");

    const tip=host.querySelector("#map-tooltip");
    svg.selectAll("path")
      .on("click",(event,feature)=>{
        const name=String(feature.properties?.name||"");
        const code=(feature.properties?.iso_a2 || feature.properties?.ISO_A2 || feature.properties?.iso2 || byCode[name] || name).toString().toUpperCase();
        const value=valuesByCode[code] || 0;
        if(!value) return;
        tip.style.display="block";
        tip.style.left=(event.offsetX+12)+"px";
        tip.style.top=(event.offsetY+12)+"px";
        tip.innerHTML="<strong>"+esc(name)+"</strong><br>Oyentes: <b>"+fmt(value)+"</b>";
      });

    const mappedLive=liveRows.filter(row=>Number.isFinite(Number(row.latitud)) && Number.isFinite(Number(row.longitud)));
    const liveLayer=svg.append("g").attr("aria-label","Oyentes conectados");

    mappedLive.forEach(row=>{
      const projected=projection([Number(row.longitud),Number(row.latitud)]);
      if(!projected) return;
      const [x,y]=projected;
      const name=row.usuario_nombre||"Oyente invitado";
      const type=row.usuario_id?"Registrado":"Invitado";
      const location=[row.ciudad,row.pais].filter(Boolean).join(", ")||"Ubicación aproximada";

      liveLayer.append("circle")
        .attr("cx",x).attr("cy",y).attr("r",5.5)
        .attr("fill",row.usuario_id?"#1769aa":"#d19a00")
        .attr("stroke","#fff").attr("stroke-width","1.5")
        .style("cursor","pointer")
        .on("click",(event)=>{
          tip.style.display="block";
          tip.style.left=(event.offsetX+12)+"px";
          tip.style.top=(event.offsetY+12)+"px";
          tip.innerHTML="<strong>"+esc(name)+"</strong><br>"+esc(type)+"<br>"+esc(location)+"<br><small>Ubicación aproximada</small>";
        });
    });

    document.getElementById("map-live-count").textContent=fmt(mappedLive.length);
    document.getElementById("map-live-pill-text").textContent=fmt(liveRows.length)+(liveRows.length===1?" conectado":" conectados");
    document.getElementById("live-count-pill").textContent=fmt(liveRows.length)+(liveRows.length===1?" conectado ahora":" conectados ahora");
  }catch(error){
    host.innerHTML='<div class="map-loading">Mapa no disponible. La tabla de países sigue funcionando.</div>';
    console.error(error);
  }
}

function exportCsv(){
  const headers=["Fecha","Usuario","Tipo","País","Ciudad","Dispositivo","Sistema","Navegador","Duración","Estado"];
  const lines=[headers,...state.sessions.map(x=>[x.inicio_at,x.usuario_nombre||"Oyente invitado",x.usuario_id?"Registrado":"Invitado",x.pais||"",x.ciudad||"",x.dispositivo||"",x.sistema_operativo||"",x.navegador||"",x.duracion_segundos||0,x.estado])];
  const csv=lines.map(row=>row.map(v=>'"'+String(v??"").replaceAll('"','""')+'"').join(",")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="audiencia-radio-"+from.value+"-"+to.value+".csv"; a.click(); URL.revokeObjectURL(url);
}

document.getElementById("aud-apply").addEventListener("click",load);
document.getElementById("aud-refresh").addEventListener("click",load);
document.getElementById("aud-live-refresh").addEventListener("click",loadLive);
document.getElementById("aud-export").addEventListener("click",exportCsv);
load();
setInterval(loadLive,60000);
</script>

<?php require __DIR__ . '/includes/footer.php'; ?>