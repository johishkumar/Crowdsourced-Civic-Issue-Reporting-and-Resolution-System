import React, { useState } from "react";
import { X, ThumbsUp, Send, CheckCircle, Calendar, Star, MapPin, ArrowRight, AlertCircle, Building2 } from "lucide-react";
import { getTranslator } from "../locales";
import MagneticButton from "./MagneticButton";

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
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

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

  const handleAdminUpdate = async () => {
    if (!assignedDept) {
      setSaveResult({ type: "error", msg: "Please select a department before saving." });
      setTimeout(() => setSaveResult(null), 4000);
      return;
    }
    setSaveLoading(true);
    setSaveResult(null);
    try {
      const effectiveStatus = status === "submitted" ? "verified" : status;
      await onAssignTicket(issue.id, assignedDept, eta, user.name, effectiveStatus);
      setSaveResult({
        type: "success",
        msg: `Ticket forwarded to "${assignedDept}" and status updated to "${effectiveStatus}".`,
      });
      setTimeout(() => setSaveResult(null), 5000);
    } catch (err) {
      setSaveResult({ type: "error", msg: "Failed to update ticket. Please try again." });
      setTimeout(() => setSaveResult(null), 5000);
    } finally {
      setSaveLoading(false);
    }
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
    submitted: { bg: "bg-[#1E3D59]/30", text: "text-[#D4AF37]", border: "border-[#D4AF37]/40", label: "Submitted" },
    verified: { bg: "bg-[#C58A18]/20", text: "text-[#C58A18]", border: "border-[#C58A18]/40", label: "Verified" },
    "in-progress": { bg: "bg-[#1E3D59]/40", text: "text-[#F3E5AB]", border: "border-[#D4AF37]/50", label: "In Progress" },
    resolved: { bg: "bg-[#16845B]/20", text: "text-[#16845B]", border: "border-[#16845B]/40", label: "Resolved" },
  };

  const currentStatusStyle = statusStyles[issue.status] || statusStyles.submitted;

  const priorityStyles = {
    low: { bg: "bg-[#141414]", text: "text-[#888888]", border: "border-[#888888]/40" },
    medium: { bg: "bg-[#C58A18]/20", text: "text-[#C58A18]", border: "border-[#C58A18]/40" },
    high: { bg: "bg-[#C94A4A]/20", text: "text-[#C94A4A]", border: "border-[#C94A4A]/40" },
    critical: { bg: "bg-[#C94A4A]", text: "text-white font-bold", border: "border-[#C94A4A]" },
    emergency: { bg: "bg-[#C94A4A]", text: "text-white font-black animate-pulse", border: "border-[#C94A4A]" },
  };

  const currentPriorityStyle = priorityStyles[issue.priority] || priorityStyles.medium;

  return (
    <div className="fixed inset-0 bg-[#0A0A0A]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#141414] max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#D4AF37]/40 animate-float-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#D4AF37]/30 flex justify-between items-center bg-[#0A0A0A] text-[#F2F0E4] relative">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#141414] px-2.5 py-1 border border-[#D4AF37]/40">
              #{issue.ticketId}
            </span>
            <span className="text-xs font-artdeco-heading text-[#F2F0E4] uppercase tracking-widest">
              {t("categoryLabel")}: {issue.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#888888] hover:text-[#F2F0E4] hover:bg-[#141414] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5 text-[#D4AF37]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Main Title & Status Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-artdeco-heading text-[#F2F0E4] leading-tight mb-2 tracking-wide">
                {issue.title}
              </h2>
              <div className="flex items-center space-x-2 text-[#888888] text-sm">
                <MapPin className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span>{issue.location.address}</span>
              </div>
            </div>
            <div className="flex space-x-2 shrink-0">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}>
                {currentStatusStyle.label}
              </span>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border ${currentPriorityStyle.bg} ${currentPriorityStyle.text} ${currentPriorityStyle.border}`}>
                {issue.priority}
              </span>
            </div>
          </div>

          {/* Issue Image */}
          {issue.images && issue.images[0] && (
            <div className="w-full h-80 overflow-hidden bg-[#0A0A0A] border border-[#D4AF37]/40 art-deco-frame">
              <img src={issue.images[0]} alt={issue.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Description */}
          <div className="card-art-deco p-5 border border-[#D4AF37]/30 bg-[#0A0A0A]">
            <h4 className="font-artdeco-heading text-[#D4AF37] text-sm uppercase tracking-wider mb-2">{t("detailedDescription")}</h4>
            <p className="text-[#888888] text-sm leading-relaxed whitespace-pre-line">
              {issue.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2">
            <div className="card-art-deco p-4 bg-[#0A0A0A] flex items-center space-x-3 border border-[#D4AF37]/30">
              <div className="p-2.5 bg-[#141414] text-[#D4AF37] border border-[#D4AF37]/40">
                <Calendar className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">{t("reportedOn")}</p>
                <p className="font-bold text-[#F2F0E4]">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="card-art-deco p-4 bg-[#0A0A0A] flex items-center space-x-3 border border-[#D4AF37]/30">
              <div className="p-2.5 bg-[#141414] text-[#D4AF37] border border-[#D4AF37]/40 text-lg">
                🏆
              </div>
              <div>
                <p className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">{t("reportedBy")}</p>
                <p className="font-bold text-[#F2F0E4] truncate max-w-[140px]">
                  {issue.reportedBy?.name || "Citizen"}
                </p>
              </div>
            </div>

            <div className="card-art-deco p-4 bg-[#0A0A0A] flex items-center space-x-3 border border-[#D4AF37]/30">
              <div className="p-2.5 bg-[#141414] text-[#D4AF37] border border-[#D4AF37]/40">
                <Building2 className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">{t("assignedDepartment")}</p>
                <p className="font-bold text-[#D4AF37] truncate max-w-[140px]">
                  {issue.assignedTo?.department || t("unassigned")}
                </p>
              </div>
            </div>
          </div>

          {/* Admin / NGO Actions */}
          {(user.role === "admin" || user.role === "ngo") && (
            <div className="card-art-deco bg-[#0A0A0A] border border-[#D4AF37]/40 p-6 mt-4">
              <h3 className="font-artdeco-heading text-[#D4AF37] text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
                Forward to Department
              </h3>
              <p className="text-[#888888] text-xs mb-4">
                Select a department and status below, then click <strong className="text-[#F2F0E4]">Forward &amp; Save</strong>. The ticket will be assigned and the issuing citizen will be notified.
              </p>

              {/* Save Result Banner */}
              {saveResult && (
                <div
                  className={`flex items-start gap-3 px-4 py-3 mb-4 text-xs font-semibold border ${
                    saveResult.type === "success"
                      ? "bg-[#16845B]/20 border-[#16845B]/40 text-[#16845B]"
                      : "bg-[#C94A4A]/20 border-[#C94A4A]/40 text-[#C94A4A]"
                  }`}
                >
                  {saveResult.type === "success" ? (
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#16845B]" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#C94A4A]" />
                  )}
                  {saveResult.msg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-wider mb-1.5">
                    Forward to Department <span className="text-[#C94A4A]">*</span>
                  </label>
                  <select
                    value={assignedDept}
                    onChange={(e) => setAssignedDept(e.target.value)}
                    className="w-full p-2 bg-[#141414] border border-[#D4AF37]/30 text-xs font-semibold text-[#F2F0E4] focus:outline-none cursor-pointer"
                  >
                    <option value="">— Select Department —</option>
                    {departments.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-wider mb-1.5">
                    {t("updateStatus")}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 bg-[#141414] border border-[#D4AF37]/30 text-xs font-semibold text-[#F2F0E4] focus:outline-none cursor-pointer"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="verified">Verified ✓</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <p className="text-[10px] text-[#888888] mt-1">Auto-sets to Verified on forward</p>
                </div>

                <div>
                  <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-wider mb-1.5">
                    {t("eta")}
                  </label>
                  <input
                    type="date"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    className="w-full p-1.5 bg-[#141414] border border-[#D4AF37]/30 text-xs font-semibold text-[#F2F0E4] focus:outline-none"
                  />
                </div>
              </div>

              <MagneticButton
                onClick={handleAdminUpdate}
                disabled={saveLoading}
                className="btn-art-deco-primary gold-shine-effect flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#D4AF37] text-[#0A0A0A] uppercase tracking-wider"
              >
                {saveLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-3.5 w-3.5 text-[#0A0A0A]" />
                    Forward &amp; Save
                  </>
                )}
              </MagneticButton>
            </div>
          )}

          {/* Feedback Form resolved */}
          {issue.status === "resolved" && user.role === "citizen" && !issue.rating && (
            <div className="bg-[#16845B]/10 border border-[#16845B]/30 p-6">
              <h3 className="font-artdeco-heading text-[#16845B] text-sm flex items-center space-x-1.5 mb-2 uppercase tracking-wider">
                <CheckCircle className="h-5 w-5 text-[#16845B]" />
                <span>{t("rateResolution")}</span>
              </h3>
              <p className="text-[#888888] text-xs mb-4">
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
                            ? "fill-[#D4AF37] text-[#D4AF37] scale-110"
                            : "text-[#888888]/40"
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
                    className="w-full p-3 bg-[#141414] border border-[#D4AF37]/30 text-xs text-[#F2F0E4] focus:outline-none"
                  />
                </div>

                <MagneticButton
                  type="submit"
                  className="btn-art-deco-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#D4AF37] text-[#0A0A0A]"
                >
                  {t("submitReview")}
                </MagneticButton>
              </form>
            </div>
          )}

          {/* Progress Logs */}
          <div className="space-y-4">
            <h4 className="font-artdeco-heading text-[#F2F0E4] text-sm uppercase tracking-wider">
              {t("progressLog")} ({issue.comments?.length || 0})
            </h4>

            <div className="space-y-3 max-h-52 overflow-y-auto">
              {issue.comments?.length === 0 ? (
                <p className="text-[#888888] text-xs italic">{t("noActivity")}</p>
              ) : (
                issue.comments?.map((c) => (
                  <div key={c.id} className="flex flex-col bg-[#0A0A0A] p-3.5 border border-[#D4AF37]/20">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-[#F2F0E4]">
                        {c.userName}
                        {c.type === "admin" && (
                          <span className="ml-1.5 px-2 py-0.5 bg-[#D4AF37] text-[#0A0A0A] text-[9px] font-bold uppercase tracking-widest">Admin</span>
                        )}
                        {c.type === "ngo" && (
                          <span className="ml-1.5 px-2 py-0.5 bg-[#1E3D59] text-[#F3E5AB] text-[9px] font-bold uppercase tracking-widest">NGO</span>
                        )}
                      </span>
                      <span className="text-[10px] text-[#888888] font-semibold font-mono">
                        {new Date(c.timestamp).toLocaleDateString()}{" "}
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[#888888] text-xs leading-relaxed">{c.text}</p>
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
                className="flex-1 px-4 py-2.5 border border-[#D4AF37]/30 bg-[#141414] text-[#F2F0E4] text-xs focus:outline-none transition-all placeholder:text-[#888888]"
              />
              <button
                type="submit"
                className="p-3 bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#F3E5AB] transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#D4AF37]/30 bg-[#0A0A0A] flex justify-between items-center">
          <button
            onClick={handleUpvote}
            className="flex items-center space-x-2 px-4 py-2.5 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-colors cursor-pointer font-bold text-xs uppercase tracking-wider"
          >
            <ThumbsUp className="h-4.5 w-4.5" />
            <span>{t("upvote")} ({issue.upvotes || 0})</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold cursor-pointer border border-[#D4AF37]/40 text-[#F2F0E4] hover:bg-[#141414] uppercase tracking-wider"
          >
            {t("done")}
          </button>
        </div>

      </div>
    </div>
  );
}
