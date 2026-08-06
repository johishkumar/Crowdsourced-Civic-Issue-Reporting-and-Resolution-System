import React, { useState } from "react";
import { Filter, Layers, MapPin, List, Eye, X } from "lucide-react";
import { getTranslator } from "../locales";

export default function IssueMap({ issues, onSelectIssue, lang = "en" }) {
  const t = getTranslator(lang);
  const [heatmap, setHeatmap] = useState(false);
  const [cluster, setCluster] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);

  const minLat = 22.5;
  const maxLat = 24.0;
  const minLng = 85.0;
  const maxLng = 86.6;

  const getPos = (coords) => {
    if (!coords) return { left: "50%", top: "50%" };
    const { lat, lng } = coords;
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    const left = Math.min(Math.max(x, 10), 90);
    const top = Math.min(Math.max(y, 10), 90);
    return { left: `${left}%`, top: `${top}%` };
  };

  const getPinColor = (priority) => {
    switch (priority) {
      case "critical":
      case "emergency":
        return "bg-gradient-to-br from-red-500 to-red-700 text-white border-red-400 animate-pulse";
      case "high":
        return "bg-gradient-to-br from-saffron-500 to-saffron-700 text-white border-saffron-400";
      case "medium":
        return "bg-gradient-to-br from-peacock-500 to-peacock-700 text-white border-peacock-400";
      default:
        return "bg-gradient-to-br from-dark-500 to-dark-600 text-white border-dark-400";
    }
  };

  return (
    <div className="space-y-8 animate-float-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-dark-800 tracking-tight">{t("interactiveMapTitle")}</h1>
        <p className="text-dark-500 font-medium mt-1">{t("interactiveMapSubtitle")}</p>
        <div className="flex items-center mt-3 gap-1.5">
          <div className="h-0.5 w-16 bg-gradient-to-r from-saffron-400 to-saffron-200 rounded-full" />
          <div className="w-1.5 h-1.5 rounded-full bg-saffron-400" />
          <div className="w-1 h-1 rounded-full bg-peacock-400" />
          <div className="h-0.5 w-8 bg-gradient-to-r from-peacock-300 to-transparent rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Stats Sidebar */}
        <div className="lg:col-span-1 card-premium p-6 rounded-3xl flex flex-col space-y-5">
          <h3 className="font-bold text-dark-800 text-sm flex items-center space-x-1.5 border-b border-saffron-100/20 pb-3">
            <List className="h-4.5 w-4.5 text-saffron-600" />
            <span>{t("hotspotsSummary")}</span>
          </h3>

          <div className="space-y-3">
            {[
               { name: "Khunti District", count: 23, rate: "High activity", color: "text-saffron-600 bg-saffron-50" },
               { name: "Ranchi District", count: 18, rate: "Medium activity", color: "text-peacock-600 bg-peacock-50" },
               { name: "Jamshedpur District", count: 12, rate: "Steady", color: "text-jewel-600 bg-jewel-50" },
               { name: "Dhanbad District", count: 8, rate: "Low activity", color: "text-dark-600 bg-saffron-50/10" },
            ].map((hot, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-3 bg-white/60 hover:bg-white rounded-xl border border-saffron-100/10 transition-colors">
                <div>
                  <p className="font-bold text-dark-700">{hot.name}</p>
                  <span className="text-[10px] text-dark-500/50 font-semibold">{hot.rate}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-lg font-bold ${hot.color}`}>
                  {hot.count}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <h4 className="font-bold text-dark-700 text-xs mb-3 uppercase tracking-wider">
              {t("priorityLegend")}
            </h4>
            <div className="space-y-2.5 text-xs text-dark-600 font-semibold">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-red-500 block border-2 border-white shadow-sm ring-1 ring-red-400 animate-pulse" />
                <span>Critical / Emergency</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-saffron-500 block border-2 border-white shadow-sm ring-1 ring-saffron-400" />
                <span>High Priority</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-peacock-500 block border-2 border-white shadow-sm ring-1 ring-peacock-400" />
                <span>Medium Priority</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-dark-500 block border-2 border-white shadow-sm ring-1 ring-dark-400" />
                <span>Low Priority</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Canvas */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="card-premium p-4 rounded-2xl flex items-center justify-between">
            <h3 className="font-bold text-dark-800 text-sm hidden md:block">{t("geospatialControls")}</h3>
            <div className="flex space-x-2.5">
              <button
                onClick={() => setHeatmap(!heatmap)}
                className={`px-4 py-2 border rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all ${
                  heatmap
                    ? "gradient-jewel border-jewel-700 text-white font-bold"
                    : "bg-white border-saffron-200/50 text-dark-700 hover:bg-saffron-50/20"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>{t("heatmapOverlay")}</span>
              </button>

              <button
                onClick={() => setCluster(!cluster)}
                className={`px-4 py-2 border rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all ${
                  cluster
                    ? "gradient-saffron border-saffron-700 text-white font-bold"
                    : "bg-white border-saffron-200/50 text-dark-700 hover:bg-saffron-50/20"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>{t("clusterPoints")}</span>
              </button>
            </div>
          </div>

          {/* Map canvas */}
          <div className="relative w-full h-[500px] bg-dark-900 rounded-3xl overflow-hidden shadow-2xl border border-saffron-700/10 group">
            {/* Map Matrix patterns */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-px pointer-events-none opacity-[0.03]">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border border-white" />
              ))}
            </div>

            {heatmap && (
              <div className="absolute inset-0 pointer-events-none transition-opacity duration-300">
                {issues.map((issue) => {
                  const pos = getPos(issue.location.coordinates);
                  return (
                    <div
                      key={`glow-${issue.id}`}
                      style={{ left: pos.left, top: pos.top }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-radial from-saffron-500/15 via-saffron-500/5 to-transparent rounded-full select-none"
                    />
                  );
                })}
              </div>
            )}

            {/* Custom vector silhouette of regional landmass */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.12] select-none">
              <svg className="w-[85%] h-[85%] text-saffron-600" viewBox="0 0 100 100" fill="currentColor">
                <path d="M 25 30 Q 35 15 50 20 T 80 35 Q 90 60 70 75 T 40 85 Q 15 70 20 50 Z" />
              </svg>
            </div>

            {/* Label overlays */}
            <div className="absolute top-[20%] left-[30%] opacity-25 text-white text-xs font-black font-mono tracking-widest pointer-events-none">RANCHI</div>
            <div className="absolute top-[32%] left-[45%] opacity-25 text-white text-xs font-black font-mono tracking-widest pointer-events-none">KHUNTI</div>
            <div className="absolute top-[55%] left-[70%] opacity-25 text-white text-xs font-black font-mono tracking-widest pointer-events-none">JAMSHEDPUR</div>
            <div className="absolute top-[15%] left-[80%] opacity-25 text-white text-xs font-black font-mono tracking-widest pointer-events-none">DHANBAD</div>

            {/* Pins */}
            {issues.map((issue) => {
              const pos = getPos(issue.location.coordinates);
              return (
                <div key={issue.id} style={{ left: pos.left, top: pos.top }} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <button
                    onClick={() => setSelectedPin(issue)}
                    className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform hover:scale-125 cursor-pointer ${getPinColor(issue.priority)}`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                  </button>

                  {(issue.priority === "emergency" || issue.isEmergency) && (
                    <span className="absolute -inset-1.5 rounded-full border-2 border-red-500 animate-ping opacity-75 pointer-events-none" />
                  )}
                </div>
              );
            })}

            {/* Popup Details */}
            {selectedPin && (
              <div className="absolute bottom-6 left-6 right-6 bg-dark-800/95 backdrop-blur-md border border-saffron-700/20 p-4.5 rounded-2xl flex items-center justify-between text-white shadow-2xl z-10 max-w-md animate-float-in">
                <div className="flex-1 min-w-0 pr-4">
                  <span className="text-[9px] font-bold text-saffron-400 uppercase tracking-widest block font-mono">
                    {selectedPin.ticketId}
                  </span>
                  <h4 className="font-bold text-white text-sm truncate mb-0.5">
                    {selectedPin.title}
                  </h4>
                  <p className="text-white/60 text-xs truncate max-w-xs">{selectedPin.location.address}</p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onSelectIssue(selectedPin)}
                    className="px-3.5 py-1.5 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center space-x-1 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{t("viewTicket")}</span>
                  </button>
                  <button
                    onClick={() => setSelectedPin(null)}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl cursor-pointer text-xs transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
