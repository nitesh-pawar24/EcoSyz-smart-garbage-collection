"use client";

import { LogOut, X } from "lucide-react";

export default function LogoutConfirmation({ isOpen, onClose, onLogout }) {
  if (!isOpen) return null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }}>
      <div style={{ background:"white", borderRadius:20, boxShadow:"0 25px 80px rgba(0,0,0,0.2)", width:"100%", maxWidth:400, overflow:"hidden", fontFamily:"Inter, sans-serif" }}>

        {/* Indigo header band */}
        <div style={{ background:"linear-gradient(135deg,#0f172a,#1e293b)", padding:"28px 28px 24px", textAlign:"center" }}>
          <div style={{ width:60, height:60, borderRadius:18, background:"rgba(239,68,68,0.15)", border:"2px solid rgba(239,68,68,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
            <LogOut size={26} color="#f87171" />
          </div>
          <div style={{ fontSize:18, fontWeight:800, color:"white", marginBottom:4 }}>Sign Out</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)" }}>EcoSyz Super Admin Portal</div>
        </div>

        {/* Body */}
        <div style={{ padding:"24px 28px 28px", textAlign:"center" }}>
          <p style={{ fontSize:15, color:"#374151", lineHeight:1.7, marginBottom:24 }}>
            Are you sure you want to sign out? You'll need to verify your mobile number again to re-enter.
          </p>

          <div style={{ display:"flex", gap:10 }}>
            <button
              onClick={onClose}
              style={{ flex:1, padding:"12px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"white", color:"#374151", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}
              onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
              onMouseLeave={e => e.currentTarget.style.background="white"}
            >
              Stay logged in
            </button>
            <button
              onClick={onLogout}
              style={{ flex:1, padding:"12px", borderRadius:10, border:"none", background:"#ef4444", color:"white", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 12px rgba(239,68,68,0.3)" }}
              onMouseEnter={e => e.currentTarget.style.background="#dc2626"}
              onMouseLeave={e => e.currentTarget.style.background="#ef4444"}
            >
              Yes, sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
