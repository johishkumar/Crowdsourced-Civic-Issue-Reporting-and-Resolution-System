import React from "react";
import { Home, Plus, List, MapPin, BarChart3, Trophy, LogOut, User } from "lucide-react";
import { getTranslator } from "../locales";

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, lang = "en" }) {
  const t = getTranslator(lang);
  
  const menuItems = [];
  menuItems.push({ id: "dashboard", label: t("dashboard"), icon: Home });

  if (user.role === "citizen") {
    menuItems.push({ id: "report", label: t("reportIssue"), icon: Plus });
    menuItems.push({ id: "my-reports", label: t("myReports"), icon: List });
  } else {
    menuItems.push({ id: "all-issues", label: t("allIssues"), icon: List });
  }

  menuItems.push({ id: "map", label: t("interactiveMap"), icon: MapPin });

  if (user.role === "admin") {
    menuItems.push({ id: "analytics", label: t("systemAnalytics"), icon: BarChart3 });
  }

  menuItems.push({ id: "leaderboard", label: t("leaderboard"), icon: Trophy });

  return (
    <aside className="w-64 gradient-sidebar text-white flex flex-col h-screen fixed left-0 top-0 z-20 shadow-2xl">
      {/* Sidebar Header with saffron accent */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-white/95 rounded-xl flex items-center justify-center p-1 shadow-lg border border-theme-200/50 hover:scale-105 transition-transform duration-300">
            <img src="/assets/jharkhand_emblem.png" alt="JH" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-bold text-[14.5px] tracking-tight bg-gradient-to-r from-saffron-300 via-white to-peacock-300 bg-clip-text text-transparent leading-none">
              Jharkhand Pragati
            </h2>
            <span className="text-[9px] text-theme-400/80 font-bold uppercase tracking-wider block mt-1">Government Portal</span>
          </div>
        </div>
        {/* Ornamental line */}
        <div className="flex items-center mt-4 gap-1">
          <div className="h-px flex-1 bg-gradient-to-r from-theme-500/40 to-transparent" />
          <div className="w-1 h-1 rounded-full bg-theme-400/50" />
          <div className="w-1 h-1 rounded-full bg-theme-300/50" />
          <div className="w-1 h-1 rounded-full bg-theme-400/50" />
          <div className="h-px flex-1 bg-gradient-to-l from-theme-500/30 to-transparent" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                isActive
                  ? "gradient-theme text-white shadow-lg shadow-theme-600/20 font-bold scale-[1.01]"
                  : "text-white/50 hover:bg-white/[0.05] hover:text-white/90"
              }`}
            >
              {/* Active indicator line */}
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-md z-20" />}
              {/* Active indicator glow */}
              {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/12 to-transparent" />}
              <Icon className={`h-5 w-5 relative z-10 ${isActive ? "text-white" : "text-white/40 group-hover:text-theme-400"} transition-colors`} />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.06] bg-dark-900/50">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-theme-500/10 flex items-center justify-center text-theme-400 ring-2 ring-theme-500/20">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white/90">{user.name}</p>
            <p className="text-[10px] font-bold text-theme-400 uppercase tracking-wider">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-white/[0.06] text-white/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 text-xs font-semibold cursor-pointer transition-all duration-300"
        >
          <LogOut className="h-4 w-4" />
          <span>{t("signOut")}</span>
        </button>
      </div>
    </aside>
  );
}
