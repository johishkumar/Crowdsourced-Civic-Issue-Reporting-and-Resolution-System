import React, { useState } from "react";
import { ShieldAlert, Send, X, AlertTriangle, AlertCircle } from "lucide-react";
import { getTranslator } from "../locales";

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
      electric: "Live Exposed Live Wires",
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
    <div className="fixed inset-0 bg-red-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-red-200/50 animate-float-in">
        
        {/* Header alert panel */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="h-6 w-6 text-white animate-pulse" />
            <h3 className="font-black text-sm tracking-wider uppercase">{t("emergencyTitle")}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-[5.5px] rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5.5 w-5.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 flex items-start space-x-2.5 text-red-800 text-xs">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-600 mt-0.5" />
            <p className="leading-relaxed font-semibold">
              <strong>{t("warningWord")}</strong> {t("warningMessage")}
            </p>
          </div>

          {/* Emergency type selector */}
          <div>
            <label className="block text-xs font-bold text-dark-600 uppercase tracking-widest mb-2">
              {t("emergencyType")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-red-200/60 rounded-xl text-sm focus:outline-none focus:bg-white bg-white/85 font-semibold text-dark-700 cursor-pointer"
            >
              <option value="gas-leak">Gas Smell Leak</option>
              <option value="flooding">Flooding & Sidewalk Collapse</option>
              <option value="fire">Fire / Sparking Electrical Line</option>
              <option value="electric">Exposed Live Power Lines</option>
              <option value="other">Other Life-Threatening Risks</option>
            </select>
          </div>

          {/* Details input text area */}
          <div>
            <label className="block text-xs font-bold text-dark-600 uppercase tracking-widest mb-2">
              {t("emergencyDescLabel")}
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("emergencyPlaceholder")}
              className="w-full p-4 border border-red-200/50 bg-white/85 rounded-xl text-sm focus:outline-none"
            />
          </div>

          {/* Submit btn */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-500/25 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span className="uppercase tracking-widest">{t("dispatchUnit")}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
