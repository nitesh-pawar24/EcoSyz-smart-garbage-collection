"use client";

import { useState } from "react";
import { Lock, Leaf, X, Phone, Eye, EyeOff } from "lucide-react";
import api from "../api/axios";

export default function Login({ onLoginSuccess }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpToShow, setOtpToShow] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });

  const showPopup = (message, type = "success") => setPopup({ show: true, message, type });
  const closePopup = () => setPopup({ show: false, message: "", type: "success" });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) { showPopup("Please enter a valid 10-digit mobile number", "error"); return; }
    setLoading(true);
    try {
      if (step === 1) {
        const res = await api.post("/auth/send-otp", { mobile });
        if (res.data.otp) { setOtpToShow(res.data.otp); setShowOtpModal(true); }
        else showPopup("OTP sent to your registered number");
        setStep(2);
      } else {
        const res = await api.post("/auth/verify-otp", { mobile, otp: password });
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        await api.get("/company/dashboard");
        showPopup("Login successful! Welcome back.");
        setTimeout(onLoginSuccess, 900);
      }
    } catch (err) {
      showPopup(err.response?.data?.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/send-otp", { mobile });
      if (res.data.otp) { setOtpToShow(res.data.otp); setShowOtpModal(true); }
      else showPopup("OTP resent successfully");
    } catch { showPopup("Failed to resend OTP", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans p-4">
      <div className="w-full max-w-[900px] rounded-[20px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.18)] flex flex-col lg:flex-row min-h-[560px]">

        {/* ── Left Panel ── */}
        <div className="flex-1 bg-slate-900 relative overflow-hidden flex flex-col justify-center p-8 md:p-11 lg:min-h-[560px]">
          {/* Floating circles */}
          <div className="animate-float absolute top-[10%] left-[15%] w-[180px] h-[180px] rounded-full bg-indigo-500/15" />
          <div className="animate-float2 absolute bottom-[15%] -right-[5%] w-[220px] h-[220px] rounded-full bg-purple-500/10" />
          <div className="animate-float3 absolute top-[50%] right-[20%] w-[100px] h-[100px] rounded-full bg-indigo-500/10" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3.5 mb-10">
              <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(99,102,241,0.5)]" style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                <Leaf size={26} color="white" />
              </div>
              <div>
                <div className="text-[22px] font-extrabold text-white tracking-tight">EcoSyz</div>
                <div className="text-[12px] text-white/40 font-medium">Smart Waste Management</div>
              </div>
            </div>

            <h1 className="text-[28px] md:text-[32px] font-extrabold text-white leading-tight mb-3 tracking-tight">
              Welcome back,<br />
              <span style={{ background:"linear-gradient(90deg,#818cf8,#c4b5fd)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Super Admin</span>
            </h1>
            <p className="text-[14px] text-white/45 leading-relaxed mb-9">
              Sign in to manage panchayat registrations, subscriptions, payments, and support queries across the EcoSyz network.
            </p>

            {/* Feature bullets */}
            {[
              "Panchayat verification & approval",
              "Subscription plan management",
              "Payment monitoring dashboard",
              "Support ticket resolution",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5 mb-2.5">
                <div className="w-5 h-5 rounded-md bg-indigo-500/30 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                </div>
                <span className="text-[13px] text-white/55 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="w-full lg:w-[400px] bg-white flex flex-col justify-center p-8 md:p-10 shrink-0">
          <div className="mb-8">
            <div className="text-[24px] font-extrabold text-slate-900 mb-1.5">
              {step === 1 ? "Sign In" : "Verify OTP"}
            </div>
            <div className="text-[13px] text-slate-400">
              {step === 1 ? "Enter your registered mobile number to continue" : `OTP sent to +91 ${mobile}`}
            </div>
          </div>

          <form onSubmit={handleLogin}>
            {/* Mobile */}
            <div className="mb-4">
              <label className="text-[12px] font-semibold text-slate-700 block mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${step===2 ? "text-slate-300" : "text-slate-400"}`} />
                <input
                  type="tel" inputMode="numeric" pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  value={mobile} disabled={step === 2}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g,""); if(v.length<=10) setMobile(v); }}
                  className={`w-full pl-10 pr-3.5 py-3 border-[1.5px] border-slate-200 rounded-xl text-[14px] font-sans outline-none focus:border-indigo-500 transition-colors ${step===2 ? "text-slate-400 bg-slate-50" : "text-slate-900 bg-white"}`}
                />
              </div>
            </div>

            {/* OTP */}
            <div className="mb-2">
              <label className="text-[12px] font-semibold text-slate-700 block mb-1.5">
                {step === 1 ? "OTP" : "Enter OTP"}
              </label>
              <div className="relative">
                <Lock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${step===1 ? "text-slate-300" : "text-slate-400"}`} />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder={step === 1 ? "Will be sent after mobile entry" : "6-digit OTP"}
                  value={password} disabled={step === 1}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-11 py-3 border-[1.5px] border-slate-200 rounded-xl text-[14px] font-sans outline-none focus:border-indigo-500 transition-colors ${step===1 ? "text-slate-400 bg-slate-50" : "text-slate-900 bg-white"}`}
                />
                {step === 2 && (
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>

            {/* Step 2 helpers */}
            {step === 2 && (
              <div className="flex justify-between mb-4 mt-2">
                <button type="button" onClick={() => { setStep(1); setPassword(""); }}
                  className="text-[12px] text-indigo-500 font-semibold bg-transparent border-none cursor-pointer font-sans hover:text-indigo-600 transition-colors">
                  ← Edit number
                </button>
                <button type="button" onClick={resendOtp} disabled={loading}
                  className={`text-[12px] text-indigo-500 font-semibold bg-transparent border-none cursor-pointer font-sans transition-opacity ${loading ? "opacity-50" : "hover:text-indigo-600"}`}>
                  Resend OTP
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className={`w-full p-[13px] rounded-xl border-none font-sans text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all ${step===1 ? "mt-6" : "mt-0"} ${loading ? "bg-slate-400 cursor-not-allowed" : "cursor-pointer shadow-[0_4px_15px_rgba(99,102,241,0.4)] active:scale-[0.98]"}`}
              style={loading ? {} : { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              {loading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white spinner" /> Processing…</>
              ) : step === 1 ? "Send OTP" : "Verify & Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* Popup */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl p-7 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.2)] text-center min-w-[280px]">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${popup.type==="error" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
              <span className="text-[22px]">{popup.type==="error" ? "✕" : "✓"}</span>
            </div>
            <p className={`font-semibold mb-4 text-[15px] ${popup.type==="error" ? "text-red-600" : "text-green-600"}`}>{popup.message}</p>
            <button onClick={closePopup} className={`px-6 py-2 rounded-lg border-none text-white font-semibold cursor-pointer font-sans text-[13px] transition-colors ${popup.type==="error" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}>OK</button>
          </div>
        </div>
      )}

      {/* OTP Display Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.2)] w-full max-w-[400px] overflow-hidden">
            <div className="px-6 py-5 flex justify-between items-center" style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <div>
                <div className="text-[16px] font-bold text-white">Your OTP Code</div>
                <div className="text-[12px] text-white/70 mt-0.5">Use this to complete sign in</div>
              </div>
              <button onClick={() => setShowOtpModal(false)} className="bg-white/20 hover:bg-white/30 border-none rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer transition-colors">
                <X size={18} color="white" />
              </button>
            </div>
            <div className="px-6 py-8 text-center">
              <div className="bg-slate-50 rounded-xl px-6 py-5 border-[1.5px] border-dashed border-slate-200 mb-6">
                <div className="text-[42px] font-extrabold tracking-[0.4em] text-slate-900 tabular-nums">{otpToShow}</div>
              </div>
              <p className="text-[13px] text-slate-400 mb-5">Paste this OTP in the verification field to sign in.</p>
              <button onClick={() => setShowOtpModal(false)} className="w-full py-3 rounded-xl border-none text-white font-bold text-[14px] cursor-pointer font-sans shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:opacity-90 transition-opacity active:scale-[0.98]" style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                Got it, continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
