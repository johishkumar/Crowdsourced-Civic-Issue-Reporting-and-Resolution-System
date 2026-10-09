import React, { useState } from "react";
import IssueCard from "./IssueCard";
import { AlertCircle, CheckCircle, Clock, Shield, Filter, Sparkles } from "lucide-react";
import { getTranslator } from "../locales";
import FloatingParticles from "./FloatingParticles";
import TiltCard from "./TiltCard";

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
    <div className="space-y-6 animate-float-in">
      {/* Official Government Art Deco Luxury Hero Banner */}
      <div className="hero-luxury-bg text-[#F2F0E4] p-6 md:p-8 border border-[#D4AF37]/40 relative overflow-hidden bg-[#141414]">
        <FloatingParticles count={12} />
        <div className="hero-radial-glow absolute inset-0 pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-[#0A0A0A] px-3 py-1 text-xs font-semibold text-[#D4AF37] uppercase tracking-widest border border-[#D4AF37]/50">
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Jharkhand Digital Portal • {user.role} Workspace</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-artdeco-heading tracking-widest text-[#F2F0E4]">
              {t("welcome", { name: user.name }) || `Welcome, ${user.name}`}
            </h1>
            <p className="text-[#888888] text-xs md:text-sm max-w-xl leading-relaxed">
              Official Crowdsourced Infrastructure &amp; Civic Issue Management Portal for rapid resolution.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-[#0A0A0A] p-4 border border-[#D4AF37]/40 shrink-0 shadow-lg">
            <div className="w-3 h-3 rounded-full bg-[#D4AF37] animate-ping" />
            <div>
              <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest leading-none">System Status</p>
              <p className="text-xs font-bold text-[#F2F0E4] mt-1">Services Operational • 24x7 Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Art Deco Metric Cards (#141414, Thin Gold Border, Sharp Corners) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Issues */}
        <TiltCard maxTilt={2}>
          <div className="card-art-deco p-6 flex items-center space-x-4 border border-[#D4AF37]/30 bg-[#141414]">
            <div className="p-3.5 bg-[#1E3D59]/30 text-[#D4AF37] shrink-0 border border-[#D4AF37]/40">
              <AlertCircle className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-[#888888] text-[11px] font-bold uppercase tracking-widest block mb-1">
                {t("totalReported") || "Total Tickets Lodged"}
              </span>
              <span className="text-2xl md:text-3xl font-artdeco-heading text-[#F2F0E4] leading-none block">{totalReported}</span>
            </div>
          </div>
        </TiltCard>

        {/* Resolved */}
        <TiltCard maxTilt={2}>
          <div className="card-art-deco p-6 flex items-center space-x-4 border border-[#D4AF37]/30 bg-[#141414]">
            <div className="p-3.5 bg-[#16845B]/20 text-[#16845B] shrink-0 border border-[#16845B]/40">
              <CheckCircle className="w-6 h-6 text-[#16845B]" />
            </div>
            <div>
              <span className="text-[#888888] text-[11px] font-bold uppercase tracking-widest block mb-1">
                {t("issuesResolved") || "Resolved Tickets"}
              </span>
              <span className="text-2xl md:text-3xl font-artdeco-heading text-[#16845B] leading-none block">{totalResolved}</span>
            </div>
          </div>
        </TiltCard>

        {/* Avg Resolution */}
        <TiltCard maxTilt={2}>
          <div className="card-art-deco p-6 flex items-center space-x-4 border border-[#D4AF37]/30 bg-[#141414]">
            <div className="p-3.5 bg-[#C58A18]/20 text-[#C58A18] shrink-0 border border-[#C58A18]/40">
              <Clock className="w-6 h-6 text-[#C58A18]" />
            </div>
            <div>
              <span className="text-[#888888] text-[11px] font-bold uppercase tracking-widest block mb-1">
                {t("avgResolution") || "Average Resolution Time"}
              </span>
              <span className="text-2xl md:text-3xl font-artdeco-heading text-[#D4AF37] leading-none block">
                {analytics.avgResolutionTime || 5.2} {t("days") || "Days"}
              </span>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Filter Toolbar & Issue List */}
      <div className="space-y-5">
        <div className="card-art-deco p-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-[#D4AF37]/30 bg-[#141414]">
          <div className="flex items-center space-x-2 mr-auto">
            <Filter className="h-4 w-4 text-[#D4AF37]" />
            <h2 className="font-artdeco-heading text-[#F2F0E4] text-base uppercase tracking-wider">{t("recentTickets") || "Recent Civic Tickets"}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3.5 py-2 border border-[#D4AF37]/30 text-xs font-semibold text-[#F2F0E4] bg-[#0A0A0A] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            >
              <option value="all">{t("allPriorities") || "All Priorities"}</option>
              <option value="low">{t("priorityLow") || "Low Priority"}</option>
              <option value="medium">{t("priorityMedium") || "Medium Priority"}</option>
              <option value="high">{t("priorityHigh") || "High Priority"}</option>
              <option value="critical">{t("priorityCritical") || "Critical Priority"}</option>
            </select>

            {/* Status Pills */}
            <div className="flex bg-[#0A0A0A] p-1 border border-[#D4AF37]/30 overflow-x-auto">
              {["all", "submitted", "verified", "in-progress", "resolved"].map((status) => {
                const statusKey = status === "all"
                  ? "statusAll"
                  : status === "in-progress"
                    ? "statusInProgress"
                    : `status${status.charAt(0).toUpperCase() + status.slice(1)}`;
                const isSelected = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? "bg-[#D4AF37] text-[#0A0A0A] shadow-xs"
                        : "text-[#888888] hover:text-[#F2F0E4]"
                    }`}
                  >
                    {t(statusKey) || status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Issues List Grid with Staggered Entrance */}
        {filteredIssues.length === 0 ? (
          <div className="card-art-deco p-12 text-center border border-[#D4AF37]/30 bg-[#141414]">
            <p className="text-[#F2F0E4] text-sm font-semibold mb-1">{t("noMatches") || "No matching tickets found"}</p>
            <p className="text-[#888888] text-xs">{t("tryResetFilters") || "Try adjusting your search query or filter selection."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue, idx) => (
              <div
                key={issue.id}
                className="animate-luxury-in"
                style={{ animationDelay: `${(idx % 6) * 50}ms` }}
              >
                <IssueCard issue={issue} onSelect={onSelectIssue} onUpvote={onUpvoteIssue} lang={lang} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
