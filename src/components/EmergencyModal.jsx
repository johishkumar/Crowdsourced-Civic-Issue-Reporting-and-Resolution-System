import React, { useState } from "react";
import { ShieldAlert, Send, X, AlertTriangle } from "lucide-react";
import { getTranslator } from "../locales";
import MagneticButton from "./MagneticButton";

export default function EmergencyModal({ isOpen, onClose, onSubmitEmergency, lang = "en" }) {
  const t = getTranslator(lang);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("gas-leak");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please provide a description of the emergency.");
      return;
    }

    const typeLabels = {
      "gas-leak": "Gas Leak Detected",
      flooding: "Public Area Flooding",
      fire: "Fire Accident",
      electric: "Live Exposed Wires",
      other: "Critical Danger Hazard",
    };

    onSubmitEmergency({
      title: `Emergency: ${typeLabels[type]}`,
      description,
      category: "public-safety",
      priority: "emergency",
      isEmergency: true,
    });

    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-float-in">
      <div className="bg-[#141414] max-w-md w-full overflow-hidden shadow-2xl border border-[#D4AF37]/50">
        
        {/* Header Alert Panel */}
        <div className="bg-[#C94A4A] px-5 py-4 text-white flex items-center justify-between relative border-b border-[#D4AF37]/30">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="h-5.5 w-5.5 text-white animate-pulse" />
            <h3 className="font-artdeco-heading text-sm tracking-widest uppercase text-white">{t("emergencyTitle") || "Municipal Red Line Emergency"}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-white/80 hover:text-white hover:bg-black/20 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-[#C94A4A]/10 p-3.5 border border-[#C94A4A]/40 flex items-start space-x-2.5 text-[#C94A4A] text-xs">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-[#C94A4A] mt-0.5" />
            <p className="leading-relaxed font-semibold">
              <strong>{t("warningWord") || "WARNING:"}</strong> {t("warningMessage") || "False reporting of critical infrastructure emergencies is a punishable offense under state regulation."}
            </p>
          </div>

          {/* Emergency Type Selector */}
          <div>
            <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-widest mb-1.5">
              {t("emergencyType") || "Hazards Priority Group *"}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#D4AF37]/30 bg-[#0A0A0A] text-xs font-semibold text-[#F2F0E4] cursor-pointer focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="gas-leak">Gas Leak Smell</option>
              <option value="flooding">Flooding & Sidewalk Collapse</option>
              <option value="fire">Fire / Sparking Electrical Line</option>
              <option value="electric">Exposed Live Power Lines</option>
              <option value="other">Other Life-Threatening Risks</option>
            </select>
          </div>

          {/* Details Input */}
          <div>
            <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-widest mb-1.5">
              {t("emergencyDescLabel") || "Describe Situation & Landmark address *"}
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("emergencyPlaceholder") || "Provide detailed address and landmarks..."}
              className="w-full p-3 border border-[#D4AF37]/30 bg-[#0A0A0A] text-xs text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-none placeholder:text-[#888888]"
            />
          </div>

          {/* Submit Button */}
          <MagneticButton
            type="submit"
            className="w-full bg-[#C94A4A] hover:bg-[#a63838] text-white font-bold text-xs py-3 px-4 transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-widest border border-[#D4AF37]/40"
          >
            <Send className="h-4 w-4 text-[#D4AF37]" />
            <span>{t("dispatchUnit") || "DISPATCH INCIDENT UNIT"}</span>
          </MagneticButton>
        </form>

      </div>
    </div>
  );
}
