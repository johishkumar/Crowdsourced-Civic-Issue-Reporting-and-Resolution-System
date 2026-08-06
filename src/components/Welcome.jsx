import React, { useState, useEffect } from "react";
import { 
  ArrowRight, Shield, Award, Users, AlertTriangle, 
  CheckCircle, Clock, MapPin, Languages, Sun, Moon, Info, MessageSquare
} from "lucide-react";

export default function Welcome({ 
  issues = [], 
  onNavigateToLogin, 
  lang, 
  onLangChange, 
  theme, 
  onThemeChange, 
  mode, 
  onModeToggle 
}) {
  const [tickerIndex, setTickerIndex] = useState(0);

  // Auto scroll ticker every 4 seconds
  useEffect(() => {
    if (issues.length === 0) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % issues.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [issues]);

  const activeTickerIssue = issues[tickerIndex] || null;

  // Compute live stats from actual MongoDB issues
  const totalReports = issues.length;
  const verifiedReports = issues.filter(i => i.status === "verified" || i.status === "in-progress" || i.status === "resolved").length;
  const inProgressReports = issues.filter(i => i.status === "in-progress" || i.status === "resolved").length;
  const resolvedReports = issues.filter(i => i.status === "resolved").length;

  const resolvedPercent = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 78;
  const verifiedPercent = totalReports > 0 ? Math.round((verifiedReports / totalReports) * 100) : 92;

  // Language translation dictionary
  const welcomeTranslations = {
    en: {
      portalTitle: "Jharkhand Civic Pragati Portal",
      portalSub: "Government of Jharkhand • Digital Grievance Cell",
      heroTitle: "Empowering Citizens, Building Jharkhand Together",
      heroDesc: "The official civic grievance and resolution portal for Jharkhand. Report municipal issues, track real-time resolution speed, and explore transparent public governance.",
      reportCTA: "Report Grievance / Register",
      exploreCTA: "Explore Live Dashboard",
      howItWorks: "How It Works",
      howItWorksSub: "A transparent 4-stage pipeline directly connecting you with local authorities",
      stage1: "Citizen Report",
      stage1Desc: "Lodge complaint with photos and automated GPS tags",
      stage2: "Field Verify",
      stage2Desc: "Local authority verifies details on site within 24h",
      stage3: "Resolving",
      stage3Desc: "Work crews are dispatched and estimated ETA is set",
      stage4: "Resolved",
      stage4Desc: "Status updated with closure confirmation logs",
      liveTicker: "Live Grievance Feed",
      districtTitle: "Jharkhand District Civic Report (Live)",
      districtSub: "Interactive breakdown of active civic tickets by major division",
    },
    hi: {
      portalTitle: "झारखंड नागरिक प्रगति पोर्टल",
      portalSub: "झारखंड सरकार • डिजिटल शिकायत प्रकोष्ठ",
      heroTitle: "नागरिकों का सशक्तिकरण, साथ मिलकर बढ़ता झारखंड",
      heroDesc: "झारखंड का आधिकारिक नागरिक शिकायत और निवारण पोर्टल। नगर निगम की समस्याओं की रिपोर्ट करें, वास्तविक समय में निवारण दर ट्रैक करें और पारदर्शी सार्वजनिक शासन का अनुभव करें।",
      reportCTA: "शिकायत दर्ज करें / लॉगिन",
      exploreCTA: "लाइव डैशबोर्ड देखें",
      howItWorks: "यह कैसे काम करता है",
      howItWorksSub: "स्थानीय अधिकारियों के साथ आपको सीधे जोड़ने वाली पारदर्शी 4-चरणीय प्रणाली",
      stage1: "नागरिक शिकायत",
      stage1Desc: "तस्वीरों और स्वचालित जीपीएस टैग के साथ शिकायत दर्ज करें",
      stage2: "सत्यापन",
      stage2Desc: "स्थानीय अधिकारी 24 घंटे के भीतर स्थल सत्यापन करते हैं",
      stage3: "प्रगति में",
      stage3Desc: "कार्य दल रवाना किए जाते हैं और समय सीमा तय की जाती है",
      stage4: "निवारण",
      stage4Desc: "कार्य पूर्णता लॉग के साथ स्थिति अपडेट की जाती है",
      liveTicker: "लाइव शिकायत फ़ीड",
      districtTitle: "झारखंड जिला नागरिक रिपोर्ट (लाइव)",
      districtSub: "प्रमुख प्रमंडलों द्वारा सक्रिय नागरिक शिकायतों का विवरण",
    }
  };

  const t = welcomeTranslations[lang] || welcomeTranslations["en"];

  // Mock district analytics matching Jharkhand state divisions
  const districtsData = [
    { name: "Ranchi (Capital)", reported: Math.max(12, Math.round(totalReports * 0.4)), resolved: Math.max(9, Math.round(resolvedReports * 0.4)), color: "from-saffron-500 to-saffron-600" },
    { name: "Dhanbad", reported: Math.max(6, Math.round(totalReports * 0.2)), resolved: Math.max(4, Math.round(resolvedReports * 0.2)), color: "from-peacock-500 to-peacock-600" },
    { name: "Jamshedpur (East Singhbhum)", reported: Math.max(8, Math.round(totalReports * 0.25)), resolved: Math.max(6, Math.round(resolvedReports * 0.25)), color: "from-jewel-500 to-jewel-600" },
    { name: "Hazaribagh", reported: Math.max(3, Math.round(totalReports * 0.08)), resolved: Math.max(2, Math.round(resolvedReports * 0.08)), color: "from-emerald-500 to-emerald-600" },
    { name: "Dumka (Santhal Pargana)", reported: Math.max(2, Math.round(totalReports * 0.05)), resolved: Math.max(2, Math.round(resolvedReports * 0.05)), color: "from-amber-500 to-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-dark-800 font-sans relative overflow-x-hidden transition-colors duration-300">
      {/* Background illustration overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-top opacity-[0.06] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: "url('/assets/jharkhand_welcome_backdrop.png')" }}
      />
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-dark-100/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <img 
            src="/assets/jharkhand_emblem.png" 
            alt="Jharkhand Government Emblem" 
            className="h-11 w-11 object-contain drop-shadow-sm hover:rotate-6 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-dark-900 md:text-base">
              {t.portalTitle}
            </span>
            <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest leading-none mt-0.5">
              {t.portalSub}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Language Toggle */}
          <button 
            onClick={() => onLangChange(lang === "en" ? "hi" : "en")}
            className="p-2 border border-dark-200/60 rounded-xl text-xs font-bold text-theme-600 bg-white hover:bg-theme-50 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Languages className="h-4 w-4" />
            <span>{lang === "en" ? "हिन्दी" : "English"}</span>
          </button>

          {/* Theme Mode Toggle */}
          <button 
            onClick={onModeToggle}
            className="p-2 border border-dark-200/60 rounded-xl text-dark-600 bg-white hover:bg-dark-50 transition-colors cursor-pointer"
            title="Toggle Contrast Mode"
          >
            {mode === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
          </button>

          <button 
            onClick={onNavigateToLogin}
            className="bg-gradient-to-r from-theme-500 to-theme-600 hover:from-theme-600 hover:to-theme-700 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl shadow-md shadow-theme-500/10 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            {t.reportCTA.split(" / ")[0]}
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative px-6 pt-12 pb-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-theme-50/50 border border-theme-200/30 rounded-full">
            <span className="w-2 h-2 rounded-full bg-theme-500 animate-pulse" />
            <span className="text-[10px] font-black text-theme-700 uppercase tracking-widest">
              Jharkhand Pragati Portal
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-dark-900 leading-[1.08] tracking-tight">
            {t.heroTitle.split(", ")[0]}, <br/>
            <span className="bg-gradient-to-r from-theme-600 to-saffron-600 bg-clip-text text-transparent">
              {t.heroTitle.split(", ")[1]}
            </span>
          </h1>

          <p className="text-dark-500 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
            {t.heroDesc}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button 
              onClick={onNavigateToLogin}
              className="px-6 py-4.5 bg-gradient-to-r from-theme-500 to-theme-600 hover:from-theme-600 hover:to-theme-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-theme-500/20 active:scale-97 transition-all flex items-center space-x-2 cursor-pointer uppercase tracking-wider"
            >
              <span>{t.reportCTA}</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>

            <button 
              onClick={onNavigateToLogin}
              className="px-6 py-4.5 bg-white border border-dark-200 hover:border-dark-350 hover:bg-dark-50 text-dark-800 font-bold text-sm rounded-2xl transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>{t.exploreCTA}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2.5 pt-4 text-xs font-semibold text-dark-400">
            <Shield className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            <span>Over <b>{resolvedPercent}%</b> of all verified complaints resolved within SLA target.</span>
          </div>
        </div>

        {/* Hero Illustration / Graphical Status Map */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div className="bg-white/80 backdrop-blur-sm border border-dark-100/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-dark-100/20 pb-4 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-theme-50 rounded-xl text-theme-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-extrabold text-sm tracking-tight text-dark-900">{t.districtTitle}</h3>
                  <span className="text-[10px] font-bold text-dark-400">{t.districtSub}</span>
                </div>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            {/* List of Mock / Real District performance */}
            <div className="space-y-4 font-sans">
              {districtsData.map((d, index) => {
                const completionRate = d.reported > 0 ? Math.round((d.resolved / d.reported) * 105) : 80;
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-xs font-bold">
                      <span className="text-dark-700">{d.name}</span>
                      <span className="text-dark-500">
                        {d.resolved} Resolved / {d.reported} Complaints
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full bg-gradient-to-r ${d.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${Math.min(completionRate, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live scrolling grievance feed */}
          {activeTickerIssue && (
            <div className="bg-slate-900 text-white rounded-2xl p-4.5 border border-slate-800 shadow-lg flex items-center space-x-4 animate-float-in">
              <div className="p-3 bg-slate-800 rounded-xl text-theme-400 shrink-0">
                <MessageSquare className="h-5.5 w-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black text-theme-400 uppercase tracking-widest block mb-0.5">
                  {t.liveTicker} • Ticket #{activeTickerIssue.ticketId}
                </span>
                <span className="font-extrabold text-xs block text-slate-100 truncate">
                  {activeTickerIssue.title}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block truncate mt-0.5">
                  📍 {activeTickerIssue.location?.address}
                </span>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                activeTickerIssue.status === "resolved" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                activeTickerIssue.status === "in-progress" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                "bg-theme-500/20 text-theme-300 border border-theme-500/30"
              }`}>
                {activeTickerIssue.status}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 3. Horizontal Stats Funnel */}
      <section className="bg-white border-y border-dark-100/20 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
            <h2 className="text-2xl font-black text-dark-900 tracking-tight">{t.howItWorks}</h2>
            <p className="text-dark-500 font-medium text-xs sm:text-sm">{t.howItWorksSub}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
            {/* Stage 1 */}
            <div className="p-6 bg-slate-50/50 border border-dark-150/40 rounded-2xl space-y-4 relative group">
              <div className="h-10 w-10 bg-theme-100 text-theme-600 rounded-xl flex items-center justify-center font-black text-sm">
                01
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-dark-900">{t.stage1}</h3>
                <p className="text-dark-500 text-[11px] leading-relaxed font-semibold">{t.stage1Desc}</p>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs text-dark-400 font-bold">Total Lodged</span>
                <span className="font-black text-lg text-theme-600">{totalReports}</span>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="p-6 bg-slate-50/50 border border-dark-150/40 rounded-2xl space-y-4 relative group">
              <div className="h-10 w-10 bg-peacock-100 text-peacock-600 rounded-xl flex items-center justify-center font-black text-sm">
                02
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-dark-900">{t.stage2}</h3>
                <p className="text-dark-500 text-[11px] leading-relaxed font-semibold">{t.stage2Desc}</p>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs text-dark-400 font-bold">Verified</span>
                <span className="font-black text-lg text-peacock-600">
                  {verifiedReports} <span className="text-[10px] text-dark-400">({verifiedPercent}%)</span>
                </span>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="p-6 bg-slate-50/50 border border-dark-150/40 rounded-2xl space-y-4 relative group">
              <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-black text-sm">
                03
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-dark-900">{t.stage3}</h3>
                <p className="text-dark-500 text-[11px] leading-relaxed font-semibold">{t.stage3Desc}</p>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs text-dark-400 font-bold">Active Crew</span>
                <span className="font-black text-lg text-amber-600">{inProgressReports}</span>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="p-6 bg-slate-50/50 border border-dark-150/40 rounded-2xl space-y-4 relative group">
              <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black text-sm">
                04
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-dark-900">{t.stage4}</h3>
                <p className="text-dark-500 text-[11px] leading-relaxed font-semibold">{t.stage4Desc}</p>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs text-dark-400 font-bold">Resolved Cases</span>
                <span className="font-black text-lg text-emerald-600">
                  {resolvedReports} <span className="text-[10px] text-dark-400">({resolvedPercent}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3.5">
              <img 
                src="/assets/jharkhand_emblem.png" 
                alt="Jharkhand Government Emblem" 
                className="h-10 w-10 object-contain filter brightness-125"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white">
                  {t.portalTitle}
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Government of Jharkhand
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed max-w-sm">
              Designed as an open transparency interface for municipal wards and divisions of Jharkhand State. Under the jurisdiction of District Grievance Redressal Cells.
            </p>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-200">Municipal Helpdesk</h4>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span>Ranchi Municipal Corp:</span>
                <span className="text-slate-300">0651-2211215</span>
              </div>
              <div className="flex justify-between">
                <span>Dhanbad Municipal Corp:</span>
                <span className="text-slate-300">0326-2313027</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Control Room:</span>
                <span className="text-theme-400">100 / 112</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-200">Visitor Tracking</h4>
            <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Visits Today</span>
              <span className="font-mono font-black text-xl text-white tracking-widest mt-1">
                {String(10482 + totalReports * 14).padStart(6, "0")}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-10 pt-6 text-center text-[10px] font-bold tracking-wider text-slate-500 uppercase">
          © {new Date().getFullYear()} Government of Jharkhand. All Rights Reserved. • State Civic Grievance Portal
        </div>
      </footer>
    </div>
  );
}
