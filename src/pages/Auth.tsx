import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [email,setEmail]=useState(""); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
  const navigate=useNavigate(); const location=useLocation();
  const next=new URLSearchParams(location.search).get("next") || "/biblia/estudio";
  const magic=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setMessage("");const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+next}});setLoading(false);setMessage(error?error.message:"Te enviamos un enlace seguro a tu correo.");};
  const google=async()=>{setLoading(true);const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin+next}});if(error){setMessage(error.message);setLoading(false);}};
  supabase.auth.getSession().then(({data})=>{if(data.session) navigate(next,{replace:true});});
  return <div className="min-h-screen bg-[#050505] px-4 py-10 text-[#F8F5EA]"><div className="mx-auto max-w-sm rounded-[1.75rem] border border-[#D4AF37]/30 bg-[#0B0B0B] p-6 shadow-2xl">
    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#F2D27A] to-[#D4AF37]"><BookOpen className="text-black"/></span>
    <h1 className="mt-4 text-center font-display text-2xl">Profundiza en la Palabra</h1><p className="mt-2 text-center text-sm text-[#C9C3B3]">Crea una cuenta gratuita para acceder al estudio teológico, palabras clave y Lectio Divina.</p>
    <button disabled={loading} onClick={google} className="mt-6 w-full rounded-xl bg-[#F8F5EA] px-4 py-3 font-semibold text-black disabled:opacity-50">Continuar con Google</button>
    <div className="my-4 flex items-center gap-3 text-xs text-[#C9C3B3]"><span className="h-px flex-1 bg-[#D4AF37]/20"/>o por correo<span className="h-px flex-1 bg-[#D4AF37]/20"/></div>
    <form onSubmit={magic}><label className="text-xs uppercase tracking-wider text-[#D4AF37]">Correo electrónico</label><div className="mt-1 flex rounded-xl border border-[#D4AF37]/25 bg-[#111] px-3"><Mail className="my-auto h-4 w-4 text-[#D4AF37]"/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-transparent px-3 py-3 outline-none" placeholder="tu@correo.com"/></div><button disabled={loading} className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F2D27A] px-4 py-3 font-bold text-black disabled:opacity-50">Enviar enlace de acceso</button></form>
    {message&&<p className="mt-3 text-center text-sm text-[#C9C3B3]">{message}</p>}<Link to="/biblia" className="mt-5 block text-center text-sm text-[#D4AF37]">Seguir como invitado</Link>
  </div></div>;
}
