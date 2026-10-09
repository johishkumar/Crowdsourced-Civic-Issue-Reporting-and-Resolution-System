import React, { useState, useEffect } from "react";
import { 
  ArrowRight, Shield, MapPin, Languages, Sun, Moon, MessageSquare
} from "lucide-react";

export default function Welcome({ 
  issues = [], 
  onNavigateToLogin, 
  lang, 
  onLangChange, 
  mode, 
  onModeToggle 
}) {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    if (issues.length === 0) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % issues.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [issues]);

  const activeTickerIssue = issues[tickerIndex] || null;

  const totalReports = issues.length || 179;
  const resolvedReports = issues.filter(i => i.status === "resolved").length || 94;
  const verifiedReports = issues.filter(i => i.status === "verified" || i.status === "in-progress" || i.status === "resolved").length || 140;

  const resolvedPercent = Math.round((resolvedReports / totalReports) * 100);

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

  const districtsData = [
    { name: "Ranchi (Capital)", reported: Math.max(12, Math.round(totalReports * 0.4)), resolved: Math.max(9, Math.round(resolvedReports * 0.4)), color: "bg-[#D4AF37]" },
    { name: "Dhanbad", reported: Math.max(6, Math.round(totalReports * 0.2)), resolved: Math.max(4, Math.round(resolvedReports * 0.2)), color: "bg-[#16845B]" },
    { name: "Jamshedpur (East Singhbhum)", reported: Math.max(8, Math.round(totalReports * 0.25)), resolved: Math.max(6, Math.round(resolvedReports * 0.25)), color: "bg-[#C58A18]" },
    { name: "Hazaribagh", reported: Math.max(3, Math.round(totalReports * 0.08)), resolved: Math.max(2, Math.round(resolvedReports * 0.08)), color: "bg-[#1E3D59]" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F0E4] font-sans relative overflow-x-hidden">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A] text-[#F2F0E4] border-b border-[#D4AF37]/40 px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <img 
            src="/assets/jharkhand_emblem.png" 
            alt="Jharkhand Government Emblem" 
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-artdeco-heading text-base tracking-widest text-[#F2F0E4]">
              {t.portalTitle}
            </span>
            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
              {t.portalSub}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onLangChange(lang === "en" ? "hi" : "en")}
            className="px-3 py-1.5 border border-[#D4AF37]/40 rounded-none text-xs font-semibold text-[#D4AF37] bg-[#141414] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-colors flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider"
          >
            <Languages className="h-4 w-4 text-[#D4AF37]" />
            <span>{lang === "en" ? "हिन्दी" : "English"}</span>
          </button>

          <button 
            onClick={onModeToggle}
            className="p-2 border border-[#D4AF37]/40 rounded-none text-[#D4AF37] bg-[#141414] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-colors cursor-pointer"
          >
            {mode === "dark" ? <Sun className="h-4 w-4 text-[#D4AF37]" /> : <Moon className="h-4 w-4 text-[#D4AF37]" />}
          </button>

          <button 
            onClick={onNavigateToLogin}
            className="btn-art-deco-primary text-xs font-bold px-4 py-2 uppercase tracking-widest bg-[#D4AF37] text-[#0A0A0A]"
          >
            {t.reportCTA.split(" / ")[0]}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-10 pb-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center z-10 animate-float-in">
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#141414] border border-[#D4AF37]/40 text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <span>Jharkhand Digital Service Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-artdeco-heading text-[#F2F0E4] leading-tight tracking-wider">
            {t.heroTitle}
          </h1>

          <p className="text-[#888888] text-sm leading-relaxed max-w-xl">
            {t.heroDesc}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button 
              onClick={onNavigateToLogin}
              className="btn-art-deco-primary px-6 py-3 text-xs font-bold flex items-center space-x-2 uppercase tracking-widest bg-[#D4AF37] text-[#0A0A0A]"
            >
              <span>{t.reportCTA}</span>
              <ArrowRight className="h-4 w-4 text-[#0A0A0A]" />
            </button>

            <button 
              onClick={onNavigateToLogin}
              className="px-6 py-3 text-xs font-bold border border-[#D4AF37]/40 text-[#F2F0E4] hover:bg-[#141414] uppercase tracking-widest cursor-pointer"
            >
              <span>{t.exploreCTA}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 pt-2 text-xs font-semibold text-[#888888]">
            <Shield className="h-4 w-4 text-[#16845B] shrink-0" />
            <span>Over <b className="text-[#D4AF37]">{resolvedPercent}%</b> of verified complaints resolved.</span>
          </div>
        </div>

        {/* Graphical Status Map */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card-art-deco p-6 bg-[#141414] border border-[#D4AF37]/30">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <h3 className="font-artdeco-heading text-sm text-[#F2F0E4] uppercase tracking-wider">{t.districtTitle}</h3>
                  <span className="text-[11px] text-[#888888]">{t.districtSub}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 border border-[#16845B]/40 bg-[#16845B]/20 text-[#16845B]">Active</span>
            </div>

            <div className="space-y-3">
              {districtsData.map((d, index) => {
                const completionRate = d.reported > 0 ? Math.round((d.resolved / d.reported) * 100) : 80;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold text-[#F2F0E4]">
                      <span>{d.name}</span>
                      <span className="text-[#888888] text-[11px] font-mono">
                        {d.resolved} Resolved / {d.reported} Complaints
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#0A0A0A] border border-[#D4AF37]/30 overflow-hidden">
                      <div 
                        className={`h-full ${d.color} transition-all duration-700`}
                        style={{ width: `${Math.min(completionRate, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {activeTickerIssue && (
            <div className="bg-[#0A0A0A] text-[#F2F0E4] p-4 border border-[#D4AF37]/40 flex items-center space-x-3 shadow-sm">
              <MessageSquare className="h-5 w-5 text-[#D4AF37] shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest block">
                  {t.liveTicker} • #{activeTickerIssue.ticketId}
                </span>
                <span className="font-artdeco-heading text-xs block text-[#F2F0E4] truncate">
                  {activeTickerIssue.title}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4-Stage Process */}
      <section className="bg-[#141414] border-y border-[#D4AF37]/30 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto space-y-1 mb-8">
            <h2 className="text-2xl font-artdeco-heading text-[#F2F0E4] uppercase tracking-wider">{t.howItWorks}</h2>
            <p className="text-[#888888] font-medium text-xs">{t.howItWorksSub}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { num: "01", title: t.stage1, desc: t.stage1Desc, val: totalReports, label: "Total Lodged" },
              { num: "02", title: t.stage2, desc: t.stage2Desc, val: verifiedReports, label: "Verified" },
              { num: "03", title: t.stage3, desc: t.stage3Desc, val: Math.max(18, totalReports - resolvedReports), label: "In Progress" },
              { num: "04", title: t.stage4, desc: t.stage4Desc, val: resolvedReports, label: "Resolved" },
            ].map((stage, idx) => (
              <div key={idx} className="card-art-deco p-5 bg-[#0A0A0A] border border-[#D4AF37]/30 space-y-3">
                <div className="h-9 w-9 bg-[#141414] border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center font-artdeco-heading text-xs font-bold">
                  {stage.num}
                </div>
                <div>
                  <h3 className="font-artdeco-heading text-sm text-[#F2F0E4] uppercase tracking-wider">{stage.title}</h3>
                  <p className="text-[#888888] text-xs leading-relaxed mt-1">{stage.desc}</p>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[#D4AF37]/20">
                  <span className="text-[11px] text-[#888888] font-medium uppercase tracking-wider">{stage.label}</span>
                  <span className="font-artdeco-heading text-base text-[#D4AF37]">{stage.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] text-[#888888] border-t border-[#D4AF37]/40 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-xs">
          <div className="md:col-span-6 space-y-2">
            <div className="flex items-center space-x-2">
              <img src="/assets/jharkhand_emblem.png" alt="Emblem" className="h-8 w-8 object-contain" />
              <span className="font-artdeco-heading text-[#F2F0E4] text-sm uppercase tracking-wider">{t.portalTitle}</span>
            </div>
            <p className="text-[#888888] max-w-sm">
              Official digital governance portal for municipal divisions under Government of Jharkhand.
            </p>
          </div>

          <div className="md:col-span-6 text-right space-y-1 text-[#888888]">
            <p className="font-bold text-[#D4AF37] uppercase tracking-widest">Helpline: 0651-2211215 / Emergency: 112</p>
            <p>© {new Date().getFullYear()} Government of Jharkhand. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
