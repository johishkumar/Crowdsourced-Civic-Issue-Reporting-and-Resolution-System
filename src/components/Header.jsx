import React, { useState } from "react";
import { Bell, Search, Info, Check, AlertCircle, Menu, X, Shield, Globe } from "lucide-react";
import { getTranslator } from "../locales";
import MagneticButton from "./MagneticButton";

export default function Header({
  user,
  notifications,
  onMarkNotificationAsRead,
  onClearNotifications,
  searchTerm,
  setSearchTerm,
  onNotificationClick,
  onTriggerEmergency,
  lang = "en",
  onLangChange,
  isMobileOpen,
  setIsMobileOpen,
}) {
  const t = getTranslator(lang);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (n) => {
    onMarkNotificationAsRead(n.id);
    setShowNotifications(false);
    onNotificationClick(n.issueId);
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-40 header-luxury transition-all duration-200 flex flex-col justify-center min-h-[64px]">
      {/* Top champagne gold accent line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      <div className="px-3 sm:px-4 md:px-6 py-2 flex items-center justify-between gap-3 relative z-10 w-full">
        {/* Left Section: Mobile Menu Toggle, Emblem, Portal Brand & Search Input */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 max-w-md lg:max-w-xl">
          {/* Mobile Hamburger & Brand Title */}
          <div className="flex items-center gap-2 shrink-0 md:hidden">
            <button
              onClick={() => setIsMobileOpen && setIsMobileOpen(!isMobileOpen)}
              className="p-1.5 hover:bg-[#141414] text-[#F2F0E4] focus:outline-none cursor-pointer border border-[#D4AF37]/30 shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileOpen ? <X className="h-5 w-5 text-[#D4AF37]" /> : <Menu className="h-5 w-5 text-[#D4AF37]" />}
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-7 h-7 bg-[#141414] p-1 flex items-center justify-center border border-[#D4AF37]/40 shrink-0">
                <img src="/assets/jharkhand_emblem.png" alt="Emblem" className="w-full h-full object-contain" />
              </div>
              <div className="hidden min-[400px]:block">
                <h1 className="text-xs font-artdeco-heading text-[#F2F0E4] leading-tight">Jharkhand Pragati</h1>
                <span className="text-[9px] text-[#D4AF37] font-semibold block uppercase tracking-widest">
                  Govt Digital Portal
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar - Desktop & Tablet */}
          <div className="hidden md:block relative w-full max-w-xs lg:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#888888]" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("searchPlaceholder") || "Search tickets, addresses, status..."}
              className="w-full pl-9 pr-4 py-2 header-search-input text-[#F2F0E4] text-xs focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all placeholder:text-[#888888]"
            />
          </div>
        </div>

        {/* Right Actions Toolbar: Anchored inside header padding */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Language Selector */}
          <div className="relative flex items-center bg-[#123E63]/70 border border-[#D4AF6A]/30 rounded-xl px-2.5 py-1.5 backdrop-blur-xs shadow-xs text-xs shrink-0">
            <Globe className="h-3.5 w-3.5 text-[#D4AF6A] mr-1.5 shrink-0" />
            <select
              value={lang}
              onChange={(e) => onLangChange(e.target.value)}
              className="header-lang-select text-white text-xs font-semibold focus:outline-none cursor-pointer border-none p-0 pr-1 shrink-0"
            >
              <option value="en" className="text-[#17212B]">English</option>
              <option value="hi" className="text-[#17212B]">हिंदी</option>
              <option value="ta" className="text-[#17212B]">தமிழ்</option>
              <option value="ml" className="text-[#17212B]">മലയാളം</option>
            </select>
          </div> 

          {/* Emergency Alert Button */}
          <MagneticButton
            onClick={onTriggerEmergency}
            className="px-2.5 sm:px-3 py-1.5 bg-[#881818] hover:bg-[#C94A4A] text-[#F2F0E4] text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border border-[#D4AF37]/50 gold-shine-effect shrink-0 shadow-[0_0_15px_rgba(201,74,74,0.3)]"
            title="Report Critical Hazard Emergency"
          >
            <AlertCircle className="h-3.5 w-3.5 text-[#D4AF37] animate-pulse shrink-0" />
            <span className="hidden sm:inline">{t("Alert") || "Emergency"}</span>
          </MagneticButton>

          {/* Notifications Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 text-[#F2F0E4] hover:text-[#D4AF37] hover:bg-[#141414] transition-all cursor-pointer relative border border-[#D4AF37]/30 flex items-center justify-center shrink-0"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-4 sm:h-4.5 w-4 sm:w-4.5 text-[#D4AF37]" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#D4AF37] text-[#0A0A0A] font-bold flex items-center justify-center text-[10px] border border-[#0A0A0A]">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[#141414] text-[#F2F0E4] shadow-[0_12px_36px_rgba(0,0,0,0.9)] border border-[#D4AF37]/40 z-40 animate-float-in">
                <div className="p-3.5 border-b border-[#D4AF37]/30 bg-[#0A0A0A] flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-[#D4AF37]" />
                    <h3 className="font-artdeco-heading text-xs text-[#F2F0E4] uppercase tracking-wider">{t("notificationsTitle") || "Notifications"}</h3>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-xs text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                    >
                      {t("markAllRead") || "Mark all read"}
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#D4AF37]/15">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[#888888] text-xs">{t("noNotifications") || "No new notifications"}</div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left p-3.5 hover:bg-[#1A1A1A] transition-colors flex items-start space-x-2.5 cursor-pointer ${!n.read ? "bg-[#1E3D59]/30 border-l-2 border-l-[#D4AF37]" : ""
                          }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === "resolution" ? (
                            <Check className="h-4 w-4 text-[#16845B]" />
                          ) : (
                            <Info className="h-4 w-4 text-[#D4AF37]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${!n.read ? "text-[#F2F0E4]" : "text-[#888888]"}`}>{n.title}</p>
                          <p className="text-[#888888] text-[11px] mt-0.5 leading-snug">{n.message}</p>
                          <span className="text-[10px] text-[#D4AF37]/70 mt-1 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center space-x-2 bg-[#141414] px-2.5 py-1.5 border border-[#D4AF37]/30 shrink-0" title={`${user.name} (${user.role})`}>
            <div className="w-6.5 h-6.5 bg-[#D4AF37] text-[#0A0A0A] font-bold text-xs flex items-center justify-center border border-[#F3E5AB] shrink-0 uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-[#F2F0E4] leading-none whitespace-nowrap">{user.name}</p>
              <span className="text-[9px] font-semibold text-[#D4AF37] leading-none uppercase tracking-widest block mt-0.5 whitespace-nowrap">{user.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="px-3 pb-2.5 md:hidden">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-[#888888]" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchPlaceholder") || "Search tickets..."}
            className="w-full pl-8 pr-3 py-1.5 header-search-input text-[#F2F0E4] text-xs focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>
      </div>
    </header>
  );
}
