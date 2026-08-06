import React, { useState, useEffect } from "react";
import { Users, Shield, Globe, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, X, Fingerprint, Settings, Sun, Moon, Radio, Sparkles, CheckCircle2, TrendingUp, Activity, Award, Zap, Bot } from "lucide-react";
import { sendSms } from "./utils/smsHelper";
import SmsSettingsModal from "./components/SmsSettingsModal";

function Jharkhand24x7NewsChannelBanner() {
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");
  const [tickerIndex, setTickerIndex] = useState(0);

  const breakingHeadlines = [
    {
      topBadge: "बड़ी खबर • BIG BREAKING",
      title: "झारखण्ड नागरिक पोर्टल: 24 घंटे में समस्या निवारण का नया रिकॉर्ड दर्ज!",
      subtext: "मुख्यमंत्री समीक्षा बैठक: लापरवाही बरतने वाले अधिकारियों पर होगी त्वरित कार्रवाई।",
      location: "रांची (मुख्य स्टूडियो)",
      impact: "100% DIGITAL TRACKING"
    },
    {
      topBadge: "एक्सक्लूसिव • EXCLUSIVE REPORT",
      title: "रांची & जमशेदपुर स्मार्ट सिटी: GIS लोकेशन मैपिंग से सड़कें गड्ढा-मुक्त",
      subtext: "स्मार्ट कंट्रोल रूम द्वारा 1,280 से अधिक गड्ढों की मरम्मत की लाइव निगरानी पूरी।",
      location: "कांटाटोली, रांची",
      impact: "98.4% RESOLVED"
    },
    {
      topBadge: "मानसून अलर्ट • LIVE UPDATES",
      title: "राज्य आपदा प्रबंधन: जलभराव हेल्पलाइन 1811 पर 24/7 टीमें तैनात",
      subtext: "सभी नगर निगम क्षेत्रों में नालियों की सफाई एवं पंपिंग स्टेशन अलर्ट मोड पर।",
      location: "राज्य आपदा केंद्र",
      impact: "24/7 HELPLINE ACTIVE"
    }
  ];

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-IN', { hour12: false }));
      setDateString(now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const headlineInterval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % breakingHeadlines.length);
    }, 4500);
    return () => clearInterval(headlineInterval);
  }, []);

  const currentHeadline = breakingHeadlines[tickerIndex];

  return (
    <div className="hidden md:flex md:col-span-5 relative flex-col justify-between text-white overflow-hidden bg-slate-950 border-r-2 border-red-600 select-none min-h-[580px]">
      
      {/* NEWS STUDIO BROADCAST BACKDROP */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        {/* Newsroom Red/Blue Studio Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-slate-950 to-blue-950 opacity-90" />
        
        {/* Animated Scanlines */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Floating Moving Camera Feed Effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[120%] h-48 bg-gradient-to-r from-red-600/10 via-amber-500/15 to-blue-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* TOP BAR: TV NEWS CHANNEL LOGO & LIVE STAMP */}
      <div className="relative z-10 p-3 bg-gradient-to-b from-black via-black/90 to-transparent border-b-2 border-red-600">
        <div className="flex items-center justify-between">
          
          {/* TV Channel Brand Stamp */}
          <div className="flex items-center gap-2">
            {/* 3D Shiny Red TV Logo Box */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-black p-0.5 shadow-[0_0_15px_rgba(220,38,38,0.7)] flex items-center justify-center border border-red-400">
              <img src="/assets/jharkhand_emblem.png" alt="JH Seal" className="w-full h-full object-contain drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-amber-400 tracking-tighter uppercase drop-shadow">JHARKHAND</span>
                <span className="px-1.5 py-0.2 bg-red-600 text-white font-mono text-[9px] font-black rounded shadow">24x7</span>
              </div>
              <span className="text-[8px] font-black text-slate-300 tracking-widest block uppercase">
                झारखण्ड का नंबर 1 न्यूज़ चैनल
              </span>
            </div>
          </div>

          {/* LIVE RED FLASH & CLOCK */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white rounded-md text-[9.5px] font-black tracking-widest uppercase shadow-[0_0_12px_rgba(220,38,38,0.8)] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>LIVE BROADCAST</span>
            </div>
            <span className="text-[10px] font-mono font-black text-amber-300 mt-1 tracking-wider">
              {timeString} | {dateString}
            </span>
          </div>
        </div>

        {/* Live Index Ticker Bar */}
        <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono font-bold text-slate-300 bg-black/70 px-2.5 py-1 rounded border border-white/10">
          <span className="text-emerald-400 flex items-center gap-1">
            <span>CIVIC RESOLUTION RATE: 98.4%</span>
            <span className="text-emerald-300">▲ +1.2%</span>
          </span>
          <span className="text-amber-400">STATE CONTROL ROOM ● ONLINE</span>
        </div>
      </div>

      {/* CENTER: BOLD TV NEWS GRAPHIC OVERLAY */}
      <div className="relative z-10 my-auto px-4 py-2 space-y-3">
        
        {/* Main TV Screen Frame */}
        <div className="relative rounded-xl bg-slate-900/90 border-2 border-red-600 p-4 shadow-[0_0_40px_rgba(220,38,38,0.4)] overflow-hidden">
          
          {/* Corner Studio Camera Badge */}
          <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-2">
            <span className="px-2.5 py-0.5 bg-red-600 text-white text-[9.5px] font-black tracking-widest uppercase rounded shadow">
              {currentHeadline.topBadge}
            </span>
            <span className="text-[9px] font-mono text-emerald-400 font-bold bg-black/60 px-2 py-0.5 rounded border border-emerald-500/30">
              ● {currentHeadline.impact}
            </span>
          </div>

          {/* Main Headline Text */}
          <h2 className="text-lg font-black leading-snug tracking-tight text-white drop-shadow-md">
            {currentHeadline.title}
          </h2>

          {/* Subtext Box */}
          <p className="text-[11px] font-bold text-amber-200 mt-2 leading-relaxed bg-black/80 p-2.5 rounded-lg border border-amber-500/30 shadow-inner">
            {currentHeadline.subtext}
          </p>

          {/* Studio Field Location */}
          <div className="flex items-center justify-between mt-3 text-[9.5px] font-mono font-bold text-slate-300 border-t border-white/10 pt-2">
            <span className="text-red-400">LOCATION: {currentHeadline.location}</span>
            <span className="text-emerald-400">STUDIO CAM 01</span>
          </div>

          {/* Red Progress Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900">
            <div className="h-full bg-gradient-to-r from-red-600 via-amber-400 to-emerald-400 animate-pulse w-full" />
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER: DUAL NEWS TICKER BARS (TV STYLE) */}
      <div className="relative z-10 bg-black border-t-2 border-red-600">
        
        {/* Top Ticker: Yellow Breaking Strip */}
        <div className="bg-amber-400 text-slate-950 font-black text-[10px] py-1 px-3 flex items-center gap-2 shadow">
          <span className="bg-red-600 text-white px-2 py-0.5 text-[8.5px] uppercase tracking-wider rounded font-black shrink-0">
            बड़ी ख़बर
          </span>
          <p className="truncate tracking-tight font-extrabold">
            {currentHeadline.title}
          </p>
        </div>

        {/* Bottom Ticker: Red Continuous Marquee */}
        <div className="bg-red-700 text-white py-1.5 px-3 flex items-center gap-2 overflow-hidden shadow-inner border-t border-red-500">
          <span className="px-2 py-0.5 bg-black text-amber-400 text-[8.5px] font-black tracking-widest uppercase rounded shrink-0 border border-amber-400/40">
            24x7 HEADLINES
          </span>
          <div className="overflow-hidden whitespace-nowrap flex-1">
            <p className="inline-block text-[11px] font-bold tracking-wide animate-marquee">
              🔴 झारखण्ड सरकार: 24 जिलों में 100% डिजिटल सिटिज़न हेल्पडेस्क सक्रिय &nbsp;&nbsp;•&nbsp;&nbsp; ⚡ रांची कांटाटोली फ़िलाईओवर ट्रैफ़िक पूर्णतः सुगम &nbsp;&nbsp;•&nbsp;&nbsp; 🌿 जमशेदपुर: GIS आधारित पॉथोल ट्रैकिंग प्रणाली सफल &nbsp;&nbsp;•&nbsp;&nbsp; 🌧️ मानसून कंट्रोल रूम हेल्पलाइन 1811 24/7 चालू
            </p>
          </div>
        </div>

        {/* Footer Channel Accreditation */}
        <div className="p-2 flex items-center justify-between text-[8.5px] font-black text-slate-400 bg-slate-950">
          <span className="text-amber-400">JHARKHAND NEWS 24x7 OFFICIAL BROADCAST</span>
          <span>सूचना एवं जनसंपर्क विभाग, झारखण्ड</span>
        </div>
      </div>
    </div>
  );
}

export default function Login({ onLogin, theme = "citizen", onThemeChange, mode = "light", onModeToggle }) {
  const [role, setRole] = useState("citizen");
  const [loginMethod, setLoginMethod] = useState("email");
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    otp: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [lang, setLang] = useState("en");

  // Email validation state: 'idle' | 'validating' | 'valid' | 'invalid_format' | 'invalid_domain'
  const [emailStatus, setEmailStatus] = useState("idle");
  const [emailMessage, setEmailMessage] = useState("");

  // Mock Authentication States
  const [activeMockAuth, setActiveMockAuth] = useState(null); // "Google" | "Apple" | "Phone" | null
  const [mockEmail, setMockEmail] = useState("");
  const [mockPassword, setMockPassword] = useState("");
  const [mockPhone, setMockPhone] = useState("");
  const [mockOtp, setMockOtp] = useState("");
  const [mockStep, setMockStep] = useState(1);
  const [mockError, setMockError] = useState("");
  const [mockCountdown, setMockCountdown] = useState(30);
  const [mockScanStatus, setMockScanStatus] = useState("idle"); // "idle" | "scanning" | "success"
  const [showSmsSettings, setShowSmsSettings] = useState(false);
  const [generatedLoginOtp, setGeneratedLoginOtp] = useState("");
  const [generatedForgotOtp, setGeneratedForgotOtp] = useState("");
  const [smsSending, setSmsSending] = useState(false);
  const [smsStatusMessage, setSmsStatusMessage] = useState("");

  const themesList = [
    { id: "citizen", name: "Saffron", color: "bg-[#e05a00]" },
    { id: "admin", name: "Peacock", color: "bg-[#0a8491]" },
    { id: "ngo", name: "Jewel", color: "bg-[#6c5ce7]" },
    { id: "royal", name: "Royal", color: "bg-[#6366f1]" },
    { id: "lotus", name: "Lotus", color: "bg-[#ec4899]" },
  ];

  const handleRoleTabClick = (newRole) => {
    setRole(newRole);
    setOtpSent(false);
    if (onThemeChange) {
      const roleTheme = newRole === "admin" ? "admin" : newRole === "ngo" ? "ngo" : "citizen";
      onThemeChange(roleTheme);
    }
  };
  const [smsStatusType, setSmsStatusType] = useState("info");

  useEffect(() => {
    let timer;
    if (activeMockAuth === "Phone" && mockStep === 2 && mockCountdown > 0) {
      timer = setInterval(() => {
        setMockCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeMockAuth, mockStep, mockCountdown]);

  // Real-time email validation (format + DNS domain check)
  useEffect(() => {
    const email = form.email.trim();
    if (!email) {
      setEmailStatus("idle");
      setEmailMessage("");
      return;
    }

    // Basic RFC 5322 format regex
    const FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!FORMAT_RE.test(email)) {
      setEmailStatus("invalid_format");
      setEmailMessage("Please enter a valid email format (e.g. name@example.com)");
      return;
    }

    // Domain DNS MX lookup via Google DNS-over-HTTPS
    setEmailStatus("validating");
    setEmailMessage("Checking email domain...");
    const domain = email.split("@")[1];
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("DNS fetch failed");
        const data = await res.json();
        if (data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0) {
          setEmailStatus("valid");
          setEmailMessage("Email domain verified ✓");
        } else {
          const resA = await fetch(
            `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
            { signal: controller.signal }
          );
          const dataA = await resA.json();
          if (dataA.Status === 0 && Array.isArray(dataA.Answer) && dataA.Answer.length > 0) {
            setEmailStatus("valid");
            setEmailMessage("Email domain verified ✓");
          } else {
            setEmailStatus("invalid_domain");
            setEmailMessage(`Domain "${domain}" does not appear to be a real email provider`);
          }
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setEmailStatus("valid");
        setEmailMessage("Could not verify domain (offline). Proceeding anyway.");
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.email]);

  // Forgot Password States
  const [activeForgotModal, setActiveForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotCountdown, setForgotCountdown] = useState(30);
  const [forgotError, setForgotError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let timer;
    if (activeForgotModal && forgotStep === 2 && forgotCountdown > 0) {
      timer = setInterval(() => {
        setForgotCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeForgotModal, forgotStep, forgotCountdown]);

  const sendLoginOtp = async (phoneVal) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedLoginOtp(code);
    setMockOtp("");
    setMockCountdown(30);
    setMockError("");
    setSmsStatusType("info");
    setSmsStatusMessage(`Sending real OTP to +91 ${phoneVal}...`);
    console.log(`[SMS Gateway] Sent Login OTP ${code} to +91 ${phoneVal}`);
    setSmsSending(true);

    try {
      const res = await sendSms(phoneVal, `Your CivicReport Login verification code is: ${code}. Valid for 5 minutes.`);
      if (res.success) {
        setSmsStatusType("success");
        setSmsStatusMessage("Real SMS sent successfully!");
      } else {
        setSmsStatusType("error");
        setSmsStatusMessage(`SMS failed: ${res.error}. (Use simulated code)`);
      }
    } catch (e) {
      setSmsStatusType("error");
      setSmsStatusMessage(`Network error: ${e.message}. (Use simulated code)`);
    } finally {
      setSmsSending(false);
    }
  };

  const sendForgotOtp = async (phoneVal) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedForgotOtp(code);
    setForgotOtp("");
    setForgotCountdown(30);
    setForgotError("");
    setSmsStatusType("info");
    setSmsStatusMessage(`Sending real reset OTP to +91 ${phoneVal}...`);
    console.log(`[SMS Gateway] Sent Reset OTP ${code} to +91 ${phoneVal}`);
    setSmsSending(true);

    try {
      const res = await sendSms(phoneVal, `Your CivicReport Password Reset code is: ${code}. Valid for 5 minutes.`);
      if (res.success) {
        setSmsStatusType("success");
        setSmsStatusMessage("Real SMS sent successfully!");
      } else {
        setSmsStatusType("error");
        setSmsStatusMessage(`SMS failed: ${res.error}. (Use simulated code)`);
      }
    } catch (e) {
      setSmsStatusType("error");
      setSmsStatusMessage(`Network error: ${e.message}. (Use simulated code)`);
    } finally {
      setSmsSending(false);
    }
  };

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिंदी (Hindi)", flag: "🇮🇳" },
    { code: "ta", name: "தமிழ் (Tamil)", flag: "🇮🇳" },
    { code: "ml", name: "മലയാളം (Malayalam)", flag: "🇮🇳" },
    { code: "bho", name: "भोजपुरी (Bhojpuri)", flag: "🇮🇳" },
    { code: "mai", name: "मैथिली (Maithili)", flag: "🇮🇳" },
    { code: "mag", name: "मगही (Magahi)", flag: "🇮🇳" },
    { code: "sat", name: "ᱥᱟᱱᱛᱟᱲᱤ (Santali)", flag: "🇮🇳" },
  ];

  const [credentials, setCredentials] = useState({
    citizen: { email: "rajesh@demo.com", phone: "+911234567890", password: "demo123", otp: "123456" },
    admin: { email: "priya@demo.com", phone: "+911234567891", password: "admin123", otp: "123456" },
    // Department admins
    road_admin: { email: "road_admin@demo.com", password: "admin123", department: "Road Maintenance", name: "Priya Singh (Roads)" },
    garbage_admin: { email: "garbage_admin@demo.com", password: "admin123", department: "Garbage & Sanitation", name: "Suresh Prasad (Sanitation)" },
    water_admin: { email: "water_admin@demo.com", password: "admin123", department: "Water Supply", name: "Anil Tirkey (Water)" },
    electricity_admin: { email: "electricity_admin@demo.com", password: "admin123", department: "Electricity Dept", name: "Sanjay Mahato (Power)" },
    streetlight_admin: { email: "streetlight_admin@demo.com", password: "admin123", department: "Streetlight Dept", name: "Ravi Mundu (Lighting)" },
    safety_admin: { email: "safety_admin@demo.com", password: "admin123", department: "Public Safety", name: "Inspector Oraon (Safety)" },
    parks_admin: { email: "parks_admin@demo.com", password: "admin123", department: "Forestry Dept", name: "Karan Horo (Forestry)" },
    drainage_admin: { email: "drainage_admin@demo.com", password: "admin123", department: "Drainage Dept", name: "Manoj Soren (Drainage)" },
    noise_admin: { email: "noise_admin@demo.com", password: "admin123", department: "Environment Dept", name: "Asha Lakra (Environment)" },
    ngo: { email: "ngo@demo.com", phone: "+911234567892", password: "ngo123", otp: "123456" },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("Please enter both email and password.");
      return;
    }
    if (emailStatus === "invalid_format") {
      alert("Please enter a valid email address.");
      return;
    }
    if (emailStatus === "invalid_domain") {
      alert("The email domain does not appear to exist. Please use a real email address.");
      return;
    }
    setLoading(true);

    let authenticatedUser = null;

    try {
      // Connect to MongoDB Backend API for User Auth & Persistence
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: role
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          authenticatedUser = {
            ...data.user,
            language: lang,
            notificationsEnabled: true
          };
        }
      }
    } catch (err) {
      console.warn("MongoDB auth endpoint offline, falling back to local session:", err);
    }

    // Fallback if backend API is unreachable
    if (!authenticatedUser) {
      const matchesDeptAdmin = Object.values(credentials).find(c => c.email === form.email && c.password === form.password && c.department);
      if (form.email === credentials.citizen.email && form.password === credentials.citizen.password) {
        authenticatedUser = { id: "1", name: "Rajesh Kumar", email: form.email, phone: credentials.citizen.phone, role: "citizen", points: 250, badges: [{ id: "1", name: "First Reporter", description: "Reported first issue", icon: "🏆", earnedAt: new Date() }, { id: "2", name: "Community Hero", description: "Active community member", icon: "🦸", earnedAt: new Date() }], language: lang, notificationsEnabled: true, location: { city: "Khunti", state: "Jharkhand" } };
      } else if (form.email === credentials.admin.email && form.password === credentials.admin.password) {
        authenticatedUser = { id: "2", name: "Priya Singh", email: form.email, role: "admin", department: "Public Works", language: lang, notificationsEnabled: true };
      } else if (matchesDeptAdmin) {
        authenticatedUser = { id: Math.random().toString(), name: matchesDeptAdmin.name, email: form.email, role: "admin", department: matchesDeptAdmin.department, language: lang, notificationsEnabled: true };
      } else if (form.email === credentials.ngo.email && form.password === credentials.ngo.password) {
        authenticatedUser = { id: "3", name: "Green Earth NGO", email: form.email, role: "ngo", department: "Environmental", language: lang, notificationsEnabled: true };
      } else {
        const namePart = form.email.split("@")[0];
        const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._-]/g, " ");
        authenticatedUser =
          role === "citizen"
            ? { id: Math.random().toString(), name: displayName, email: form.email, phone: "+919999999999", role: "citizen", points: 100, badges: [], language: lang, notificationsEnabled: true, location: { city: "Khunti", state: "Jharkhand" } }
            : role === "admin"
              ? { id: Math.random().toString(), name: displayName, email: form.email, role: "admin", department: "General Administration", language: lang, notificationsEnabled: true }
              : { id: Math.random().toString(), name: displayName, email: form.email, role: "ngo", department: "Community Support", language: lang, notificationsEnabled: true };
      }
    }

    onLogin(authenticatedUser);
    setLoading(false);
  };

  const handleSocialLogin = async (provider) => {
    if (provider === "Google") {
      const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
      const isDummyClient = !client_id || client_id.includes("dummy");
      
      if (isDummyClient) {
        // Trigger mock Google Sign-in modal
        setMockEmail("");
        setMockStep(2);
        setMockError("");
        setActiveMockAuth("Google");
        return;
      }

      setLoading(true);
      try {
        if (typeof window.google === "undefined" || !window.google.accounts) {
          throw new Error("Google Identity SDK is not loaded yet. Please try again in a moment.");
        }

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: client_id,
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setLoading(false);
              alert(`Authentication cancelled or failed: ${tokenResponse.error_description || tokenResponse.error}`);
              return;
            }

            try {
              // Retrieve user profile data using Google Access Token
              const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`);
              if (!res.ok) {
                throw new Error("Failed to retrieve profile data from Google.");
              }
              const googleUser = await res.json();
              
              if (!googleUser.email || !googleUser.sub) {
                throw new Error("Invalid token payload returned from Google API.");
              }

              const demo = credentials[role];
              let authenticatedUser;
              
              if (role === "citizen") {
                authenticatedUser = {
                  id: googleUser.sub,
                  name: googleUser.name || "Google Citizen",
                  email: googleUser.email,
                  avatar: googleUser.picture,
                  phone: demo.phone,
                  role: "citizen",
                  points: 250,
                  badges: [
                    { id: "1", name: "First Reporter", description: "Reported first issue", icon: "🏆", earnedAt: new Date() },
                    { id: "2", name: "Community Hero", description: "Active community member", icon: "🦸", earnedAt: new Date() }
                  ],
                  language: lang,
                  notificationsEnabled: true,
                  location: { city: "Khunti", state: "Jharkhand" }
                };
              } else {
                authenticatedUser = role === "admin"
                  ? { id: googleUser.sub, name: googleUser.name, email: googleUser.email, avatar: googleUser.picture, role: "admin", department: "Public Works", language: lang, notificationsEnabled: true }
                  : { id: googleUser.sub, name: googleUser.name, email: googleUser.email, avatar: googleUser.picture, role: "ngo", department: "Environmental", language: lang, notificationsEnabled: true };
              }

              onLogin(authenticatedUser);
            } catch (err) {
              alert(`Failed to complete authentication: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
          error_callback: (err) => {
            setLoading(false);
            alert(`Google Authentication error: ${err.message || "The popup was closed or authentication failed."}`);
          }
        });

        tokenClient.requestAccessToken({ prompt: "consent" });
      } catch (error) {
        // Fallback to mock Google sign in if Google SDK initialization fails
        setMockEmail("");
        setMockStep(2);
        setMockError("");
        setActiveMockAuth("Google");
        setLoading(false);
      }
    } else if (provider === "Apple") {
      setMockEmail("");
      setMockPassword("");
      setMockStep(1);
      setMockError("");
      setMockScanStatus("idle");
      setActiveMockAuth("Apple");
    } else if (provider === "Phone") {
      setMockPhone("");
      setMockOtp("");
      setMockStep(1);
      setMockError("");
      setMockCountdown(30);
      setActiveMockAuth("Phone");
    }
  };

  const translate = (key) => {
    const content = {
      en: { title: "CivicReport", subtitle: "Community Issue Tracker", citizenLogin: "Citizen Login", adminLogin: "Admin Login", ngoLogin: "NGO Login", citizenPortal: "Citizen Portal", adminDashboard: "Admin Dashboard", ngoPortal: "NGO Portal", citizenDesc: "Report and track civic issues in your community", adminDesc: "Manage and resolve community issues", ngoDesc: "Collaborate on community development projects", emailLogin: "Email Login", phoneLogin: "Phone Login", otpLogin: "OTP Login", emailAddress: "Email Address", phoneNumber: "Phone Number", password: "Password", otp: "Enter OTP", sendOTP: "Send OTP", signIn: "Sign In", rememberMe: "Remember me", forgotPassword: "Forgot password?", demoCredentials: "Demo Credentials", fillDemo: "Fill demo credentials", noAccount: "Don't have an account?", signUp: "Sign up here", trustedCities: "Trusted by 50+ Cities", realTimeUpdates: "Real-time Updates" },
      hi: { title: "नागरिक रिपोर्ट", subtitle: "समुदाय समस्या ट्रैकर", citizenLogin: "नागरिक लॉगिन", adminLogin: "एडमिन लॉगिन", ngoLogin: "एनजीओ लॉगिन", citizenPortal: "नागरिक पोर्टल", adminDashboard: "एडमिन डैशबोर्ड", ngoPortal: "एनजीओ पोर्टल", citizenDesc: "अपने समुदाय में नागरिक समस्याओं की रिपोर्ट करें और ट्रैक करें", adminDesc: "समुदाय समस्याओं का प्रबंधन और समाधान करें", ngoDesc: "समुदाय विकास परियोजनाओं में सहयोग करें", emailLogin: "ईमेल लॉगिन", phoneLogin: "फोन लॉगिन", otpLogin: "OTP लॉगिन", emailAddress: "ईमेल पता", phoneNumber: "फोन नंबर", password: "पासवर्ड", otp: "OTP दर्ज करें", sendOTP: "OTP भेजें", signIn: "साइन इन करें", rememberMe: "मुझे याद रखें", forgotPassword: "पासवर्ड भूल गए?", demoCredentials: "डेमो क्रेडेंशियल्स", fillDemo: "डेमो क्रेडेंशियल्स भरें", noAccount: "खाता नहीं है?", signUp: "यहाँ साइन अप करें", trustedCities: "50+ शहरों द्वारा विश्वसनीय", realTimeUpdates: "रियल-टाइम अपडेट" },
      bho: { title: "नागरिक रिपोर्ट", subtitle: "समुदाय समस्या ट्रैकर", citizenLogin: "नागरिक लॉगिन", adminLogin: "एडमिन लॉगिन", ngoLogin: "एनजीओ लॉगिन", citizenPortal: "नागरिक पोर्टल", adminDashboard: "एडमिन डैशबोर्ड", ngoPortal: "एनजीओ पोर्टल", citizenDesc: "अपन समुदाय में नागरिक समस्या के रिपोर्ट करीं और ट्रैक करीं", adminDesc: "समुदाय समस्या के प्रबंधन और समाधान करीं", ngoDesc: "समुदाय विकास परियोजना में सहयोग करीं", emailLogin: "ईमेल लॉगिन", phoneLogin: "फोन लॉगिन", otpLogin: "OTP लॉगिन", emailAddress: "ईमेल पता", phoneNumber: "फोन नंबर", password: "पासवर्ड", otp: "OTP दर्ज करीं", sendOTP: "OTP भेजीं", signIn: "साइन इन करीं", rememberMe: "हमरा याद रखीं", forgotPassword: "पासवर्ड भूल गइल?", demoCredentials: "डेमो क्रेडेंशियल्स", fillDemo: "डेमो क्रेडेंशियल्स भरें", noAccount: "खाता नइखे?", signUp: "एहाँ साइन अप करीं", trustedCities: "50+ शहर द्वारा विश्वसनीय", realTimeUpdates: "रियल-टाइम अपडेट" },
      mai: { title: "नागरिक रिपोर्ट", subtitle: "समुदाय समस्या ट्रैकर", citizenLogin: "नागरिक लॉगिन", adminLogin: "एडमिन लॉगिन", ngoLogin: "एनजीओ लॉगिन", citizenPortal: "नागरिक पोर्टल", adminDashboard: "एडमिन डैशबोर्ड", ngoPortal: "एनजीओ पोर्टल", citizenDesc: "अपन समुदाय में नागरिक समस्या के रिपोर्ट करू और ट्रैक करू", adminDesc: "समुदाय समस्या के प्रबंधन और समाधान करू", ngoDesc: "समुदाय विकास परियोजना में सहयोग करू", emailLogin: "ईमेल लॉगिन", phoneLogin: "फोन लॉगिन", otpLogin: "OTP लॉगिन", emailAddress: "ईमेल पता", phoneNumber: "फोन नंबर", password: "पासवर्ड", otp: "OTP दर्ज करू", sendOTP: "OTP भेजू", signIn: "साइन इन करू", rememberMe: "हमरा याद रखू", forgotPassword: "पासवर्ड भूल गइल?", demoCredentials: "डेमो क्रेडेंशियल्स", fillDemo: "डेमो क्रेडेंशियल्स भरें", noAccount: "खाता नइखे?", signUp: "एतय साइन अप करू", trustedCities: "50+ शहर द्वारा विश्वसनीय", realTimeUpdates: "रियल-टाइम अपडेट" },
      mag: { title: "नागरिक रिपोर्ट", subtitle: "समुदाय समस्या ट्रैकर", citizenLogin: "नागरिक लॉगिन", adminLogin: "एडमिन लॉगिन", ngoLogin: "एनजीओ लॉगिन", citizenPortal: "नागरिक पोर्टल", adminDashboard: "एडमिन डैशबोर्ड", ngoPortal: "एनजीओ पोर्टल", citizenDesc: "अपन समुदाय में नागरिक समस्या के रिपोर्ट करो और ट्रैक करो", adminDesc: "समुदाय समस्या के प्रबंधन और समाधान करो", ngoDesc: "समुदाय विकास परियोजना में सहयोग करो", emailLogin: "ईमेल लॉगिन", phoneLogin: "फोन लॉगिन", otpLogin: "OTP लॉगिन", emailAddress: "ईमेल पता", phoneNumber: "फोन नंबर", password: "पासवर्ड", otp: "OTP दर्ज करो", sendOTP: "OTP भेजो", signIn: "साइन इन करो", rememberMe: "हमरा याद रखो", forgotPassword: "पासवर्ड भूल गइल?", demoCredentials: "डेमो क्रेडेंशियल्स", fillDemo: "डेमो क्रेडेंशियल्स भरें", noAccount: "खाता नइखे?", signUp: "एहाँ साइन अप करो", trustedCities: "50+ शहर द्वारा विश्वसनीय", realTimeUpdates: "रियल-टाइम अपडेट" },
      sat: { title: "ᱛᱚᱨᱡᱚᱢ ᱨᱤᱯᱚᱨᱴ", subtitle: "ᱥᱚᱢᱟᱡ ᱥᱚᱢᱟᱱ ᱴᱨᱮᱠᱟᱨ", citizenLogin: "ᱛᱚᱨᱡᱚᱢ ᱞᱚᱜᱤᱱ", adminLogin: "ᱮᱰᱢᱤᱱ ᱞᱚᱜᱤᱱ", ngoLogin: "ᱮᱱᱡᱤᱭᱚ ᱞᱚᱜᱤᱱ", citizenPortal: "ᱛᱚᱨᱡᱚᱢ ᱯᱚᱨᱴᱟᱞ", adminDashboard: "ᱮᱰᱢᱤᱱ ᱰᱮᱥᱵᱚᱰ", ngoPortal: "ᱮᱱᱡᱤᱭᱚ ᱯᱚᱨᱴᱟᱞ", citizenDesc: "ᱟᱯᱱᱟᱨ ᱥᱚᱢᱟᱡ ᱨᱮ ᱛᱚᱨᱡᱚᱢ ᱥᱚᱢᱟᱱ ᱨᱤᱯᱚᱨᱴ ᱟᱨ ᱴᱨᱮᱠ ᱢᱮᱭᱟᱨ ᱢᱮ", adminDesc: "ᱥᱚᱢᱟᱡ ᱥᱚᱢᱟᱱ ᱢᱮᱱᱮᱡ ᱟᱨ ᱨᱤᱡᱚᱞᱵ ᱢᱮ", ngoDesc: "ᱥᱚᱢᱟᱡ ᱰᱮᱵᱮᱞᱚᱯᱢᱮᱱᱴ ᱯᱨᱚᱡᱮᱠᱴ ᱨᱮ ᱠᱚᱞᱟᱵᱚᱨᱮᱴ ᱢᱮ", emailLogin: "ᱤᱢᱮᱞ ᱞᱚᱜᱤᱱ", phoneLogin: "ᱯᱷᱚᱱ ᱞᱚᱜᱤᱱ", otpLogin: "OTP ᱞᱚᱜᱤᱱ", emailAddress: "ᱤᱢᱮᱞ ᱮᱰᱨᱮᱥ", phoneNumber: "ᱯᱷᱚᱱ ᱱᱟᱹᱢᱵᱟᱨ", password: "ᱯᱟᱥᱣᱟᱰ", otp: "OTP ᱫᱚᱡ ᱢᱮ", sendOTP: "OTP ᱵᱷᱮᱡᱟᱭ ᱢᱮ", signIn: "ᱥᱟᱭᱱ ᱤᱱ ᱢᱮ", rememberMe: "ᱤᱱᱟᱹᱨ ᱭᱟᱫ ᱨᱟᱠᱷᱚᱭ ᱢᱮ", forgotPassword: "ᱯᱟᱥᱣᱟᱰ ᱵᱷᱩᱞ ᱜᱮᱞ ᱠᱟ?", demoCredentials: "ᱰᱮᱢᱚ ᱠᱨᱮᱰᱮᱱᱥᱤᱭᱟᱞᱥ", fillDemo: "ᱰᱮᱢᱚ ᱠᱨᱮᱰᱮᱱᱥᱤᱭᱟᱞᱥ ᱵᱷᱚᱨ ᱢᱮ", noAccount: "ᱠᱷᱟᱛᱟ ᱵᱟᱹᱱᱩᱜ?", signUp: "ᱱᱚᱰᱮ ᱥᱟᱭᱱ ᱟᱯ ᱢᱮ", trustedCities: "50+ ᱥᱚᱦᱚᱨ ᱫᱣᱟᱨᱟ ᱵᱤᱥᱣᱟᱥᱱᱤᱭ", realTimeUpdates: "ᱨᱤᱭᱟᱞ-ᱴᱟᱭᱢ ᱟᱯᱰᱮᱴᱥ" },
      ta: { title: "சிவிக்ரிப்போர்ட்", subtitle: "பிரச்சனை கண்காணிப்பாளர்", citizenLogin: "குடிமகன் உள்நுழைவு", adminLogin: "அதிகாரி உள்நுழைவு", ngoLogin: "என்.ஜி.ஓ உள்நுழைவு", citizenPortal: "குடிமகன் போர்டல்", adminDashboard: "அதிகாரி டாஷ்போர்டு", ngoPortal: "என்.ஜி.ஓ போர்டல்", citizenDesc: "உங்கள் சமூகத்தில் உள்ள குடிமைப் பிரச்சினைகளைப் புகாரளித்து கண்காணிக்கவும்", adminDesc: "சமூகப் பிரச்சினைகளை நிர்வகித்து தீர்க்கவும்", ngoDesc: "சமூக மேம்பாட்டுத் திட்டங்களில் இணைந்து செயல்படுங்கள்", emailLogin: "மின்னஞ்சல் உள்நுழைவு", phoneLogin: "கைப்பேசி எண் உள்நுழைவு", otpLogin: "OTP உள்நுழைவு", emailAddress: "மின்னஞ்சல் முகவரி", phoneNumber: "கைப்பேசி எண்", password: "கடவுச்சொல்", otp: "OTP ஐ உள்ளிடவும்", sendOTP: "OTP அனுப்பவும்", signIn: "உள்நுழைக", rememberMe: "என்னை நினைவில் கொள்", forgotPassword: "கடவுச்சொல் மறந்துவிட்டதா?", demoCredentials: "டெமோ சான்றுகள்", fillDemo: "டெமோ சான்றுகளை நிரப்பவும்", noAccount: "கணக்கு இல்லையா?", signUp: "இங்கே பதிவு செய்யுங்கள்", trustedCities: "50+ நகரங்கள் நம்புகின்றன", realTimeUpdates: "உடனடி இரைச்சல்கள்" },
      ml: { title: "സിവിക് റിപ്പോർട്ട്", subtitle: "പ്രശ്ന ട്രാക്കർ", citizenLogin: "പൗരൻ ലോഗിൻ", adminLogin: "അഡ്മിൻ ലോഗിൻ", ngoLogin: "എൻജിഒ ലോഗിൻ", citizenPortal: "പൗരൻ പോർട്ടൽ", adminDashboard: "അഡ്മിൻ ഡാഷ്‌ബോർഡ്", ngoPortal: "എൻജിഒ പോർട്ടൽ", citizenDesc: "നിങ്ങളുടെ കമ്മ്യൂണിറ്റിയിലെ പൗര പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യുക", adminDesc: "കമ്മ്യൂണിറ്റി പ്രശ്നങ്ങൾ പരിഹരിക്കുക", ngoDesc: "കമ്മ്യൂണിറ്റി വികസന പദ്ധതികളിൽ സഹകരിക്കുക", emailLogin: "ഇമെയിൽ ലോഗിൻ", phoneLogin: "ഫോൺ ലോഗിൻ", otpLogin: "ഒടിപി ലോഗിൻ", emailAddress: "ഇമെയിൽ വിലാസം", phoneNumber: "ഫോൺ നമ്പർ", password: "പാസ്‌വേഡ്", otp: "ഒടിപി നൽകുക", sendOTP: "ഒടിപി അയക്കുക", signIn: "ലോഗിൻ ചെയ്യുക", rememberMe: "ഓർത്തു വെക്കുക", forgotPassword: "പാസ്‌വേഡ് മറന്നോ?", demoCredentials: "ഡെമോ വിവരങ്ങൾ", fillDemo: "ഡെമോ വിവരങ്ങൾ നൽകുക", noAccount: "അക്കൗണ്ട് ഇല്ലേ?", signUp: "ഇവിടെ രജിസ്റ്റർ ചെയ്യുക", trustedCities: "50+ നഗരങ്ങൾ വിശ്വസിക്കുന്നു", realTimeUpdates: "തത്സമയ വിവരങ്ങൾ" },
    };
    return content[lang]?.[key] || content.en[key];
  };

  return (
    <div data-theme={theme} data-mode={mode} className="min-h-screen gradient-theme-light pattern-professional flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-theme-200/20 rounded-full blur-3xl animate-blob-1" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-theme-100/15 rounded-full blur-3xl animate-blob-2" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-theme-300/10 rounded-full blur-2xl animate-blob-3" />

      <div className="max-w-4xl w-full relative z-10 font-sans px-4">
        {/* Theme and Language Toolbar */}
        <div className="flex items-center justify-between mb-4 animate-float-in gap-3">
          {/* Theme Palette Swatches */}
          <div className="flex items-center space-x-1.5 bg-white/75 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-dark-100/10 shadow-sm">
            {themesList.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onThemeChange && onThemeChange(t.id)}
                title={`Theme: ${t.name}`}
                className={`w-3.5 h-3.5 rounded-full ${t.color} cursor-pointer hover:scale-125 transition-transform duration-200 relative ${
                  theme === t.id ? "ring-2 ring-white ring-offset-2 ring-offset-theme-500 scale-110 shadow-md" : "opacity-85"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Switch */}
            <button
              type="button"
              onClick={onModeToggle}
              className="p-1.5 bg-white/75 hover:bg-white border border-dark-100/10 rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-dark-600 hover:text-theme-600 shadow-sm flex items-center justify-center"
              title={mode === "light" ? "Switch to Midnight Dark" : "Switch to Light Mode"}
            >
              {mode === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
            </button>

            {/* Language Selector */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="px-3 py-1.5 glass rounded-xl text-xs font-bold text-dark-850 cursor-pointer border-0 shadow-sm hover:shadow-md transition-all focus:outline-none"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Logo and Titles */}
        <div className="text-center mb-8 animate-float-in flex flex-col items-center justify-center" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-center w-20 h-20 bg-white/95 rounded-full mb-3 shadow-lg border border-theme-200/50 p-1.5 hover:rotate-6 transition-transform duration-300">
            <img src="/assets/jharkhand_emblem.png" alt="Emblem of Jharkhand" className="w-full h-full object-contain" />
          </div>
          <span className="text-[10px] font-black text-theme-750 tracking-widest uppercase mb-1">Government of Jharkhand • झारखंड सरकार</span>
          <h1 className="text-2xl font-black text-dark-850 tracking-tight leading-tight">
            Jharkhand Civic Pragati Portal
          </h1>
          <p className="text-dark-600 font-bold text-[10.5px] mt-0.5">
            Official Civic Engagement & Quick Issue Resolution Dashboard
          </p>
          {/* Traditional ornamental divider */}
          <div className="flex items-center justify-center mt-3 gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-theme-350" />
            <div className="w-1.5 h-1.5 rounded-full bg-theme-400" />
            <div className="w-1 h-1 rounded-full bg-theme-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-theme-400" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-theme-350" />
          </div>
        </div>

        {/* Auth Box */}
        <div className="glass rounded-3xl shadow-xl overflow-hidden animate-float-in border border-theme-100/30 hover:border-theme-350/40 hover:shadow-2xl transition-all duration-500 grid grid-cols-1 md:grid-cols-12" style={{ animationDelay: "200ms" }}>
          
          {/* Left Column: Authentic JHARKHAND 24x7 TV News Channel Broadcast Studio Panel */}
          <Jharkhand24x7NewsChannelBanner />

          {/* Right Column: Auth Forms */}
          <div className="col-span-1 md:col-span-7 flex flex-col justify-between">
            {/* Theme accent top line */}
            <div className="h-1 gradient-theme animate-shimmer" />

            {/* Role Tabs */}
            <div className="flex p-1 bg-dark-50/50 rounded-t-3xl border-b border-dark-100/40">
            {[
              { id: "citizen", label: translate("citizenLogin"), Icon: Users },
              { id: "admin", label: translate("adminLogin"), Icon: Shield },
              { id: "ngo", label: translate("ngoLogin"), Icon: Globe },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleRoleTabClick(id)}
                className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all duration-300 cursor-pointer ${
                  role === id
                    ? "bg-white text-theme-600 shadow-sm border border-dark-100/10 font-extrabold scale-102"
                    : "text-dark-500 hover:text-theme-700 hover:bg-theme-50/30"
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-black text-dark-800 tracking-tight mb-1">
                {translate(role === "citizen" ? "citizenPortal" : role === "admin" ? "adminDashboard" : "ngoPortal")}
              </h2>
              <p className="text-dark-500 text-xs font-semibold leading-relaxed">
                {translate(role === "citizen" ? "citizenDesc" : role === "admin" ? "adminDesc" : "ngoDesc")}
              </p>
            </div>

            {/* Social Logins */}
            {role === "citizen" && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Google")}
                    className="py-3 px-4 bg-white border border-dark-100 hover:border-dark-250 rounded-2xl flex items-center justify-center text-xs font-bold text-dark-700 shadow-sm hover:shadow transition-all duration-200 cursor-pointer scale-100 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <svg className="h-4.5 w-4.5 mr-2 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Apple")}
                    className="py-3 px-4 bg-white border border-dark-100 hover:border-dark-250 rounded-2xl flex items-center justify-center text-xs font-bold text-dark-700 shadow-sm hover:shadow transition-all duration-200 cursor-pointer scale-100 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <svg className="h-4.5 w-4.5 mr-2 fill-dark-800 shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 3 .95.07 2.1-.54 2.8-1.44z" />
                    </svg>
                    <span>Apple ID</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleSocialLogin("Phone")}
                  className="w-full py-3 px-4 bg-white border border-dark-100 hover:border-dark-250 rounded-2xl flex items-center justify-center text-xs font-bold text-dark-700 shadow-sm hover:shadow transition-all duration-200 cursor-pointer scale-100 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Phone className="h-4.5 w-4.5 mr-2 text-theme-600 shrink-0" />
                  <span>Verify Mobile & Login via OTP</span>
                </button>

                <div className="flex items-center my-4">
                  <div className="h-px flex-1 bg-dark-100/50" />
                  <span className="px-3 text-[9px] font-bold text-dark-400 uppercase tracking-widest">or login with email</span>
                  <div className="h-px flex-1 bg-dark-100/50" />
                </div>
              </>
            )}

            {/* Manual Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3.5">
                {/* Email Address */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={translate("emailAddress")}
                      className={`w-full px-5 py-3 pr-10 border rounded-2xl text-xs bg-white/80 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 font-semibold text-dark-750 ${
                        emailStatus === "valid"
                          ? "border-green-400 focus:ring-green-200 focus:border-green-500"
                          : emailStatus === "invalid_format" || emailStatus === "invalid_domain"
                          ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                          : "border-dark-200/80 focus:ring-theme-300 focus:border-theme-500"
                      }`}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      {emailStatus === "validating" && (
                        <div className="w-4 h-4 border-2 border-theme-400 border-t-transparent rounded-full animate-spin" />
                      )}
                      {emailStatus === "valid" && (
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {(emailStatus === "invalid_format" || emailStatus === "invalid_domain") && (
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {emailMessage && (
                    <p
                      className={`mt-1.5 text-[10px] font-semibold flex items-center gap-1 px-1 transition-all ${
                        emailStatus === "valid"
                          ? "text-green-600"
                          : emailStatus === "validating"
                          ? "text-theme-500"
                          : "text-red-500"
                      }`}
                    >
                      {emailStatus === "validating" && <span>⏳</span>}
                      {emailStatus === "valid" && <span>✅</span>}
                      {(emailStatus === "invalid_format" || emailStatus === "invalid_domain") && <span>❌</span>}
                      {emailMessage}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={translate("password")}
                    className="w-full px-5 py-3 pr-12 border border-dark-200/80 rounded-2xl text-xs bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-theme-300 focus:border-theme-500 transition-all duration-200 font-semibold text-dark-750"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Actions & Forgot Option */}
              <div className="flex items-center justify-between px-1 text-xs">
                <label className="flex items-center select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                    className="h-4 w-4 text-theme-600 focus:ring-theme-500 border-theme-200 rounded cursor-pointer accent-theme-600"
                  />
                  <span className="ml-2 text-dark-500 font-semibold text-xs">{translate("rememberMe")}</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveForgotModal(true);
                    setForgotStep(1);
                    setForgotPhone("");
                    setForgotOtp("");
                    setForgotNewPassword("");
                    setForgotConfirmPassword("");
                    setForgotError("");
                    setForgotCountdown(30);
                  }}
                  className="text-theme-600 hover:text-theme-700 transition-colors font-extrabold cursor-pointer"
                >
                  {translate("forgotPassword")}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-theme-500 to-theme-600 hover:from-theme-600 hover:to-theme-700 text-white font-black text-xs py-3 px-4 rounded-full transition-all shadow-md shadow-theme-500/10 hover:shadow-lg hover:shadow-theme-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 tracking-wider uppercase mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{translate("signIn")}</span>
                )}
              </button>
            </form>

            {/* Quick Simulator Profile Access — Admin Only */}
            {role === "admin" && (
              <div className="mt-6 pt-5 border-t border-dark-100/30">
                <label className="block text-[9px] font-black text-dark-400 uppercase tracking-widest text-center mb-1">
                  Demo Department Login IDs
                </label>
                <p className="text-[8.5px] text-dark-400 text-center mb-3 font-medium">
                  Click a card to fill credentials · Works only in Admin Login
                </p>
                <div className="space-y-2 font-sans">
                  {[
                    { key: "road_admin",        id: "road-admin-1",    emoji: "🚗", label: "Roads Dept" },
                    { key: "water_admin",       id: "water-admin-1",   emoji: "💧", label: "Water Supply" },
                    { key: "garbage_admin",     id: "garbage-admin-1", emoji: "🗑️", label: "Sanitation" },
                    { key: "electricity_admin", id: "elec-admin-1",    emoji: "⚡", label: "Power Dept" },
                    { key: "streetlight_admin", id: "light-admin-1",   emoji: "💡", label: "Streetlights" },
                    { key: "safety_admin",      id: "safety-admin-1",  emoji: "👮", label: "Public Safety" },
                    { key: "parks_admin",       id: "parks-admin-1",   emoji: "🌳", label: "Forestry" },
                    { key: "drainage_admin",    id: "drain-admin-1",   emoji: "🌊", label: "Drainage" },
                    { key: "noise_admin",       id: "noise-admin-1",   emoji: "📢", label: "Environment" },
                  ].reduce((rows, item, i) => {
                    if (i % 3 === 0) rows.push([]);
                    rows[rows.length - 1].push(item);
                    return rows;
                  }, []).map((row, ri) => (
                    <div key={ri} className="grid grid-cols-3 gap-2">
                      {row.map(({ key, id, emoji, label }) => {
                        const demo = credentials[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setForm({ email: demo.email, password: demo.password, phone: "", otp: "", rememberMe: true });
                            }}
                            title={`Click to fill: ${demo.email} / ${demo.password}`}
                            className="py-2 px-1.5 bg-white hover:bg-peacock-50 border border-peacock-200/60 hover:border-peacock-400/60 rounded-xl flex flex-col items-start gap-0.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md text-left group"
                          >
                            <div className="flex items-center gap-1 w-full">
                              <span className="text-sm">{emoji}</span>
                              <span className="text-[7.5px] font-black text-peacock-800 uppercase tracking-wide truncate">{label}</span>
                            </div>
                            <div className="w-full mt-0.5 space-y-0.5">
                              <div className="flex items-center gap-1">
                                <span className="text-[6.5px] font-bold text-dark-400 uppercase w-3 shrink-0">ID</span>
                                <span className="text-[7px] font-mono font-semibold text-dark-700 truncate">{demo.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[6.5px] font-bold text-dark-400 uppercase w-3 shrink-0">PW</span>
                                <span className="text-[7px] font-mono font-semibold text-peacock-700">{demo.password}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Mock Authentication Modals */}
      {activeMockAuth && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          
          {/* GOOGLE MOCK OAUTH MODAL */}
          {activeMockAuth === "Google" && (
            <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-dark-100 animate-float-in flex flex-col font-sans text-dark-800">
              <div className="flex justify-between items-center p-5 border-b border-dark-100">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span className="font-bold text-sm tracking-tight text-dark-700">Sign in with Google</span>
                </div>
                <button onClick={() => setActiveMockAuth(null)} className="p-1 text-dark-400 hover:text-dark-600 rounded-full hover:bg-dark-50 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {mockStep === 2 ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!mockEmail.trim()) return;
                  
                  const namePart = mockEmail.split("@")[0];
                  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._-]/g, " ");
                  
                  let user;
                  if (role === "citizen") {
                    user = { id: Math.random().toString(), name: `${displayName} (Google)`, email: mockEmail, phone: "+919999999999", role: "citizen", points: 100, badges: [], language: lang, notificationsEnabled: true, location: { city: "Khunti", state: "Jharkhand" } };
                  } else if (role === "admin") {
                    user = { id: Math.random().toString(), name: `${displayName} (Google)`, email: mockEmail, role: "admin", department: "General Administration", language: lang, notificationsEnabled: true };
                  } else {
                    user = { id: Math.random().toString(), name: `${displayName} (Google)`, email: mockEmail, role: "ngo", department: "Community Support", language: lang, notificationsEnabled: true };
                  }
                  
                  setMockStep(3);
                  setTimeout(() => {
                    onLogin(user);
                    setActiveMockAuth(null);
                  }, 1200);
                }} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark-500 uppercase tracking-wide px-1">Enter Google Account Email</label>
                    <input
                      type="email"
                      required
                      value={mockEmail}
                      onChange={(e) => setMockEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full px-4 py-3 border border-dark-200 focus:border-theme-500 rounded-xl text-sm focus:outline-none transition-colors shadow-sm bg-white"
                    />
                  </div>
                  {mockError && <p className="text-xs font-bold text-red-500 px-1">{mockError}</p>}
                  
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveMockAuth(null)}
                      className="flex-1 py-3 px-4 bg-dark-50 hover:bg-dark-100 rounded-xl text-xs font-bold text-dark-700 tracking-wide transition-colors cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 bg-theme-600 hover:bg-theme-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm cursor-pointer text-center"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-theme-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold text-dark-700">Connecting to Google Account...</p>
                </div>
              )}
            </div>
          )}

          {/* APPLE MOCK OAUTH MODAL */}
          {activeMockAuth === "Apple" && (
            <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-float-in flex flex-col font-sans">
              <div className="flex justify-between items-center p-5 border-b border-neutral-800">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 3 .95.07 2.1-.54 2.8-1.44z" />
                  </svg>
                  <span className="font-bold text-sm tracking-tight text-neutral-200">Sign in with Apple ID</span>
                </div>
                <button onClick={() => setActiveMockAuth(null)} className="p-1 text-neutral-400 hover:text-neutral-200 rounded-full hover:bg-neutral-800 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {mockStep === 1 ? (
                <div className="p-6 space-y-5">
                  <div className="text-center py-2">
                    <p className="text-xs font-semibold text-neutral-400">Use your Apple ID to sign in to CivicReport.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setMockStep(2);
                        setMockScanStatus("idle");
                      }}
                      className="w-full py-4 px-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 rounded-2xl flex items-center justify-center space-x-3 transition-all cursor-pointer text-sm font-bold text-neutral-200"
                    >
                      <Fingerprint className="h-5 w-5 text-neutral-300" />
                      <span>Authenticate with Touch ID</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-neutral-800"></div>
                      <span className="flex-shrink mx-3 text-xs font-bold text-neutral-600 uppercase tracking-widest">or</span>
                      <div className="flex-grow border-t border-neutral-800"></div>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!mockEmail.trim() || !mockPassword.trim()) {
                        setMockError("Please enter Apple ID and Password");
                        return;
                      }
                      const namePart = mockEmail.split("@")[0];
                      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._-]/g, " ");
                      
                      let user;
                      if (role === "citizen") {
                        user = { id: Math.random().toString(), name: `${displayName} (Apple)`, email: mockEmail, phone: "+919999999999", role: "citizen", points: 250, badges: [{ id: "1", name: "First Reporter", description: "Reported first issue", icon: "🏆", earnedAt: new Date() }, { id: "2", name: "Community Hero", description: "Active community member", icon: "🦸", earnedAt: new Date() }], language: lang, notificationsEnabled: true, location: { city: "Khunti", state: "Jharkhand" } };
                      } else if (role === "admin") {
                        user = { id: Math.random().toString(), name: `${displayName} (Apple)`, email: mockEmail, role: "admin", department: "Public Works", language: lang, notificationsEnabled: true };
                      } else {
                        user = { id: Math.random().toString(), name: `${displayName} (Apple)`, email: mockEmail, role: "ngo", department: "Environmental", language: lang, notificationsEnabled: true };
                      }

                      setMockStep(3);
                      setTimeout(() => {
                        onLogin(user);
                        setActiveMockAuth(null);
                      }, 1200);
                    }} className="space-y-3">
                      <div>
                        <input
                          type="text"
                          required
                          value={mockEmail}
                          onChange={(e) => setMockEmail(e.target.value)}
                          placeholder="Apple ID (Email or Phone)"
                          className="w-full px-4 py-3 border border-neutral-800 focus:border-neutral-600 rounded-xl text-sm focus:outline-none bg-neutral-950 text-white placeholder-neutral-500"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          required
                          value={mockPassword}
                          onChange={(e) => setMockPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full px-4 py-3 border border-neutral-800 focus:border-neutral-600 rounded-xl text-sm focus:outline-none bg-neutral-950 text-white placeholder-neutral-500"
                        />
                      </div>
                      {mockError && <p className="text-xs font-bold text-red-400 px-1">{mockError}</p>}
                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-white hover:bg-neutral-100 text-black font-bold rounded-full text-sm transition-colors cursor-pointer mt-3"
                      >
                        Sign in with Password
                      </button>
                    </form>
                  </div>
                </div>
              ) : mockStep === 2 ? (
                <div className="p-8 flex flex-col items-center justify-center space-y-6">
                  <p className="text-sm font-semibold text-neutral-300 text-center">Place finger on Touch ID sensor to log in</p>
                  
                  <div 
                    onClick={() => {
                      if (mockScanStatus !== "idle") return;
                      setMockScanStatus("scanning");
                      setTimeout(() => {
                        setMockScanStatus("success");
                        setTimeout(() => {
                          const demo = credentials[role];
                          let user;
                          if (role === "citizen") {
                            user = { id: "apple-1", name: "Rajesh (Apple)", email: `apple-${role}@demo.com`, phone: demo.phone, role: "citizen", points: 250, badges: [{ id: "1", name: "First Reporter", description: "Reported first issue", icon: "🏆", earnedAt: new Date() }, { id: "2", name: "Community Hero", description: "Active community member", icon: "🦸", earnedAt: new Date() }], language: lang, notificationsEnabled: true, location: { city: "Khunti", state: "Jharkhand" } };
                          } else if (role === "admin") {
                            user = { id: "apple-2", name: "Priya (Apple)", email: `apple-${role}@demo.com`, role: "admin", department: "Public Works", language: lang, notificationsEnabled: true };
                          } else {
                            user = { id: "apple-3", name: "Green Earth NGO (Apple)", email: `apple-${role}@demo.com`, role: "ngo", department: "Environmental", language: lang, notificationsEnabled: true };
                          }
                          onLogin(user);
                          setActiveMockAuth(null);
                        }, 800);
                      }, 1800);
                    }}
                    className={`w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer ${
                      mockScanStatus === "idle" ? "border-neutral-600 hover:border-neutral-400 bg-neutral-800" :
                      mockScanStatus === "scanning" ? "border-theme-500 bg-neutral-800 animate-pulse scale-105" :
                      "border-green-500 bg-green-950/20 scale-105 text-green-400"
                    }`}
                  >
                    <Fingerprint className={`h-16 w-16 transition-colors duration-300 ${
                      mockScanStatus === "idle" ? "text-neutral-400" :
                      mockScanStatus === "scanning" ? "text-theme-400 animate-pulse" :
                      "text-green-400"
                    }`} />
                  </div>
                  
                  <div className="text-center">
                    <p className={`text-xs font-bold transition-all duration-300 ${
                      mockScanStatus === "idle" ? "text-neutral-500" :
                      mockScanStatus === "scanning" ? "text-theme-400" :
                      "text-green-400"
                    }`}>
                      {mockScanStatus === "idle" && "Click the sensor to authenticate"}
                      {mockScanStatus === "scanning" && "Scanning fingerprint..."}
                      {mockScanStatus === "success" && "Authentication Successful!"}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setMockStep(1)}
                    className="py-2 px-6 border border-neutral-800 hover:bg-neutral-800 rounded-full text-xs font-bold text-neutral-400 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-neutral-300">Connecting to Apple iCloud...</p>
                </div>
              )}
            </div>
          )}

          {/* PHONE MOCK OAUTH MODAL */}
          {activeMockAuth === "Phone" && (
            <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-dark-100 animate-float-in flex flex-col font-sans text-dark-800">
              <div className="flex justify-between items-center p-5 border-b border-dark-100">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-theme-500" />
                  <span className="font-bold text-sm tracking-tight text-dark-700">Continue with Phone</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowSmsSettings(true)}
                    className="p-1 text-theme-600 hover:text-theme-850 rounded-full hover:bg-theme-50/50 cursor-pointer"
                    title="Configure SMS Gateway"
                  >
                    <Settings className="h-4.5 w-4.5" />
                  </button>
                  <button onClick={() => setActiveMockAuth(null)} className="p-1 text-dark-400 hover:text-dark-600 rounded-full hover:bg-dark-50 cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {mockStep === 1 ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!mockPhone.trim() || mockPhone.length < 10) {
                    setMockError("Please enter a valid phone number.");
                    return;
                  }
                  setMockStep(2);
                  sendLoginOtp(mockPhone);
                }} className="p-6 space-y-5">
                  <div className="text-center py-1">
                    <p className="text-xs font-semibold text-dark-500">We will send a 6-digit one-time password (OTP) to verify your number.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-dark-500 uppercase tracking-wide px-1">Phone Number</label>
                      <div className="flex">
                        <select className="px-3 border border-r-0 border-dark-200 rounded-l-xl text-sm bg-dark-50 font-bold focus:outline-none">
                          <option>+91</option>
                          <option>+1</option>
                          <option>+44</option>
                          <option>+61</option>
                        </select>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          value={mockPhone}
                          onChange={(e) => setMockPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="99999 99999"
                          className="flex-1 px-4 py-3 border border-dark-200 focus:border-theme-500 rounded-r-xl text-sm focus:outline-none transition-colors bg-white font-mono"
                        />
                      </div>
                    </div>
                    {mockError && <p className="text-xs font-bold text-red-500 px-1">{mockError}</p>}
                    
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-dark-900 hover:bg-dark-800 text-white font-bold rounded-full text-sm transition-colors cursor-pointer mt-2 shadow-sm"
                    >
                      Send Verification Code
                    </button>
                  </div>
                </form>
              ) : mockStep === 2 ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (mockOtp !== generatedLoginOtp) {
                    setMockError("Incorrect OTP verification code. Please check the code and try again.");
                    return;
                  }

                  const demo = credentials[role];
                  let user;
                  if (role === "citizen") {
                    user = { id: Math.random().toString(), name: "Rajesh (Phone)", email: `phone-${role}@demo.com`, phone: `+91${mockPhone}`, role: "citizen", points: 250, badges: [{ id: "1", name: "First Reporter", description: "Reported first issue", icon: "🏆", earnedAt: new Date() }, { id: "2", name: "Community Hero", description: "Active community member", icon: "🦸", earnedAt: new Date() }], language: lang, notificationsEnabled: true, location: { city: "Khunti", state: "Jharkhand" } };
                  } else if (role === "admin") {
                    user = { id: Math.random().toString(), name: "Priya (Phone)", email: `phone-${role}@demo.com`, phone: `+91${mockPhone}`, role: "admin", department: "Public Works", language: lang, notificationsEnabled: true };
                  } else {
                    user = { id: Math.random().toString(), name: "Green Earth NGO (Phone)", email: `phone-${role}@demo.com`, phone: `+91${mockPhone}`, role: "ngo", department: "Environmental", language: lang, notificationsEnabled: true };
                  }

                  setMockStep(3);
                  setTimeout(() => {
                    onLogin(user);
                    setActiveMockAuth(null);
                  }, 1200);
                }} className="p-6 space-y-5">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-dark-500">Enter the 6-digit code sent to <span className="font-bold text-dark-800">+91 {mockPhone}</span></p>
                  </div>

                  {smsStatusMessage && (
                    <div className={`text-center text-[11px] font-bold py-1.5 px-3 rounded-xl border ${
                      smsStatusType === "success" 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                        : smsStatusType === "error" 
                          ? "bg-amber-50 border-amber-100 text-amber-850" 
                          : "bg-theme-50/50 border-theme-100/30 text-theme-850 animate-pulse"
                    }`}>
                      {smsStatusMessage}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        value={mockOtp}
                        onChange={(e) => setMockOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="000 000"
                        className="w-full px-4 py-3.5 border border-dark-200 focus:border-theme-500 rounded-xl text-lg font-black text-center tracking-widest focus:outline-none transition-colors bg-white font-mono"
                      />
                    </div>
                    {mockError && <p className="text-xs font-bold text-red-500 px-1">{mockError}</p>}
                    
                    <div className="bg-theme-50/40 border border-theme-100/30 rounded-2xl p-3 flex flex-col items-center justify-center space-y-0.5 text-center">
                      <span className="text-[9px] font-black text-theme-700 tracking-wider uppercase">
                        Simulated SMS Gateway
                      </span>
                      <span className="text-xs font-bold text-dark-750">
                        Simulated SMS OTP Code: {generatedLoginOtp}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-dark-500 px-1">
                      <span>Didn't receive code?</span>
                      {mockCountdown > 0 ? (
                        <span className="text-dark-400">Resend in {mockCountdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            sendLoginOtp(mockPhone);
                          }}
                          className="text-theme-600 hover:text-theme-700 transition-colors cursor-pointer"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setMockStep(1)}
                        className="flex-1 py-3 px-4 bg-dark-50 hover:bg-dark-100 rounded-xl text-xs font-bold text-dark-700 tracking-wide transition-colors cursor-pointer text-center"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 px-4 bg-theme-600 hover:bg-theme-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm cursor-pointer text-center"
                      >
                        Verify & Login
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-theme-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold text-dark-700">Verifying code and logging in...</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Forgot Password Modal */}
      {activeForgotModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-dark-100 animate-float-in flex flex-col font-sans text-dark-800">
            <div className="flex justify-between items-center p-5 border-b border-dark-100">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-theme-500" />
                <span className="font-bold text-sm tracking-tight text-dark-700">Forgot Password</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSmsSettings(true)}
                  className="p-1 text-theme-600 hover:text-theme-850 rounded-full hover:bg-theme-50/50 cursor-pointer"
                  title="Configure SMS Gateway"
                >
                  <Settings className="h-4.5 w-4.5" />
                </button>
                <button 
                  onClick={() => setActiveForgotModal(false)} 
                  className="p-1 text-dark-400 hover:text-dark-600 rounded-full hover:bg-dark-50 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* STEP 1: MOBILE NUMBER ENTRY */}
            {forgotStep === 1 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!forgotPhone.trim() || forgotPhone.length < 10) {
                  setForgotError("Please enter a valid 10-digit mobile number.");
                  return;
                }
                setForgotStep(2);
                sendForgotOtp(forgotPhone);
              }} className="p-6 space-y-5">
                <div className="text-center py-1">
                  <p className="text-xs font-semibold text-dark-500">Enter your registered mobile number to receive a reset code.</p>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark-500 uppercase tracking-wide px-1">Mobile Number</label>
                    <div className="flex">
                      <div className="px-3 py-3 border border-r-0 border-dark-200 rounded-l-xl text-sm bg-dark-50 font-bold select-none flex items-center justify-center">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="12345 67890"
                        className="flex-1 px-4 py-3 border border-dark-200 focus:border-theme-500 rounded-r-xl text-sm focus:outline-none transition-colors bg-white font-mono"
                      />
                    </div>
                  </div>
                  {forgotError && <p className="text-xs font-bold text-red-500 px-1">{forgotError}</p>}
                  
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-dark-900 hover:bg-dark-800 text-white font-bold rounded-full text-sm transition-colors cursor-pointer mt-2 shadow-sm"
                  >
                    Send Reset OTP
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {forgotStep === 2 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (forgotOtp !== generatedForgotOtp) {
                  setForgotError("Incorrect verification code. Please check the code and try again.");
                  return;
                }
                setForgotStep(3);
                setForgotError("");
              }} className="p-6 space-y-5">
                <div className="text-center">
                  <p className="text-xs font-semibold text-dark-500">Enter the 6-digit reset code sent to <span className="font-bold text-dark-800">+91 {forgotPhone}</span></p>
                </div>

                {smsStatusMessage && (
                  <div className={`text-center text-[11px] font-bold py-1.5 px-3 rounded-xl border ${
                    smsStatusType === "success" 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                      : smsStatusType === "error" 
                        ? "bg-amber-50 border-amber-100 text-amber-850" 
                        : "bg-theme-50/50 border-theme-100/30 text-theme-850 animate-pulse"
                  }`}>
                    {smsStatusMessage}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="000 000"
                      className="w-full px-4 py-3.5 border border-dark-200 focus:border-theme-500 rounded-xl text-lg font-black text-center tracking-widest focus:outline-none transition-colors bg-white font-mono"
                    />
                  </div>
                  {forgotError && <p className="text-xs font-bold text-red-500 px-1">{forgotError}</p>}
                  
                  <div className="bg-theme-50/40 border border-theme-100/30 rounded-2xl p-3 flex flex-col items-center justify-center space-y-0.5 text-center">
                    <span className="text-[9px] font-black text-theme-700 tracking-wider uppercase">
                      Simulated SMS Gateway
                    </span>
                    <span className="text-xs font-bold text-dark-750">
                      Simulated SMS Reset Code: {generatedForgotOtp}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-dark-500 px-1">
                    <span>Didn't receive code?</span>
                    {forgotCountdown > 0 ? (
                      <span className="text-dark-400">Resend in {forgotCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          sendForgotOtp(forgotPhone);
                        }}
                        className="text-theme-600 hover:text-theme-700 transition-colors cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="flex-1 py-3 px-4 bg-dark-50 hover:bg-dark-100 rounded-xl text-xs font-bold text-dark-700 tracking-wide transition-colors cursor-pointer text-center"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 bg-theme-600 hover:bg-theme-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm cursor-pointer text-center"
                    >
                      Verify Code
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 3: NEW & CONFIRM PASSWORD SETTING */}
            {forgotStep === 3 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (forgotNewPassword.length < 6) {
                  setForgotError("Password must be at least 6 characters long.");
                  return;
                }
                if (forgotNewPassword !== forgotConfirmPassword) {
                  setForgotError("Passwords do not match.");
                  return;
                }

                // Update the credential in-memory
                setCredentials(prev => ({
                  ...prev,
                  [role]: {
                    ...prev[role],
                    password: forgotNewPassword
                  }
                }));

                setForgotStep(4);
                setForgotError("");
              }} className="p-6 space-y-4">
                <div className="text-center pb-1">
                  <p className="text-xs font-semibold text-dark-500 font-sans">Set a new, strong password for your account.</p>
                </div>

                <div className="space-y-3 font-sans">
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-dark-600 uppercase tracking-wide px-1">New Password</label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 pr-10 border border-dark-200 focus:border-theme-500 rounded-xl text-sm focus:outline-none bg-white text-dark-800 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-8 text-dark-400 hover:text-dark-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-dark-600 uppercase tracking-wide px-1">Confirm Password</label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 pr-10 border border-dark-200 focus:border-theme-500 rounded-xl text-sm focus:outline-none bg-white text-dark-800 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-8 text-dark-400 hover:text-dark-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {forgotError && <p className="text-xs font-bold text-red-500 px-1">{forgotError}</p>}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-theme-600 hover:bg-theme-700 text-white font-bold rounded-full text-sm transition-colors cursor-pointer mt-3 shadow-md"
                >
                  Save & Update Password
                </button>
              </form>
            )}

            {/* STEP 4: SUCCESS */}
            {forgotStep === 4 && (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 border border-green-200 animate-glow">
                  <svg className="h-10 w-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-dark-800">Password Reset!</h4>
                  <p className="text-xs text-dark-500 font-semibold mt-1.5 leading-relaxed">
                    Your password has been successfully updated. You can now use your new credentials to log in.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveForgotModal(false);
                    // Pre-fill the password field to be user friendly!
                    setForm(prev => ({ ...prev, password: forgotNewPassword, email: credentials[role].email }));
                  }}
                  className="w-full py-3 px-4 bg-dark-900 hover:bg-dark-800 text-white font-bold rounded-full text-xs tracking-wide transition-colors cursor-pointer shadow-sm"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <SmsSettingsModal isOpen={showSmsSettings} onClose={() => setShowSmsSettings(false)} />
    </div>
  );
}
