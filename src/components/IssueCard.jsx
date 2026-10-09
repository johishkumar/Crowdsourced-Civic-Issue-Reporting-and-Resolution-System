import React from "react";
import { MapPin, ThumbsUp, MessageSquare, Building2, ChevronRight, AlertTriangle } from "lucide-react";
import { getTranslator } from "../locales";
import TiltCard from "./TiltCard";

export default function IssueCard({ issue, onSelect, onUpvote, lang = "en" }) {
  const t = getTranslator(lang);

  const statusStyles = {
    submitted: { bg: "bg-[#1E3D59]/30", text: "text-[#D4AF37]", border: "border-[#D4AF37]/40", label: t("statusSubmitted") || "Submitted" },
    verified: { bg: "bg-[#C58A18]/20", text: "text-[#C58A18]", border: "border-[#C58A18]/40", label: t("statusVerified") || "Verified" },
    "in-progress": { bg: "bg-[#1E3D59]/40", text: "text-[#F3E5AB]", border: "border-[#D4AF37]/50", label: t("statusInProgress") || "In Progress" },
    resolved: { bg: "bg-[#16845B]/20", text: "text-[#16845B]", border: "border-[#16845B]/40", label: t("statusResolved") || "Resolved" },
  };

  const priorityStyles = {
    low: { bg: "bg-[#141414]", text: "text-[#888888]", border: "border-[#888888]/40" },
    medium: { bg: "bg-[#C58A18]/20", text: "text-[#C58A18]", border: "border-[#C58A18]/40" },
    high: { bg: "bg-[#C94A4A]/20", text: "text-[#C94A4A]", border: "border-[#C94A4A]/40" },
    critical: { bg: "bg-[#C94A4A]", text: "text-white font-bold", border: "border-[#C94A4A]" },
    emergency: { bg: "bg-[#C94A4A]", text: "text-white font-bold animate-pulse", border: "border-[#C94A4A]" },
  };

  const status = statusStyles[issue.status] || statusStyles.submitted;
  const priority = priorityStyles[issue.priority] || priorityStyles.medium;

  const handleUpvote = (e) => {
    e.stopPropagation();
    onUpvote(issue.id);
  };

  return (
    <TiltCard maxTilt={2.5}>
      <div
        onClick={() => onSelect(issue)}
        className="card-art-deco overflow-hidden cursor-pointer flex flex-col group transition-all duration-300 border border-[#D4AF37]/30 bg-[#141414] hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.25)]"
      >
        {/* Art Deco Framed Card Image */}
        {issue.images && issue.images[0] ? (
          <div className="relative h-44 w-full overflow-hidden bg-[#0A0A0A] border-b border-[#D4AF37]/30 art-deco-frame">
            <img
              src={issue.images[0]}
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {issue.isEmergency && (
              <span className="absolute top-2.5 left-2.5 bg-[#881818] text-[#FFFFFF] font-bold text-[9px] tracking-widest uppercase px-2.5 py-1 border border-[#D4AF37]">
                {t("emergencyBadge") || "CRITICAL EMERGENCY"}
              </span>
            )}
            {/* Category Gold Tag */}
            <span className="absolute bottom-2 right-2 bg-[#0A0A0A]/90 text-[#D4AF37] font-bold text-[9.5px] uppercase tracking-widest px-2 py-0.5 border border-[#D4AF37]/50">
              {issue.category}
            </span>
          </div>
        ) : (
          <div className="h-44 w-full bg-[#0A0A0A] border-b border-[#D4AF37]/30 flex items-center justify-center text-[#888888] text-xs font-semibold uppercase tracking-wider">
            {t("noImage") || "No Evidence Image"}
          </div>
        )}

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono font-bold text-[#D4AF37] bg-[#0A0A0A] px-2 py-0.5 border border-[#D4AF37]/40">
                #{issue.ticketId}
              </span>
              <div className="flex space-x-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${priority.bg} ${priority.text} ${priority.border}`}>
                  {issue.priority}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${status.bg} ${status.text} ${status.border}`}>
                  {status.label}
                </span>
              </div>
            </div>

            <h3 className="font-artdeco-heading text-[#F2F0E4] text-base mb-1.5 line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
              {issue.title}
            </h3>
            <p className="text-[#888888] text-xs line-clamp-2 leading-relaxed mb-4">
              {issue.description}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#D4AF37]/20 mt-auto space-y-2.5">
            <div className="flex items-center space-x-1.5 text-[#888888] text-xs">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
              <span className="truncate">{issue.location.address}</span>
            </div>

            {/* Department Forwarded Badge */}
            {issue.assignedTo?.department && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-[#0A0A0A] border border-[#D4AF37]/30 px-2 py-0.5 text-[10px] font-semibold text-[#D4AF37] truncate uppercase tracking-wider">
                  <Building2 className="h-3 w-3 shrink-0 text-[#D4AF37]" />
                  <span className="truncate">{issue.assignedTo.department}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-3.5">
                <button
                  onClick={handleUpvote}
                  className="flex items-center space-x-1 text-[#888888] hover:text-[#D4AF37] transition-all cursor-pointer group/upvote"
                  title="Upvote ticket"
                >
                  <ThumbsUp className="h-3.5 w-3.5 group-hover/upvote:scale-110 group-hover/upvote:text-[#D4AF37] transition-transform" />
                  <span className="text-xs font-bold">{issue.upvotes || 0}</span>
                </button>
                <div className="flex items-center space-x-1 text-[#888888]">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">{issue.comments?.length || 0}</span>
                </div>
              </div>

              <span className="text-[#D4AF37] text-xs uppercase tracking-wider font-bold flex items-center group-hover:text-[#F3E5AB] transition-colors">
                Details <ChevronRight className="h-3.5 w-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
