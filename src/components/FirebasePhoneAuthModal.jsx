// ─── PhoneAuthModal.jsx ───────────────────────────────────────────────────────
// Production phone OTP modal — calls the backend Twilio API.
// No Firebase dependency. No hardcoded OTPs. Art Deco Dark Gold Styling.

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Phone, X, ArrowLeft, RefreshCw, CheckCircle, ShieldCheck } from "lucide-react";

const API_BASE = "";

// ─── Helper: mask phone for display ──────────────────────────────────────────
function maskPhone(countryCode, localDigits) {
  if (!localDigits || localDigits.length < 5) return `${countryCode} ${localDigits}`;
  const visible = localDigits.slice(-5);
  const masked = "X".repeat(localDigits.length - 5);
  return `${countryCode} ${masked} ${visible}`;
}

// ─── STEP 1: Phone Number Input ───────────────────────────────────────────────
function PhoneStep({ onSend, onClose }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    const e164 = `+91${digits}`;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/send-mobile-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: e164 }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send OTP. Please try again.");
        return;
      }

      onSend({ phone: digits, countryCode: "+91", e164 });
    } catch (err) {
      setError("Network error. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div className="text-center py-1 space-y-1">
        <div className="w-14 h-14 bg-[#0A0A0A] flex items-center justify-center mx-auto border border-[#D4AF37]/50 mb-3">
          <Phone className="h-7 w-7 text-[#D4AF37]" />
        </div>
        <h3 className="text-base font-artdeco-heading text-[#F2F0E4] uppercase tracking-wider">Verify Your Mobile</h3>
        <p className="text-[11px] font-semibold text-[#888888] leading-relaxed">
          We'll send a real 6-digit OTP to your mobile via SMS. No spam.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-artdeco-heading text-[#D4AF37] uppercase tracking-widest px-1">
          Mobile Number
        </label>
        <div className="flex shadow-sm">
          <div className="flex items-center px-3 py-3 bg-[#0A0A0A] border border-r-0 border-[#D4AF37]/30 text-sm font-bold text-[#D4AF37] select-none shrink-0 gap-1">
            🇮🇳 <span>+91</span>
          </div>
          <input
            id="phone-otp-input"
            type="tel"
            required
            inputMode="numeric"
            autoFocus
            value={phone}
            onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
            placeholder="98765 43210"
            maxLength={10}
            className="flex-1 px-4 py-3 border border-[#D4AF37]/30 focus:border-[#D4AF37] text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-colors bg-[#0A0A0A] font-mono font-bold tracking-wider text-[#F2F0E4]"
            aria-label="Mobile number"
          />
        </div>

        {phone.replace(/\D/g, "").length === 10 && (
          <p className="text-[10px] text-[#16845B] px-1 font-bold flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> OTP will be sent to +91 {phone}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-[#C94A4A]/10 border border-[#C94A4A]/40 p-3 text-xs font-bold text-[#C94A4A] flex items-start gap-2">
          <span className="text-base leading-none">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2 pt-1">
        <button
          type="submit"
          id="send-otp-btn"
          disabled={loading || phone.replace(/\D/g, "").length !== 10}
          className="w-full py-3.5 px-4 bg-[#D4AF37] hover:bg-[#F3E5AB] disabled:opacity-40 text-[#0A0A0A] font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
              <span>Sending OTP…</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#0A0A0A]" />
              <span>Send OTP via SMS</span>
            </>
          )}
        </button>

        <p className="text-[9.5px] text-center text-[#888888] font-semibold leading-relaxed px-2">
          🔒 Protected by Twilio. A real SMS will be sent to the number above.
        </p>
      </div>
    </form>
  );
}

// ─── STEP 2: OTP Verification ─────────────────────────────────────────────────
const OTP_LENGTH = 6;

function OtpStep({ session, onVerified, onChangeNumber }) {
  const { phone, countryCode, e164 } = session;

  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);
    setError("");
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otpDigits[index]) {
        const updated = [...otpDigits]; updated[index] = ""; setOtpDigits(updated);
      } else if (index > 0) inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length > 0) {
      const updated = Array(OTP_LENGTH).fill("");
      pasted.split("").forEach((ch, i) => { updated[i] = ch; });
      setOtpDigits(updated);
      const nextEmpty = updated.findIndex((d) => !d);
      inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus();
    }
  };

  const handleVerify = useCallback(async () => {
    const otp = otpDigits.join("");
    if (otp.length !== OTP_LENGTH) { setError("Please enter all 6 digits."); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-mobile-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: e164, otp }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Incorrect OTP. Please try again.");
        setOtpDigits(Array(OTP_LENGTH).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        return;
      }

      onVerified(data);
    } catch (err) {
      setError("Network error. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }, [otpDigits, e164, onVerified]);

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (otpDigits.every((d) => d !== "") && !loading) handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpDigits]);

  const handleResend = async () => {
    if (resending || countdown > 0) return;
    setResending(true);
    setError("");
    setOtpDigits(Array(OTP_LENGTH).fill(""));

    try {
      const res = await fetch(`${API_BASE}/api/auth/send-mobile-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: e164 }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to resend OTP."); return; }
      setCountdown(30);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Network error. Could not resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="text-center space-y-1">
        <div className="w-14 h-14 bg-[#0A0A0A] flex items-center justify-center mx-auto border border-[#D4AF37]/40 mb-3">
          <ShieldCheck className="h-7 w-7 text-[#D4AF37]" />
        </div>
        <h3 className="text-base font-artdeco-heading text-[#F2F0E4] uppercase tracking-wider">Enter Your OTP</h3>
        <p className="text-[11px] font-semibold text-[#888888]">A 6-digit code was sent to</p>
        <p className="text-sm font-artdeco-heading text-[#D4AF37] tracking-wider font-mono">
          {maskPhone(countryCode, phone)}
        </p>
      </div>

      <div className="flex justify-center gap-2" onPaste={handlePaste} role="group" aria-label="OTP input">
        {Array(OTP_LENGTH).fill(null).map((_, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            id={`otp-box-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otpDigits[i]}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            aria-label={`OTP digit ${i + 1}`}
            className={`w-11 h-14 text-center text-xl font-artdeco-heading border transition-all duration-150 focus:outline-none font-mono ${
              otpDigits[i]
                ? "border-[#D4AF37] bg-[#0A0A0A] text-[#D4AF37]"
                : "border-[#D4AF37]/30 bg-[#0A0A0A] text-[#F2F0E4] focus:border-[#D4AF37]"
            } ${error ? "border-[#C94A4A] bg-[#C94A4A]/10 text-[#C94A4A]" : ""}`}
          />
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#D4AF37] animate-pulse uppercase tracking-wider">Verifying…</span>
        </div>
      )}

      {error && (
        <div className="bg-[#C94A4A]/10 border border-[#C94A4A]/40 p-3 text-xs font-bold text-[#C94A4A] flex items-start gap-2">
          <span className="text-base leading-none shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs font-bold text-[#888888] px-1">
        <span>Didn't receive code?</span>
        {countdown > 0 ? (
          <span className="text-[#888888] font-mono">Resend in {countdown}s</span>
        ) : (
          <button
            type="button"
            id="resend-otp-btn"
            disabled={resending}
            onClick={handleResend}
            className="text-[#D4AF37] hover:underline transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50 uppercase tracking-wider text-[10px]"
          >
            <RefreshCw className={`h-3 w-3 ${resending ? "animate-spin" : ""}`} />
            {resending ? "Sending…" : "Resend OTP"}
          </button>
        )}
      </div>

      <button
        type="button"
        id="verify-otp-btn"
        disabled={loading || otpDigits.some((d) => !d)}
        onClick={handleVerify}
        className="w-full py-3.5 px-4 bg-[#D4AF37] hover:bg-[#F3E5AB] disabled:opacity-40 text-[#0A0A0A] font-bold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
        aria-busy={loading}
      >
        {loading
          ? <div className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
          : <CheckCircle className="h-4 w-4 shrink-0 text-[#0A0A0A]" />}
        <span>{loading ? "Verifying…" : "Verify OTP & Login"}</span>
      </button>

      <button
        type="button"
        onClick={onChangeNumber}
        className="w-full py-2.5 px-4 text-[#888888] hover:text-[#F2F0E4] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider"
      >
        <ArrowLeft className="h-3.5 w-3.5 shrink-0" /> Change Number
      </button>
    </div>
  );
}

// ─── STEP 3: Success ──────────────────────────────────────────────────────────
function SuccessStep() {
  return (
    <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 bg-[#0A0A0A] flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/50">
        <CheckCircle className="h-9 w-9 text-[#D4AF37]" />
      </div>
      <div>
        <h4 className="text-lg font-artdeco-heading text-[#F2F0E4] uppercase tracking-wider">Verified!</h4>
        <p className="text-xs text-[#888888] font-semibold mt-1.5 leading-relaxed">
          Your mobile number has been verified. Logging you in…
        </p>
      </div>
      <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function FirebasePhoneAuthModal({ isOpen, onClose, onLogin, role, lang }) {
  const [step, setStep] = useState("phone");
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (isOpen) { setStep("phone"); setSession(null); }
  }, [isOpen]);

  const handleSent = (sessionData) => {
    setSession(sessionData);
    setStep("otp");
  };

  const handleVerified = useCallback((data) => {
    setStep("success");

    const { user, token } = data;
    const displayPhone = session?.e164 || "";
    const namePart = user?.name || `Citizen (${displayPhone.slice(-4)})`;

    const appUser =
      role === "admin"
        ? { ...user, id: user._id, name: namePart, role: "admin", department: "General Administration", language: lang, authMethod: "phone_otp" }
        : role === "ngo"
        ? { ...user, id: user._id, name: namePart, role: "ngo", department: "Community Support", language: lang, authMethod: "phone_otp" }
        : { ...user, id: user._id, name: namePart, role: "citizen", points: user.points || 100, badges: user.badges || [], language: lang, location: { city: "Jharkhand", state: "Jharkhand" }, authMethod: "phone_otp" };

    if (token) localStorage.setItem("authToken", token);

    setTimeout(() => { onLogin(appUser); onClose(); }, 1500);
  }, [session, role, lang, onLogin, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#0A0A0A]/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-auth-modal-title"
    >
      <div className="bg-[#141414] max-w-sm w-full overflow-hidden shadow-2xl border border-[#D4AF37]/50 animate-float-in flex flex-col font-sans text-[#F2F0E4]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-[#D4AF37]/30 bg-[#0A0A0A]">
          <div className="flex items-center space-x-2">
            {step === "otp" && (
              <button
                type="button"
                onClick={() => { setStep("phone"); setSession(null); }}
                className="p-1 text-[#888888] hover:text-[#F2F0E4] hover:bg-[#141414] cursor-pointer mr-1"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
            )}
            <Phone className="h-4.5 w-4.5 text-[#D4AF37] shrink-0" />
            <span id="phone-auth-modal-title" className="font-artdeco-heading text-sm tracking-widest uppercase text-[#F2F0E4]">
              {step === "phone" ? "Verify Mobile Number" : step === "otp" ? "Enter Verification Code" : "Verification Complete"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#888888] hover:text-[#F2F0E4] hover:bg-[#141414] cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1.5 pt-4 px-5">
          {["phone", "otp", "success"].map((s) => (
            <div
              key={s}
              className={`h-1.5 transition-all duration-300 ${
                s === step ? "w-6 bg-[#D4AF37]"
                  : ["phone","otp","success"].indexOf(s) < ["phone","otp","success"].indexOf(step)
                  ? "w-3 bg-[#D4AF37]/50" : "w-3 bg-[#888888]/20"
              }`}
            />
          ))}
        </div>

        {step === "phone" && <PhoneStep onSend={handleSent} onClose={onClose} />}
        {step === "otp" && session && (
          <OtpStep
            session={session}
            onVerified={handleVerified}
            onChangeNumber={() => { setStep("phone"); setSession(null); }}
          />
        )}
        {step === "success" && <SuccessStep />}

        {/* Footer */}
        <div className="px-6 pb-5 pt-1 text-center">
          <p className="text-[8.5px] font-semibold text-[#888888] leading-relaxed">
            🔒 Protected by Twilio SMS · No OTP is stored by this app
          </p>
        </div>
      </div>
    </div>
  );
}
