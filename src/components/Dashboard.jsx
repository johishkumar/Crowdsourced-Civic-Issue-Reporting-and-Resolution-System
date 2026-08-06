import React, { useState } from "react";
import IssueCard from "./IssueCard";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { getTranslator } from "../locales";

export default function Dashboard({
  user,
  issues,
  onSelectIssue,
  onUpvoteIssue,
  searchTerm,
  analytics,
  lang = "en",
}) {
  const t = getTranslator(lang);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalReported = issues.length + 151;
  const totalResolved = issues.filter((i) => i.status === "resolved").length + 88;

  return (
    <div className="space-y-8 animate-float-in">
      {/* Banner */}
      <div className="banner-theme text-white p-8 rounded-3xl relative overflow-hidden border border-white/10 shadow-xl shadow-theme-700/10">
        {/* Soft light blob */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="px-3.5 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10 inline-block mb-2">
              {user.role} workspace
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight leading-none">
              {t("welcome", { name: user.name })}
            </h1>
            <p className="text-white/80 text-xs font-semibold mt-1">{t("welcomeSubtitle")}</p>
          </div>
          <div className="flex items-center space-x-3.5 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-sm shrink-0">
            <span className="text-2xl animate-bounce">⚡</span>
            <div>
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none">Alert Status</p>
              <p className="text-xs font-black text-white mt-1">No Critical Hazards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Issues */}
        <div className="card-premium rounded-3xl p-6 flex items-center space-x-4 group hover:scale-[1.03] hover:shadow-[0_20px_40px_rgba(243,128,18,0.1)] hover:border-saffron-300/40 transition-all duration-300">
          <div className="p-4 bg-gradient-to-br from-saffron-100 to-saffron-50 text-saffron-600 rounded-2xl shrink-0 group-hover:shadow-lg group-hover:shadow-saffron-200/50 transition-all">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-dark-500 text-[10px] font-bold uppercase tracking-widest block leading-none mb-1">{t("totalReported")}</span>
            <span className="text-3xl font-black text-dark-800 leading-none block group-hover:translate-y-[-1px] transition-transform">{totalReported}</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="card-premium rounded-3xl p-6 flex items-center space-x-4 group hover:scale-[1.03] hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] hover:border-emerald-350/40 transition-all duration-300">
          <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-2xl shrink-0 group-hover:shadow-lg group-hover:shadow-emerald-200/50 transition-all">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-dark-500 text-[10px] font-bold uppercase tracking-widest block leading-none mb-1">{t("issuesResolved")}</span>
            <span className="text-3xl font-black text-dark-800 leading-none block group-hover:translate-y-[-1px] transition-transform">{totalResolved}</span>
          </div>
        </div>

        {/* Avg Resolution */}
        <div className="card-premium rounded-3xl p-6 flex items-center space-x-4 group hover:scale-[1.03] hover:shadow-[0_20px_40px_rgba(139,79,255,0.1)] hover:border-jewel-300/40 transition-all duration-300">
          <div className="p-4 bg-gradient-to-br from-jewel-100 to-jewel-50 text-jewel-600 rounded-2xl shrink-0 group-hover:shadow-lg group-hover:shadow-jewel-200/50 transition-all">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-dark-500 text-[10px] font-bold uppercase tracking-widest block leading-none mb-1">{t("avgResolution")}</span>
            <span className="text-3xl font-black text-dark-800 leading-none block group-hover:translate-y-[-1px] transition-transform">
              {analytics.avgResolutionTime || 5.2} {t("days")}
            </span>
          </div>
        </div>
      </div>

      {/* Filter + Tickets */}
      <div className="space-y-6">
        <div className="card-premium p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <h2 className="font-bold text-dark-800 text-lg px-2 mr-auto">{t("recentTickets")}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3.5 py-1.5 border border-theme-200/30 rounded-xl text-xs font-bold text-dark-700 bg-theme-50/30 focus:outline-none cursor-pointer"
            >
              <option value="all">{t("allPriorities")}</option>
              <option value="low">{t("priorityLow")}</option>
              <option value="medium">{t("priorityMedium")}</option>
              <option value="high">{t("priorityHigh")}</option>
              <option value="critical">{t("priorityCritical")}</option>
            </select>

            <div className="flex bg-theme-50/40 p-1 rounded-xl border border-theme-100/30">
              {["all", "submitted", "verified", "in-progress", "resolved"].map((status) => {
                const statusKey = status === "all"
                  ? "statusAll"
                  : status === "in-progress"
                    ? "statusInProgress"
                    : `status${status.charAt(0).toUpperCase() + status.slice(1)}`;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                      statusFilter === status
                        ? "bg-white text-theme-600 shadow-sm"
                        : "text-dark-500 hover:text-theme-700"
                    }`}
                  >
                    {t(statusKey)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="card-premium p-12 text-center rounded-2xl border-2 border-dashed border-theme-200/30">
            <p className="text-dark-500 text-sm font-bold mb-1">{t("noMatches")}</p>
            <p className="text-dark-500/50 text-xs">{t("tryResetFilters")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onSelect={onSelectIssue} onUpvote={onUpvoteIssue} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
