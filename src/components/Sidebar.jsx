import React from "react";
import { Home, Plus, List, MapPin, BarChart3, Trophy, LogOut, ShieldCheck } from "lucide-react";
import { getTranslator } from "../locales";

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, lang = "en", isMobileOpen, setIsMobileOpen }) {
  const t = getTranslator(lang);

  const menuItems = [];
  menuItems.push({ id: "dashboard", label: t("dashboard") || "Dashboard", icon: Home });

  if (user.role === "citizen") {
    menuItems.push({ id: "report", label: t("reportIssue") || "Report Issue", icon: Plus });
    menuItems.push({ id: "my-reports", label: t("myReports") || "My Reports", icon: List });
  } else {
    menuItems.push({ id: "all-issues", label: t("allIssues") || "All Issues", icon: List });
  }

  menuItems.push({ id: "map", label: t("interactiveMap") || "Interactive Map", icon: MapPin });

  if (user.role === "admin") {
    menuItems.push({ id: "analytics", label: t("systemAnalytics") || "Analytics", icon: BarChart3 });
  }

  menuItems.push({ id: "leaderboard", label: t("leaderboard") || "Leaderboard", icon: Trophy });

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-[#0A0A0A]/85 backdrop-blur-xs z-35 md:hidden transition-opacity duration-200"
        />
      )}

      {/* Art Deco Obsidian Command-Center Sidebar */}
      <aside
        className={`w-64 bg-[#0A0A0A] text-[#F2F0E4] flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-[#D4AF37]/30 shadow-2xl transition-transform duration-200 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Portal Header */}
        <div className="p-5 border-b border-[#D4AF37]/30 bg-[#141414] relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#0A0A0A] flex items-center justify-center p-1.5 border border-[#D4AF37] shadow-sm shrink-0">
              <img src="/assets/jharkhand_emblem.png" alt="Emblem" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-artdeco-heading text-xs tracking-widest text-[#F2F0E4] leading-tight">
                Jharkhand Pragati
              </h2>
              <span className="text-[9px] text-[#D4AF37] font-semibold uppercase tracking-widest block mt-0.5">
                Govt Digital Service
              </span>
            </div>
          </div>
          {/* Champagne gold accent divider line */}
          <div className="h-[1px] w-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB]/40 to-transparent mt-4" />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 text-xs uppercase tracking-wider font-artdeco-body cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-[#1E3D59]/40 text-[#D4AF37] border-l-2 border-[#D4AF37] font-bold shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    : "text-[#888888] hover:bg-[#141414] hover:text-[#F2F0E4] hover:border-l-2 hover:border-[#D4AF37]/50"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                    isActive ? "text-[#D4AF37]" : "text-[#888888] group-hover:text-[#D4AF37]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Footer Card */}
        <div className="p-4 border-t border-[#D4AF37]/30 bg-[#141414] relative">
          <div className="flex items-center space-x-3 mb-3 px-1">
            <div className="w-8 h-8 bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center font-bold text-xs border border-[#F3E5AB] shrink-0 uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-[#F2F0E4]">{user.name}</p>
              <div className="flex items-center space-x-1 mt-0.5">
                <ShieldCheck className="h-3 w-3 text-[#D4AF37]" />
                <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wider truncate">
                  {user.role} {user.department ? `• ${user.department}` : ""}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-[#C94A4A]/50 text-[#C94A4A] hover:text-[#FFFFFF] hover:bg-[#C94A4A] hover:border-[#C94A4A] text-xs uppercase tracking-wider font-semibold cursor-pointer transition-all duration-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{t("signOut") || "Sign Out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
