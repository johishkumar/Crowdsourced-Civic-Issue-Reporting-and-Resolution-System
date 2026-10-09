import React, { useState, useEffect } from "react";
import { X, Settings, Send, Check, AlertCircle, Loader2, Info } from "lucide-react";
import { getSmsConfig, saveSmsConfig, sendSms } from "../utils/smsHelper";

export default function SmsSettingsModal({ isOpen, onClose }) {
  const [config, setConfig] = useState({
    provider: "textbelt",
    customUrl: "",
    customMethod: "GET",
    customHeaders: "{}",
    customBody: "{\n  \"phone\": \"{phone}\",\n  \"message\": \"{message}\"\n}"
  });

  const [testPhone, setTestPhone] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message?: string }
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentConfig = getSmsConfig();
      setConfig(currentConfig);
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveSuccess(false);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    saveSmsConfig(config);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleTestSend = async () => {
    if (!testPhone.trim() || testPhone.length < 10) {
      setTestResult({ success: false, message: "Please enter a valid 10-digit test phone number." });
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    // Save configuration temporarily to test it
    saveSmsConfig(config);

    try {
      const res = await sendSms(testPhone, "Test SMS from CivicReport. Your test verification code is: 9988.");
      if (res.success) {
        setTestResult({
          success: true,
          message: `SMS Sent successfully! Response/ID: ${res.messageId || JSON.stringify(res.response)}`
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || "Failed to send SMS."
        });
      }
    } catch (e) {
      setTestResult({
        success: false,
        message: e.message
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#141414] max-w-lg w-full overflow-hidden shadow-2xl border border-[#D4AF37]/50 flex flex-col font-sans text-[#F2F0E4] animate-float-in max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0A0A0A] px-6 py-5 border-b border-[#D4AF37]/40 text-[#F2F0E4] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <Settings className="h-5.5 w-5.5 text-[#D4AF37] animate-spin-slow" />
            <h3 className="font-artdeco-heading text-sm tracking-widest uppercase text-[#F2F0E4]">SMS Gateway Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#888888] hover:text-[#F2F0E4] hover:bg-[#141414] transition-colors cursor-pointer"
          >
            <X className="h-5.5 w-5.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Provider selection */}
          <div className="space-y-2">
            <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-widest">
              Gateway Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleChange("provider", "textbelt")}
                className={`py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center border ${
                  config.provider === "textbelt"
                    ? "border-[#D4AF37] bg-[#D4AF37] text-[#0A0A0A] shadow-sm"
                    : "border-[#D4AF37]/30 bg-[#0A0A0A] text-[#F2F0E4] hover:border-[#D4AF37]"
                }`}
              >
                Textbelt
              </button>
              <button
                type="button"
                onClick={() => handleChange("provider", "twilio")}
                className={`py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center border ${
                  config.provider === "twilio"
                    ? "border-[#D4AF37] bg-[#D4AF37] text-[#0A0A0A] shadow-sm"
                    : "border-[#D4AF37]/30 bg-[#0A0A0A] text-[#F2F0E4] hover:border-[#D4AF37]"
                }`}
              >
                Twilio
              </button>
              <button
                type="button"
                onClick={() => handleChange("provider", "custom")}
                className={`py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center border ${
                  config.provider === "custom"
                    ? "border-[#D4AF37] bg-[#D4AF37] text-[#0A0A0A] shadow-sm"
                    : "border-[#D4AF37]/30 bg-[#0A0A0A] text-[#F2F0E4] hover:border-[#D4AF37]"
                }`}
              >
                Custom API
              </button>
            </div>
          </div>

          {/* Textbelt Info */}
          {config.provider === "textbelt" && (
            <div className="bg-[#0A0A0A] border border-[#D4AF37]/30 p-4 text-xs text-[#888888] leading-relaxed flex items-start gap-2.5">
              <Info className="h-4.5 w-4.5 shrink-0 text-[#D4AF37] mt-0.5" />
              <div>
                <strong className="text-[#F2F0E4]">Textbelt Free Tier</strong> works out of the box with zero setup.
                <ul className="list-disc list-inside mt-1.5 space-y-1">
                  <li>Sends to real phone numbers globally.</li>
                  <li>Limit of <strong className="text-[#D4AF37]">1 free SMS per day per IP address</strong>.</li>
                  <li>Phone number must include country code (e.g. <code className="text-[#D4AF37]">+91</code>).</li>
                </ul>
              </div>
            </div>
          )}

          {/* Twilio API Gateway Form */}
          {config.provider === "twilio" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-[#0A0A0A] border border-[#D4AF37]/30 p-4 text-xs text-[#888888] leading-relaxed mb-2">
                <p>
                  <strong className="text-[#F2F0E4]">Twilio Gateway</strong> sends SMS directly using your Twilio credentials. (Routed securely through <code>corsproxy.io</code>).
                </p>
              </div>

              {/* Twilio SID */}
              <div className="space-y-1">
                <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-widest">
                  Twilio Account SID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="AC..."
                  value={config.twilioSid || ""}
                  onChange={(e) => handleChange("twilioSid", e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#D4AF37]/30 bg-[#0A0A0A] text-sm text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-none transition-all font-mono"
                />
              </div>

              {/* Twilio Token */}
              <div className="space-y-1">
                <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-widest">
                  Twilio Auth Token *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Auth Token"
                  value={config.twilioToken || ""}
                  onChange={(e) => handleChange("twilioToken", e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#D4AF37]/30 bg-[#0A0A0A] text-sm text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-none transition-all font-mono"
                />
              </div>

              {/* Twilio From */}
              <div className="space-y-1">
                <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-widest">
                  Twilio From Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+17372508034"
                  value={config.twilioFrom || ""}
                  onChange={(e) => handleChange("twilioFrom", e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#D4AF37]/30 bg-[#0A0A0A] text-sm text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-none transition-all font-mono"
                />
              </div>
            </div>
          )}

          {/* Custom API Gateway Form */}
          {config.provider === "custom" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-[#0A0A0A] border border-[#D4AF37]/30 p-4 text-xs text-[#888888] leading-relaxed mb-2">
                <p>
                  <strong className="text-[#F2F0E4]">Custom API Webhook</strong> configuration lets you connect to any SMS provider (e.g. Twilio, Fast2SMS, etc.) from the frontend.
                </p>
                <p className="mt-1.5 font-semibold text-[#D4AF37]">
                  Placeholders available: <code>{`{phone}`}</code> (recipient phone number) and <code>{`{message}`}</code> (message content).
                </p>
              </div>

              {/* Endpoint URL */}
              <div className="space-y-1">
                <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-widest">
                  API Endpoint URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.example.com/send?to={phone}&msg={message}"
                  value={config.customUrl}
                  onChange={(e) => handleChange("customUrl", e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#D4AF37]/30 bg-[#0A0A0A] text-sm text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-none transition-all"
                />
              </div>

              {/* HTTP Method */}
              <div className="space-y-1">
                <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-widest">
                  HTTP Method
                </label>
                <select
                  value={config.customMethod}
                  onChange={(e) => handleChange("customMethod", e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#D4AF37]/30 bg-[#0A0A0A] text-sm text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-none cursor-pointer transition-all"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>

              {/* Custom Headers */}
              <div className="space-y-1">
                <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-widest">
                  HTTP Headers (JSON format)
                </label>
                <textarea
                  rows={2}
                  placeholder={`{\n  "Authorization": "Bearer YOUR_SECRET_KEY"\n}`}
                  value={config.customHeaders}
                  onChange={(e) => handleChange("customHeaders", e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#D4AF37]/30 bg-[#0A0A0A] text-xs font-mono text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-none transition-all"
                />
              </div>

              {/* Custom Body (Only for POST) */}
              {config.customMethod === "POST" && (
                <div className="space-y-1 animate-fade-in">
                  <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-widest">
                    POST Body template (JSON format or raw string)
                  </label>
                  <textarea
                    rows={4}
                    placeholder={`{\n  "phone": "{phone}",\n  "message": "{message}"\n}`}
                    value={config.customBody}
                    onChange={(e) => handleChange("customBody", e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#D4AF37]/30 bg-[#0A0A0A] text-xs font-mono text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-none transition-all"
                  />
                </div>
              )}
            </div>
          )}

          {/* Testing Tool */}
          <div className="border-t border-[#D4AF37]/30 pt-6 space-y-3">
            <label className="block text-xs font-artdeco-heading text-[#D4AF37] uppercase tracking-widest">
              Test Connection
            </label>
            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <span className="absolute left-4 top-3 text-sm text-[#D4AF37] font-bold">+91</span>
                <input
                  type="tel"
                  placeholder="Test 10-digit number"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full pl-14 pr-4 py-2.5 border border-[#D4AF37]/30 bg-[#0A0A0A] text-sm text-[#F2F0E4] focus:border-[#D4AF37] focus:outline-none transition-all font-semibold"
                />
              </div>
              <button
                type="button"
                onClick={handleTestSend}
                disabled={testLoading}
                className="px-4 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0A0A0A] text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer shrink-0 uppercase tracking-wider"
              >
                {testLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#0A0A0A]" />
                ) : (
                  <Send className="h-4 w-4 text-[#0A0A0A]" />
                )}
                <span>Send Test</span>
              </button>
            </div>

            {/* Test result output */}
            {testResult && (
              <div
                className={`p-4 border text-xs font-semibold leading-relaxed flex items-start gap-2 animate-fade-in ${
                  testResult.success
                    ? "bg-[#16845B]/20 border-[#16845B]/40 text-[#16845B]"
                    : "bg-[#C94A4A]/20 border-[#C94A4A]/40 text-[#C94A4A]"
                }`}
              >
                {testResult.success ? (
                  <Check className="h-4.5 w-4.5 text-[#16845B] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4.5 w-4.5 text-[#C94A4A] shrink-0 mt-0.5" />
                )}
                <div className="break-all">{testResult.message}</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0A0A0A] border-t border-[#D4AF37]/30 flex justify-end space-x-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-[#D4AF37]/30 text-[#888888] hover:bg-[#141414] hover:text-[#F2F0E4] text-xs font-bold cursor-pointer transition-colors uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0A0A0A] text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
          >
            {saveSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save & Apply</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
