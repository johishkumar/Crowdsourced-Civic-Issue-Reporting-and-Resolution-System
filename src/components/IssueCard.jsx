import React from "react";
import { MapPin, ThumbsUp, MessageSquare, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { getTranslator } from "../locales";

export default function IssueCard({ issue, onSelect, onUpvote, lang = "en" }) {
  const t = getTranslator(lang);
  const statusStyles = {
    submitted: { bg: "bg-royal-50", text: "text-royal-600", border: "border-royal-100", label: t("statusSubmitted") },
    verified: { bg: "bg-saffron-50", text: "text-saffron-700", border: "border-saffron-100", label: t("statusVerified") },
    "in-progress": { bg: "bg-jewel-50", text: "text-jewel-600", border: "border-jewel-100", label: t("statusInProgress") },
    resolved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", label: t("statusResolved") },
  };

  const priorityStyles = {
    low: { bg: "bg-dark-500/5", text: "text-dark-500" },
    medium: { bg: "bg-saffron-50", text: "text-saffron-700" },
    high: { bg: "bg-red-50", text: "text-red-700" },
    critical: { bg: "bg-red-100", text: "text-red-950 font-bold" },
    emergency: { bg: "bg-red-600", text: "text-white font-black animate-pulse" },
  };

  const status = statusStyles[issue.status] || statusStyles.submitted;
  const priority = priorityStyles[issue.priority] || priorityStyles.medium;

  const handleUpvote = (e) => {
    e.stopPropagation();
    onUpvote(issue.id);
  };

  return (
    <div
      onClick={() => onSelect(issue)}
      className="card-premium rounded-3xl overflow-hidden cursor-pointer flex flex-col group animate-float-in hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(var(--theme-500-rgb),0.08)] hover:border-theme-300/35 transition-all duration-300"
    >
      {/* Card Image */}
      {issue.images && issue.images[0] ? (
        <div className="relative h-44 w-full overflow-hidden bg-theme-50/50">
          <img src={issue.images[0]} alt={issue.title} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out" />
          {/* Warm overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {issue.isEmergency && (
            <span className="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-[9px] tracking-wider uppercase px-2.5 py-1 rounded-lg shadow-lg animate-pulse">
              {t("emergencyBadge")}
            </span>
          )}
        </div>
      ) : (
        <div className="h-44 w-full bg-gradient-to-br from-theme-50 to-theme-100 flex items-center justify-center text-theme-300 pattern-rangoli">
          {t("noImage")}
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-dark-500/50 font-mono tracking-wider">{issue.ticketId}</span>
            <div className="flex space-x-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}>{issue.priority}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}>{status.label}</span>
            </div>
          </div>

          <h3 className="font-bold text-dark-800 text-sm mb-1 line-clamp-1 group-hover:text-theme-600 transition-colors">{issue.title}</h3>
          <p className="text-dark-500 text-xs line-clamp-2 leading-relaxed mb-4">{issue.description}</p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-theme-100/20 mt-auto">
          <div className="flex items-center space-x-1 text-dark-500/50 text-xs mb-3 font-medium">
            <MapPin className="h-4 w-4 shrink-0 text-theme-500" />
            <span className="truncate">{issue.location.address}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <button onClick={handleUpvote} className="flex items-center space-x-1 text-dark-500/50 hover:text-theme-600 transition-colors cursor-pointer group/up">
                <ThumbsUp className="h-4 w-4 group-hover/up:scale-110 transition-transform" />
                <span className="text-xs font-bold">{issue.upvotes || 0}</span>
              </button>
              <div className="flex items-center space-x-1 text-dark-500/40">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs font-bold">{issue.comments?.length || 0}</span>
              </div>
            </div>

            {issue.aiDetectedCategory && (
              <span className="bg-jewel-50 text-jewel-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-jewel-100/40">
                AI: {issue.aiDetectedCategory}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
