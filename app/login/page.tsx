"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://dvtkcuqwvkakycsseydh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70"
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { data, error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.session) window.location.replace("/admin");
    else { setError("Login failed. Please try again."); setLoading(false); }
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Inter', system-ui, sans-serif", padding:20, position:"relative", overflow:"hidden",
      background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float  { 0%,100% { transform:translateY(0px)  rotate(0deg); } 50% { transform:translateY(-18px) rotate(3deg); } }
        @keyframes float2 { 0%,100% { transform:translateY(0px)  rotate(0deg); } 50% { transform:translateY(-12px) rotate(-2deg); } }
        .login-input { width:100%; padding:12px 14px; border:1.5px solid #e0e0e0; border-radius:10px; font-size:14px; color:#111; background:#fff; outline:none; font-family:inherit; transition:border-color 0.2s, box-shadow 0.2s; box-sizing:border-box; }
        .login-input:focus { border-color:#667eea; box-shadow:0 0 0 3px rgba(102,126,234,0.15); }
        .login-btn { width:100%; padding:13px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; border:none; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.2s; }
        .login-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(102,126,234,0.4); }
        .login-btn:disabled { opacity:0.7; cursor:not-allowed; }
      `}</style>

      {/* Background blobs */}
      <div style={{ position:"absolute", top:"-15%", left:"-10%", width:400, height:400, borderRadius:"50%", background:"rgba(255,255,255,0.07)", animation:"float 7s ease-in-out infinite" }} />
      <div style={{ position:"absolute", bottom:"-10%", right:"-5%", width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.05)", animation:"float2 9s ease-in-out infinite" }} />
      <div style={{ position:"absolute", top:"40%", right:"15%", width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.04)", animation:"float 11s ease-in-out infinite" }} />

      <div style={{ width:"100%", maxWidth:400, animation:"fadeUp 0.5s ease", position:"relative" }}>

        {/* Branding */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{
            width:56, height:56, borderRadius:16,
            background:"rgba(255,255,255,0.2)", backdropFilter:"blur(10px)",
            border:"1px solid rgba(255,255,255,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 14px", fontSize:24, fontWeight:900, color:"#fff",
            boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
          }}>S</div>
          <div style={{ fontWeight:800, fontSize:18, color:"#fff", letterSpacing:"-0.4px" }}>StudyNest</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)", marginTop:3 }}>Admin Portal &middot; NTU</div>
        </div>

        {/* Card */}
        <div style={{ background:"#fff", borderRadius:20, padding:"32px 28px", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:"#111", marginBottom:22, letterSpacing:"-0.3px" }}>Sign In</h2>
          <form onSubmit={login} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#555", marginBottom:6, letterSpacing:"0.04em" }}>EMAIL ADDRESS</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                autoComplete="email" placeholder="admin@ntu.edu.pk" className="login-input" />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#555", marginBottom:6, letterSpacing:"0.04em" }}>PASSWORD</label>
              <div style={{ position:"relative" }}>
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  autoComplete="current-password" placeholder="••••••••"
                  className="login-input" style={{ paddingRight:52 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", color:"#aaa",
                  fontSize:12, fontWeight:600, fontFamily:"inherit", padding:0,
                }}>
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {error && (
              <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 14px", color:"#dc2626", fontSize:13, fontWeight:500 }}>{error}</div>
            )}
            <button type="submit" disabled={loading} className="login-btn" style={{ marginTop:4 }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <div style={{ textAlign:"center", marginTop:18 }}>
          <a href="/papers" style={{ fontSize:13, color:"rgba(255,255,255,0.75)", textDecoration:"none", fontWeight:500 }}>
            ← Back to Public Site
          </a>
        </div>
      </div>
    </div>
  );
}
