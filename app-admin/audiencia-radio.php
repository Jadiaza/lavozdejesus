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
.audience-shell{display:grid;gap:18px}
.audience-toolbar{display:flex;justify-content:space-between;align-items:end;gap:14px;flex-wrap:wrap}
.audience-toolbar h2{margin:0 0 4px}
.audience-toolbar p{margin:0;color:var(--muted)}
.audience-filters{display:flex;gap:8px;align-items:end;flex-wrap:wrap}
.audience-filters label{display:grid;gap:5px;font-size:12px;font-weight:800;color:#344054}
.audience-filters input,.audience-filters select{min-height:40px;border:1px solid rgba(15,23,42,.14);border-radius:9px;background:#fff;padding:7px 10px;font:inherit}
.audience-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
.audience-kpi{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px;box-shadow:0 5px 18px rgba(15,23,42,.05)}
.audience-kpi span{display:block;color:var(--muted);font-size:12px;font-weight:700}
.audience-kpi strong{display:block;margin-top:6px;font-size:28px;line-height:1;color:var(--navy)}
.audience-kpi small{display:block;margin-top:7px;color:#667085}
.audience-grid-main{display:grid;grid-template-columns:minmax(0,2.15fr) minmax(300px,1fr);gap:16px}
.audience-panel{background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 5px 18px rgba(15,23,42,.05);overflow:hidden}
.audience-map-card{padding:0!important}
.audience-map-stats{display:grid;grid-template-columns:1fr 1fr;text-align:center;padding:24px 18px 4px}
.audience-map-stat strong{display:block;font-size:38px;line-height:1;color:#4aa9d8;font-weight:500}
.audience-map-stat span{display:block;margin-top:8px;font-size:16px;color:#667085}
.audience-map-card #audience-map{min-height:360px;background:#fff}
.audience-map-card #audience-map svg{height:360px}
.audience-map-legend{display:flex;align-items:center;gap:10px;padding:0 28px 20px;color:#344054;font-size:13px}
.audience-map-gradient{height:14px;flex:0 1 180px;border-radius:2px;background:linear-gradient(90deg,#d9f0f8,#54b5dc,#168bc2)}
.audience-live-legend{padding:0 28px 18px;color:#667085;font-size:12px}
.audience-map-tooltip{position:absolute;display:none;padding:10px 13px;background:#fff;color:#111827;border:1px solid #cfd3d7;border-radius:4px;font-size:14px;box-shadow:0 4px 14px rgba(0,0,0,.12);pointer-events:none;z-index:3;min-width:130px}
.audience-map-stats{padding-top:20px}.audience-map-stat strong{font-size:32px}.audience-map-card #audience-map,.audience-map-card #audience-map svg{min-height:360px;height:360px}
.audience-panel-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:15px 17px;border-bottom:1px solid #edf0f4}
.audience-panel-head h3{margin:0;font-size:16px;color:var(--navy)}
.audience-panel-body{padding:16px}
#audience-map{min-height:390px;background:linear-gradient(180deg,#f7fbff,#fff);position:relative}
#audience-map svg{width:100%;height:390px;display:block}
.map-loading{display:grid;place-items:center;height:390px;color:var(--muted)}
.map-tooltip{position:absolute;display:none;padding:8px 10px;background:#071a33;color:#fff;border-radius:9px;font-size:12px;pointer-events:none;z-index:3}
.country-list,.city-list{display:grid;gap:8px}
.country-row{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:8px;align-items:center}
.country-row .flag{font-size:17px}
.country-row strong{font-size:13px;color:#344054}
.country-row small{display:block;color:var(--muted);font-size:11px}
.country-row b{font-size:13px;color:var(--navy)}
.bar{height:7px;background:#eef2f7;border-radius:999px;overflow:hidden;margin-top:5px}
.bar i{display:block;height:100%;background:#4aa3df;border-radius:999px}
.audience-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.chart{height:220px;display:flex;align-items:end;gap:5px;padding:10px 4px 0}
.chart-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:end;height:100%;gap:5px}
.chart-bar{width:100%;max-width:22px;border-radius:6px 6px 2px 2px;background:#4aa3df;min-height:3px}
.chart-label{font-size:10px;color:var(--muted)}
.live-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#19a463;box-shadow:0 0 0 4px rgba(25,164,99,.12);margin-right:7px}
.audience-table-wrap{overflow:auto}
.audience-table{width:100%;border-collapse:collapse;font-size:12px}
.audience-table th,.audience-table td{text-align:left;padding:10px 9px;border-bottom:1px solid #edf0f4;white-space:nowrap}
.audience-table th{color:#667085;background:#fafbfc;font-size:11px;text-transform:uppercase;letter-spacing:.03em}
.audience-table td{color:#344054}
.audience-table .status-active{color:#138a55;font-weight:800}
.audience-table .guest{color:#7a5a00}
.badge{display:inline-flex;align-items:center;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:800}
.badge-user{background:#eaf4ff;color:#1769aa}
.badge-guest{background:#fff6db;color:#8a6400}
.action-link{border:0;background:none;color:#1769aa;font-weight:800;cursor:pointer;padding:3px}
.audience-note{font-size:11px;color:var(--muted);line-height:1.55}
@media(max-width:1100px){.audience-kpis{grid-template-columns:repeat(3,1fr)}.audience-grid-main{grid-template-columns:1fr}}
@media(max-width:720px){.audience-kpis{grid-template-columns:repeat(2,1fr)}.audience-two{grid-template-columns:1fr}.audience-kpi strong{font-size:23px}}
</style>

<div class="audience-shell" id="radio-audience">
  <div class="audience-toolbar">
    <div>
      <h2>Radio · Audiencia</h2>
      <p>Mapa mundial, oyentes en tiempo real y comportamiento de escucha.</p>
    </div>
    <div class="audience-filters">
      <label>Desde<input id="aud-from" type="date"></label>
      <label>Hasta<input id="aud-to" type="date"></label>
      <button class="btn btn-gold" id="aud-apply" type="button">Aplicar</button>
      <button class="btn btn-soft" id="aud-refresh" type="button">Actualizar</button>
    </div>
  </div>

  <section class="audience-kpis">
    <article class="audience-kpi"><span>🟢 Oyentes conectados</span><strong id="kpi-connected">—</strong><small>Actividad en los últimos 2 minutos</small></article>
    <article class="audience-kpi"><span>👥 Oyentes únicos</span><strong id="kpi-unique">—</strong><small id="kpi-unique-detail">Registrados + invitados</small></article>
    <article class="audience-kpi"><span>▶ Sesiones</span><strong id="kpi-sessions">—</strong><small>Inicios de reproducción</small></article>
    <article class="audience-kpi"><span>⏱ Tiempo promedio</span><strong id="kpi-duration">—</strong><small>Duración de escucha</small></article>
    <article class="audience-kpi"><span>🌎 Países</span><strong id="kpi-countries">—</strong><small>Con audiencia registrada</small></article>
  </section>

  <div class="audience-grid-main">
    <section class="audience-panel audience-map-card">
      <div class="audience-map-stats">
        <div class="audience-map-stat"><strong id="map-country-count">0</strong><span>Países conectados</span></div>
        <div class="audience-map-stat"><strong id="map-listener-count">0</strong><span>Oyentes conectados</span></div>
      </div>
      <div class="audience-panel-body" id="audience-map"><div class="map-loading">Cargando mapa…</div><div class="audience-map-tooltip" id="map-tooltip"></div></div>
      <div class="audience-map-legend"><span>1</span><div class="audience-map-gradient"></div><span id="map-max-value">0</span></div>
      <div class="audience-live-legend">● Oyentes conectados · <strong id="map-live-count">0</strong> ubicados aproximadamente · <span>Ubicación aproximada · no se almacena la IP original</span></div>
    </section>
    <section class="audience-panel">
      <div class="audience-panel-head"><h3>Top países</h3><span class="audience-note" id="country-range"></span></div>
      <div class="audience-panel-body"><div class="country-list" id="country-list"></div></div>
    </section>
  </div>

  <div class="audience-two">
    <section class="audience-panel">
      <div class="audience-panel-head"><h3>Sesiones por hora</h3></div>
      <div class="audience-panel-body"><div class="chart" id="hourly-chart"></div></div>
    </section>
    <section class="audience-panel">
      <div class="audience-panel-head"><h3>Principales ciudades</h3></div>
      <div class="audience-panel-body"><div class="country-list" id="city-list"></div></div>
    </section>
  </div>

  <section class="audience-panel">
    <div class="audience-panel-head">
      <h3><span class="live-dot"></span>Oyentes en tiempo real</h3>
      <button class="btn btn-soft" id="aud-live-refresh" type="button">Actualizar lista</button>
    </div>
    <div class="audience-table-wrap">
      <table class="audience-table"><thead><tr><th>Oyente</th><th>Tipo</th><th>Ubicación</th><th>Dispositivo</th><th>Navegador</th><th>Inicio</th><th>Estado</th><th></th></tr></thead>
      <tbody id="live-body"><tr><td colspan="8" style="text-align:center;padding:28px;color:#667085">Cargando…</td></tr></tbody></table>
    </div>
  </section>

  <section class="audience-panel">
    <div class="audience-panel-head">
      <div><h3>Historial de sesiones</h3><div class="audience-note">Los usuarios registrados se relacionan con <code>lvj_com_usuarios</code>; los invitados permanecen anónimos.</div></div>
      <div><button class="btn btn-soft" id="aud-export" type="button">Exportar CSV</button></div>
    </div>
    <div class="audience-table-wrap">
      <table class="audience-table"><thead><tr><th>Fecha</th><th>Usuario / sesión</th><th>Tipo</th><th>País</th><th>Ciudad</th><th>Dispositivo</th><th>Duración</th><th>Estado</th></tr></thead>
      <tbody id="session-body"><tr><td colspan="8" style="text-align:center;padding:28px;color:#667085">Cargando…</td></tr></tbody></table>
    </div>
  </section>

  <p class="audience-note">Privacidad: el módulo registra una huella técnica de la sesión y un hash de IP para evitar almacenar la IP original. La ubicación depende de los encabezados de geolocalización disponibles en el servidor.</p>
</div>

<script type="module">
const root = document.getElementById("radio-audience");
const API = <?php echo json_encode($apiUrl); ?>;
const state = { summary:null, sessions:[] };

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
  const body=document.getElementById("live-body");
  if(!rows.length){body.innerHTML="<tr><td colspan='8' style='text-align:center;padding:28px;color:#667085'>No hay oyentes conectados en este momento.</td></tr>";return;}
  body.innerHTML=rows.map((x,i)=>{
    const name=x.usuario_nombre||"Oyente invitado";
    const type=x.usuario_id?"Registrado":"Invitado";
    const loc=[x.ciudad,x.pais].filter(Boolean).join(", ")||"Ubicación no disponible";
    return `<tr><td><strong>${esc(name)}</strong></td><td><span class="badge ${x.usuario_id?'badge-user':'badge-guest'}">${type}</span></td><td>${esc(loc)}</td><td>${esc(x.dispositivo||"—")}</td><td>${esc(x.navegador||"—")}</td><td>${esc(x.inicio_at||"—")}</td><td class="status-active">● Conectado</td><td><button class="action-link" data-detail="${Number(x.id)}">Ver</button></td></tr>`;
  }).join("");
  body.querySelectorAll("[data-detail]").forEach(btn=>btn.addEventListener("click",()=>showDetail(btn.dataset.detail)));
}

function renderSessions(rows){
  state.sessions=rows||[];
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
    const projection=d3.geoNaturalEarth1().rotate([58,0]).scale(560).translate([600,205]);
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