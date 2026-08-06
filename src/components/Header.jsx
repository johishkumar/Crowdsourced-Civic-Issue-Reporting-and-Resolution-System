import React, { useState } from "react";
import { Bell, Search, Info, Check, AlertTriangle, AlertCircle, Sun, Moon } from "lucide-react";
import { getTranslator } from "../locales";

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
  theme,
  onThemeChange,
  mode,
  onModeToggle,
}) {
  const t = getTranslator(lang);

  const themesList = [
    { id: "citizen", name: "Saffron", color: "bg-[#e05a00]" },
    { id: "admin", name: "Peacock", color: "bg-[#0a8491]" },
    { id: "ngo", name: "Jewel", color: "bg-[#6c5ce7]" },
    { id: "royal", name: "Royal", color: "bg-[#6366f1]" },
    { id: "lotus", name: "Lotus", color: "bg-[#ec4899]" },
  ];
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (n) => {
    onMarkNotificationAsRead(n.id);
    setShowNotifications(false);
    onNotificationClick(n.issueId);
  };

  return (
    <header className="flex justify-between items-center glass px-8 py-3.5 border-b border-theme-100/20 fixed top-0 right-0 left-64 z-10 shadow-sm">
      {/* Search */}
      <div className="relative w-80 focus-within:w-96 transition-all duration-300">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-theme-400/60" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full pl-10 pr-4 py-2.5 bg-theme-50/40 border border-theme-200/30 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-theme-200/50 focus:border-theme-500 transition-all duration-300 placeholder:text-dark-500/45 font-semibold text-dark-750"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Dynamic Theme Selector Swatches */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-theme-50/45 px-3 py-2 rounded-xl border border-theme-200/20 shadow-inner">
          {themesList.map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange && onThemeChange(t.id)}
              title={`Theme: ${t.name}`}
              className={`w-3.5 h-3.5 rounded-full ${t.color} cursor-pointer hover:scale-125 transition-transform duration-200 relative ${
                theme === t.id ? "ring-2 ring-white ring-offset-2 ring-offset-theme-500 scale-110 shadow" : "opacity-80"
              }`}
            />
          ))}
        </div>

        {/* Dark Mode Switch */}
        <button
          onClick={onModeToggle}
          className="p-2 text-dark-500 hover:text-theme-600 bg-theme-50/40 hover:bg-theme-100/50 rounded-xl transition-all cursor-pointer border border-theme-200/20 hover:scale-105 active:scale-95 flex items-center justify-center"
          title={mode === "light" ? "Switch to Midnight Dark" : "Switch to Light Mode"}
        >
          {mode === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />}
        </button>

        {/* Language Selector */}
        <select
          value={lang}
          onChange={(e) => onLangChange(e.target.value)}
          className="px-3 py-2 border border-theme-200/30 rounded-xl bg-theme-50/40 text-xs font-bold text-dark-700 focus:outline-none cursor-pointer hover:bg-theme-50 transition-all"
        >
          <option value="en">🇺🇸 EN</option>
          <option value="hi">🇮🇳 HI</option>
          <option value="ta">🇮🇳 TA</option>
          <option value="ml">🇮🇳 ML</option>
        </select>

        {/* Emergency */}
        <button
          onClick={onTriggerEmergency}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all cursor-pointer shadow-lg shadow-red-500/20 flex items-center space-x-1.5 hover:scale-[1.02] active:scale-[0.98]"
        >
          <AlertCircle className="h-4 w-4 animate-pulse" />
          <span>{t("emergencyAlert")}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-dark-500 hover:text-theme-600 bg-theme-50/40 hover:bg-theme-100/50 rounded-xl transition-all cursor-pointer relative border border-theme-200/20"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 gradient-theme text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass rounded-2xl shadow-2xl border border-theme-100/30 overflow-hidden z-30">
              <div className="p-4 border-b border-theme-100/20 bg-theme-50/30 flex justify-between items-center">
                <h3 className="font-bold text-dark-800 text-sm">{t("notificationsTitle")}</h3>
                {unreadCount > 0 && (
                  <button onClick={onClearNotifications} className="text-xs text-theme-600 hover:text-theme-700 font-bold cursor-pointer">{t("markAllRead")}</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-theme-50/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-dark-500 text-xs font-semibold">{t("noNotifications")}</div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left p-4 hover:bg-theme-50/40 transition-colors flex items-start space-x-3 cursor-pointer ${!n.read ? "bg-theme-50/20" : ""}`}
                    >
                      <div className="mt-0.5">
                        {n.type === "resolution" ? (
                          <div className="p-1 px-[5.5px] rounded-full bg-emerald-50 text-emerald-600"><Check className="h-3.5 w-3.5" /></div>
                        ) : (
                          <div className="p-1 px-[5.5px] rounded-full bg-theme-50 text-theme-600"><Info className="h-3.5 w-3.5" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${!n.read ? "text-dark-800" : "text-dark-600"}`}>{n.title}</p>
                        <p className="text-dark-500 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-dark-500/50 mt-1 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center space-x-3 bg-theme-50/30 pl-3 pr-4 py-2 rounded-xl border border-theme-200/20 hover:bg-theme-50/50 transition-all">
          <div className="w-8 h-8 rounded-full gradient-theme flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-dark-800 leading-none">{user.name}</p>
            <span className="text-[9px] font-bold text-theme-500 leading-none uppercase tracking-wider">{user.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
