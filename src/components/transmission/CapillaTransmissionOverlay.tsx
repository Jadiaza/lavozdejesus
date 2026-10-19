import { useEffect, useState } from "react";
import Hls from "hls.js";
type Intention = { id: number | string; peticion: string; categoria?: string };
type Config = { active?: boolean; mode?: string; playback_url?: string; position?: string; seconds?: number; intentions?: Intention[] };
export default function CapillaTransmissionOverlay() {
 const [cfg,setCfg]=useState<Config|null>(null); const [idx,setIdx]=useState(0);
 useEffect(()=>{let live=true;const load=async()=>{try{const r=await fetch("/api/transmisiones-capa.php",{cache:"no-store"});const d=await r.json();if(live&&r.ok)setCfg(d)}catch{if(live)setCfg(null)}};void load();const t=window.setInterval(load,15000);return()=>{live=false;window.clearInterval(t)}},[]);
 const items=cfg?.intentions??[];
 useEffect(()=>{setIdx(0);if(cfg?.mode!=="intenciones"||items.length<2)return;const t=window.setInterval(()=>setIdx(i=>(i+1)%items.length),Math.max(5,cfg.seconds??5)*1000);return()=>window.clearInterval(t)},[cfg?.mode,cfg?.seconds,items]);
 if(!cfg?.active||cfg.mode==="desactivada")return null;
 const pos=cfg.position==="superior_izquierda"?"top-24 left-4":cfg.position==="superior_derecha"?"top-24 right-4":cfg.position==="inferior_izquierda"?"bottom-24 left-4":"bottom-24 right-4";
 return <aside aria-label="Capa de transmisión LVJPRAYER" className={`fixed z-[80] ${pos} w-[min(88vw,340px)] sm:w-[min(32vw,410px)]`}>{cfg.mode==="video"&&cfg.playback_url?<OverlayVideo src={cfg.playback_url}/>:cfg.mode==="intenciones"&&items.length>0?<div className="rounded-2xl border border-amber-300 bg-[#07182a]/90 p-4 text-white shadow-2xl backdrop-blur-md"><div className="mb-3 text-center font-serif text-lg text-amber-300">♥ Unámonos en oración</div><div className="rounded-xl border border-amber-300/80 p-3" aria-live="polite"><div className="mb-2 text-xs uppercase tracking-widest text-amber-200">{items[idx]?.categoria||"Intención de oración"}</div><p className="line-clamp-4 font-serif text-sm leading-relaxed">{items[idx]?.peticion}</p></div></div>:null}</aside>;
}
function OverlayVideo({src}:{src:string}) {
 const [node,setNode]=useState<HTMLVideoElement|null>(null);
 useEffect(()=>{if(!node||!src)return;let hls:Hls|null=null;if(node.canPlayType("application/vnd.apple.mpegurl"))node.src=src;else if(Hls.isSupported()){hls=new Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(src);hls.attachMedia(node)}else node.src=src;return()=>{hls?.destroy();node.removeAttribute("src");node.load()}},[node,src]);
 return <div className="overflow-hidden rounded-2xl border border-amber-300 bg-black shadow-2xl"><video ref={setNode} autoPlay muted playsInline controls className="aspect-video w-full object-cover"/></div>;
}
