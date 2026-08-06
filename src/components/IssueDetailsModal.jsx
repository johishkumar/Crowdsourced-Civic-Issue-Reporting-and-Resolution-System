import React, { useState } from "react";
import { X, ThumbsUp, Send, CheckCircle, Calendar, Star, MapPin } from "lucide-react";
import { getTranslator } from "../locales";

export default function IssueDetailsModal({
  user,
  issue,
  onClose,
  onUpvote,
  onAddComment,
  onUpdateStatus,
  onAssignTicket,
  onSubmitFeedback,
  lang = "en",
}) {
  const t = getTranslator(lang);
  const [commentText, setCommentText] = useState("");
  const [status, setStatus] = useState(issue.status);
  const [assignedDept, setAssignedDept] = useState(issue.assignedTo?.department || "");
  const [eta, setEta] = useState(issue.estimatedResolution ? new Date(issue.estimatedResolution).toISOString().split("T")[0] : "");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const departments = [
    "Road Maintenance",
    "Garbage Disposal & Sanitation",
    "Water Supply Department",
    "Electricity Board",
    "Street Light Commission",
    "Public Works",
    "Emergency Services",
  ];

  const handleUpvote = () => {
    onUpvote(issue.id);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(issue.id, commentText);
    setCommentText("");
  };

  const handleAdminUpdate = () => {
    onAssignTicket(issue.id, assignedDept, eta);
    onUpdateStatus(issue.id, status);
    alert("Ticket assignments and statuses updated successfully!");
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    onSubmitFeedback(issue.id, rating, feedback);
    alert("Thank you for your feedback!");
  };

  const statusStyles = {
    submitted: { bg: "bg-royal-50", text: "text-royal-600", border: "border-royal-100", label: "Submitted" },
    verified: { bg: "bg-saffron-50", text: "text-saffron-700", border: "border-saffron-100", label: "Verified" },
    "in-progress": { bg: "bg-jewel-50", text: "text-jewel-600", border: "border-jewel-100", label: "In Progress" },
    resolved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", label: "Resolved" },
  };

  const currentStatusStyle = statusStyles[issue.status] || statusStyles.submitted;

  const priorityStyles = {
    low: { bg: "bg-dark-500/5", text: "text-dark-500", border: "border-dark-500/10" },
    medium: { bg: "bg-saffron-50", text: "text-saffron-700", border: "border-saffron-100" },
    high: { bg: "bg-red-50", text: "text-red-700", border: "border-red-100" },
    critical: { bg: "bg-red-100", text: "text-red-950 font-bold", border: "border-red-200" },
    emergency: { bg: "bg-red-600", text: "text-white font-black animate-pulse", border: "border-red-700" },
  };

  const currentPriorityStyle = priorityStyles[issue.priority] || priorityStyles.medium;

  return (
    <div className="fixed inset-0 bg-dark-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-theme-100/20 animate-float-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-theme-100/20 flex justify-between items-center bg-theme-50/20">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-theme-700 bg-theme-100/50 px-2.5 py-0.5 rounded-lg border border-theme-200/30">
              {issue.ticketId}
            </span>
            <span className="text-xs font-bold text-dark-500 uppercase tracking-wider">
              {t("categoryLabel")}: {issue.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-[5.5px] rounded-xl text-dark-400 hover:text-theme-600 hover:bg-theme-50 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Main Title & Status Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-dark-800 leading-tight mb-2">
                {issue.title}
              </h2>
              <div className="flex items-center space-x-2 text-dark-500 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-theme-500 shrink-0" />
                <span>{issue.location.address}</span>
              </div>
            </div>
            <div className="flex space-x-2 shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}>
                {currentStatusStyle.label}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${currentPriorityStyle.bg} ${currentPriorityStyle.text} ${currentPriorityStyle.border}`}>
                {issue.priority}
              </span>
            </div>
          </div>

          {/* Issue Image */}
          {issue.images && issue.images[0] && (
            <div className="w-full h-80 rounded-2xl overflow-hidden bg-theme-50/20 border border-theme-100/10 shadow-inner">
              <img src={issue.images[0]} alt={issue.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Description */}
          <div className="bg-theme-50/20 p-5 rounded-2xl border border-theme-100/20">
            <h4 className="font-bold text-dark-800 text-sm mb-2">{t("detailedDescription")}</h4>
            <p className="text-dark-600 text-sm leading-relaxed whitespace-pre-line">
              {issue.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2">
            <div className="border border-theme-100/20 rounded-2xl p-4 bg-white shadow-sm flex items-center space-x-3">
              <div className="p-2.5 bg-theme-50 text-theme-600 rounded-xl">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-dark-500/50 font-bold uppercase tracking-wider">{t("reportedOn")}</p>
                <p className="font-bold text-dark-700">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border border-theme-100/20 rounded-2xl p-4 bg-white shadow-sm flex items-center space-x-3">
              <div className="p-2.5 bg-peacock-50 text-peacock-600 rounded-xl text-lg">
                🏆
              </div>
              <div>
                <p className="text-[10px] text-dark-500/50 font-bold uppercase tracking-wider">{t("reportedBy")}</p>
                <p className="font-bold text-dark-700 truncate max-w-[140px]">
                  {issue.reportedBy?.name || "Citizen"}
                </p>
              </div>
            </div>

            <div className="border border-theme-100/20 rounded-2xl p-4 bg-white shadow-sm flex items-center space-x-3">
              <div className="p-2.5 bg-jewel-50 text-jewel-600 rounded-xl text-lg">
                ⚡
              </div>
              <div>
                <p className="text-[10px] text-dark-500/50 font-bold uppercase tracking-wider">{t("assignedDepartment")}</p>
                <p className="font-bold text-dark-700 truncate max-w-[140px]">
                  {issue.assignedTo?.department || t("unassigned")}
                </p>
              </div>
            </div>
          </div>

          {/* Admin / NGO Actions */}
          {(user.role === "admin" || user.role === "ngo") && (
            <div className="bg-theme-50/40 border border-theme-200/30 p-6 rounded-3xl mt-4">
              <h3 className="font-bold text-theme-800 text-sm uppercase tracking-wider mb-4">
                {t("officerActions")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-dark-600 uppercase tracking-widest mb-1.5">
                    {t("updateStatus")}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 bg-white border border-theme-200 rounded-xl text-xs font-semibold text-dark-700 focus:outline-none cursor-pointer"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="verified">Verified</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-600 uppercase tracking-widest mb-1.5">
                    {t("assignDept")}
                  </label>
                  <select
                    value={assignedDept}
                    onChange={(e) => setAssignedDept(e.target.value)}
                    className="w-full p-2 bg-white border border-theme-200 rounded-xl text-xs font-semibold text-dark-700 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-650 uppercase tracking-widest mb-1.5">
                    {t("eta")}
                  </label>
                  <input
                    type="date"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    className="w-full p-1.5 bg-white border border-theme-200 rounded-xl text-xs font-semibold text-dark-700 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleAdminUpdate}
                className="bg-theme-600 hover:bg-theme-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                {t("saveAction")}
              </button>
            </div>
          )}

          {/* Feedback Form resolved */}
          {issue.status === "resolved" && user.role === "citizen" && !issue.rating && (
            <div className="bg-emerald-50/40 border border-emerald-100 p-6 rounded-3xl">
              <h3 className="font-bold text-emerald-900 text-sm flex items-center space-x-1.5 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>{t("rateResolution")}</span>
              </h3>
              <p className="text-dark-500 text-xs mb-4">
                {t("rateResolutionDesc")}
              </p>
              
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl cursor-pointer"
                    >
                      <Star
                        className={`h-7 w-7 transition-all ${
                          star <= (hoverRating || rating)
                            ? "fill-theme-500 text-theme-500 scale-110"
                            : "text-theme-200/50"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={t("writeFeedbackPlaceholder")}
                    rows={3}
                    className="w-full p-3 bg-white border border-theme-200/50 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  {t("submitReview")}
                </button>
              </form>
            </div>
          )}

          {/* Previous feedback */}
          {issue.rating > 0 && (
            <div className="bg-theme-50/20 p-5 rounded-2xl border border-theme-100/20">
              <h4 className="font-bold text-dark-800 text-xs mb-2 uppercase tracking-wide">
                {t("citizenFeedbackTitle")}
              </h4>
              <div className="flex items-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4.5 w-4.5 ${
                      star <= issue.rating ? "fill-theme-500 text-theme-500" : "text-theme-200/50"
                    }`}
                  />
                ))}
              </div>
              <p className="text-dark-600 text-xs italic">
                "{issue.feedback || "No feedback comments left"}"
              </p>
            </div>
          )}

          {/* Progress Logs */}
          <div className="space-y-4">
            <h4 className="font-bold text-dark-800 text-sm">
              {t("progressLog")} ({issue.comments?.length || 0})
            </h4>

            <div className="space-y-3 max-h-52 overflow-y-auto">
              {issue.comments?.length === 0 ? (
                <p className="text-dark-500/50 text-xs italic">{t("noActivity")}</p>
              ) : (
                issue.comments?.map((c) => (
                  <div key={c.id} className="flex flex-col bg-theme-50/20 p-3.5 rounded-2xl border border-theme-100/10">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-dark-800">
                        {c.userName}
                        {c.type === "admin" && (
                          <span className="ml-1.5 px-2 py-0.2 bg-theme-100 text-theme-700 rounded-md text-[9px] font-extrabold uppercase tracking-wide">Admin</span>
                        )}
                        {c.type === "ngo" && (
                          <span className="ml-1.5 px-2 py-0.2 bg-peacock-100 text-peacock-750 text-[9px] font-extrabold uppercase tracking-wide rounded-md">NGO</span>
                        )}
                      </span>
                      <span className="text-[10px] text-dark-500/40 font-semibold font-mono">
                        {new Date(c.timestamp).toLocaleDateString()}{" "}
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-dark-600 text-xs leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("postQueryPlaceholder")}
                className="flex-1 px-4 py-2.5 border border-theme-200/40 rounded-xl text-xs bg-white/80 focus:bg-white focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="p-3 bg-theme-600 hover:bg-theme-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-theme-100/20 bg-theme-50/20 flex justify-between items-center">
          <button
            onClick={handleUpvote}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-theme-200/50 text-dark-600 hover:text-theme-700 hover:bg-theme-50/50 transition-colors cursor-pointer font-bold text-xs"
          >
            <ThumbsUp className="h-4.5 w-4.5" />
            <span>{t("upvote")} ({issue.upvotes || 0})</span>
          </button>
          <button
            onClick={onClose}
            className="btn-theme px-5 py-2.5 text-xs font-bold cursor-pointer"
          >
            {t("done")}
          </button>
        </div>

      </div>
    </div>
  );
}
