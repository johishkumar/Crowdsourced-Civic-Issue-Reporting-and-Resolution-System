import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { Layers, List, Eye, Satellite, Navigation, Crosshair, Shield } from "lucide-react";
import { getTranslator } from "../locales";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const makeIcon = (color, pulse = false) =>
  L.divIcon({
    className: "",
    html: `
      <div style="position:relative;display:inline-flex;align-items:center;justify-content:center;">
        ${pulse ? `<span style="position:absolute;width:32px;height:32px;border-radius:50%;border:2px solid ${color};animation:ping 1s cubic-bezier(0,0,.2,1) infinite;opacity:.75;"></span>` : ""}
        <div style="
          width:22px;height:22px;border-radius:50%;
          background:${color};
          border:2px solid #0A0A0A;
          box-shadow:0 2px 8px rgba(0,0,0,.8);
          display:flex;align-items:center;justify-content:center;
        ">
          <svg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='#0A0A0A' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'>
            <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/>
            <circle cx='12' cy='10' r='3'/>
          </svg>
        </div>
      </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });

const priorityIcon = (priority) => {
  switch (priority) {
    case "critical":
    case "emergency":
      return makeIcon("#C94A4A", true);
    case "high":
      return makeIcon("#D4AF37");
    case "medium":
      return makeIcon("#C58A18");
    default:
      return makeIcon("#888888");
  }
};

function LocationMarker({ onMark }) {
  useMapEvents({
    click(e) {
      onMark(e.latlng);
    },
  });
  return null;
}

const crosshairIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
      <span style="position:absolute;width:36px;height:36px;border-radius:50%;border:2px solid #D4AF37;animation:ping 1s cubic-bezier(0,0,.2,1) infinite;opacity:.6;"></span>
      <div style="
        width:20px;height:20px;border-radius:50%;
        background:#D4AF37;
        border:2px solid #0A0A0A;
        box-shadow:0 2px 12px rgba(212,175,55,.7);
      "></div>
    </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

export default function IssueMap({ issues, onSelectIssue, lang = "en" }) {
  const t = getTranslator(lang);
  const [markedLocation, setMarkedLocation] = useState(null);
  const [markingMode, setMarkingMode] = useState(false);
  const [mapLayer, setMapLayer] = useState("satellite");
  const mapRef = useRef(null);

  const center = [23.2, 85.8];
  const zoom = 8;

  const handleMark = (latlng) => {
    if (!markingMode) return;
    setMarkedLocation(latlng);
  };

  const clearMark = () => {
    setMarkedLocation(null);
    setMarkingMode(false);
  };

  const hotspots = [
    { name: "Khunti District", count: 23, rate: "High activity", color: "bg-[#D4AF37] text-[#0A0A0A]" },
    { name: "Ranchi District", count: 18, rate: "Medium activity", color: "bg-[#141414] text-[#D4AF37] border border-[#D4AF37]/30" },
    { name: "Jamshedpur District", count: 12, rate: "Steady", color: "bg-[#0A0A0A] text-[#F2F0E4] border border-[#D4AF37]/20" },
    { name: "Dhanbad District", count: 8, rate: "Low activity", color: "bg-[#888888]/20 text-[#888888]" },
  ];

  const tileLayers = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
      label: "Satellite",
    },
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      label: "Street",
    },
    topo: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      label: "Topo",
    },
  };

  return (
    <div className="space-y-6 animate-float-in">
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
        .leaflet-container{font-family:inherit;}
        .leaflet-popup-content-wrapper{
          background:#0A0A0A;
          border:1px solid #D4AF37;
          border-radius:0px;
          color:#F2F0E4;
          box-shadow:0 10px 25px rgba(0,0,0,0.8);
        }
        .leaflet-popup-tip{background:#0A0A0A;}
        .leaflet-popup-close-button{color:#D4AF37 !important;font-size:16px !important;}
        .leaflet-control-zoom a{background:#0A0A0A!important;color:#D4AF37!important;border-color:#D4AF37/40!important;}
        .leaflet-control-attribution{background:rgba(10,10,10,0.9)!important;color:rgba(242,240,228,0.7)!important;font-size:9px!important;}
        .leaflet-control-attribution a{color:#D4AF37!important;}
        .cursor-crosshair .leaflet-container{cursor:crosshair !important;}
      `}</style>

      {/* Official Government Workspace Banner */}
      <div className="bg-[#141414] border border-[#D4AF37]/40 text-[#F2F0E4] p-6 shadow-md flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 bg-[#0A0A0A] px-3 py-1 text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-2 border border-[#D4AF37]/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Geospatial Infrastructure Monitoring</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-artdeco-heading tracking-wider text-[#F2F0E4]">
            {t("interactiveMapTitle") || "Interactive Map"}
          </h1>
          <p className="text-[#888888] text-xs md:text-sm mt-1 max-w-xl">
            {t("interactiveMapSubtitle") || "Real-time geospatial visualization of reported civic hazards in Jharkhand."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 card-art-deco bg-[#141414] border border-[#D4AF37]/30 p-5 flex flex-col space-y-5">
          <h3 className="font-artdeco-heading text-[#F2F0E4] text-sm flex items-center space-x-2 border-b border-[#D4AF37]/30 pb-3 uppercase tracking-wider">
            <List className="h-4 w-4 text-[#D4AF37]" />
            <span>{t("hotspotsSummary") || "Hotspots Summary"}</span>
          </h3>

          <div className="space-y-2.5">
            {hotspots.map((hot, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-3 bg-[#0A0A0A] border border-[#D4AF37]/20">
                <div>
                  <p className="font-artdeco-heading text-[#F2F0E4]">{hot.name}</p>
                  <span className="text-[10px] text-[#888888] font-semibold">{hot.rate}</span>
                </div>
                <span className={`px-2 py-0.5 text-[11px] font-bold ${hot.color}`}>{hot.count}</span>
              </div>
            ))}
          </div>

          {/* Priority Legend */}
          <div className="pt-2">
            <h4 className="font-artdeco-heading text-[#D4AF37] text-xs mb-3 uppercase tracking-widest">{t("priorityLegend") || "Priority Legend"}</h4>
            <div className="space-y-2 text-xs text-[#F2F0E4] font-medium">
              {[
                { color: "bg-[#C94A4A]", label: "Critical / Emergency" },
                { color: "bg-[#D4AF37]", label: "High Priority" },
                { color: "bg-[#C58A18]", label: "Medium Priority" },
                { color: "bg-[#888888]", label: "Low Priority" },
              ].map((l) => (
                <div key={l.label} className="flex items-center space-x-2">
                  <span className={`w-3 h-3 block border border-[#0A0A0A] ${l.color}`} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Marked Location Info */}
          {markedLocation && (
            <div className="mt-2 p-3 bg-[#0A0A0A] border border-[#D4AF37]/40 text-xs">
              <p className="font-artdeco-heading text-[#D4AF37] mb-1 flex items-center gap-1 uppercase tracking-wider">
                <Crosshair className="h-3.5 w-3.5 text-[#D4AF37]" /> Marked Location
              </p>
              <p className="text-[#888888] font-mono">
                Lat: {markedLocation.lat.toFixed(6)}<br />
                Lng: {markedLocation.lng.toFixed(6)}
              </p>
              <button
                onClick={clearMark}
                className="mt-2 text-[11px] text-[#D4AF37] font-semibold hover:underline cursor-pointer uppercase tracking-wider"
              >
                Clear mark
              </button>
            </div>
          )}
        </div>

        {/* Right Map Area */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          {/* Controls Bar */}
          <div className="card-art-deco bg-[#141414] border border-[#D4AF37]/30 p-3.5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-artdeco-heading text-[#F2F0E4] text-sm uppercase tracking-wider">{t("geospatialControls") || "Geospatial Controls"}</h3>

            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(tileLayers).map(([key, layer]) => (
                <button
                  key={key}
                  onClick={() => setMapLayer(key)}
                  className={`px-3 py-1.5 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors uppercase tracking-wider border ${
                    mapLayer === key
                      ? "border-[#D4AF37] bg-[#D4AF37] text-[#0A0A0A]"
                      : "border-[#D4AF37]/30 bg-[#0A0A0A] text-[#F2F0E4] hover:border-[#D4AF37]"
                  }`}
                >
                  {key === "satellite" && <Satellite className="h-3.5 w-3.5" />}
                  {key === "street" && <Navigation className="h-3.5 w-3.5" />}
                  {key === "topo" && <Layers className="h-3.5 w-3.5" />}
                  <span>{layer.label}</span>
                </button>
              ))}

              <button
                onClick={() => setMarkingMode(!markingMode)}
                className={`px-3 py-1.5 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors uppercase tracking-wider border ${
                  markingMode
                    ? "border-[#D4AF37] bg-[#D4AF37] text-[#0A0A0A]"
                    : "border-[#D4AF37]/30 bg-[#0A0A0A] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A]"
                }`}
              >
                <Crosshair className="h-3.5 w-3.5" />
                <span>{markingMode ? "Click Map to Mark" : "Mark Location"}</span>
              </button>
            </div>
          </div>

          {/* Leaflet Map */}
          <div className={`relative overflow-hidden border border-[#D4AF37]/40 shadow-sm ${markingMode ? "cursor-crosshair" : ""}`} style={{ height: "500px" }}>
            <MapContainer
              center={center}
              zoom={zoom}
              style={{ width: "100%", height: "100%" }}
              zoomControl={false}
              ref={mapRef}
            >
              <ZoomControl position="bottomright" />
              <TileLayer
                key={mapLayer}
                url={tileLayers[mapLayer].url}
                attribution={tileLayers[mapLayer].attribution}
                maxZoom={19}
              />

              <LocationMarker onMark={handleMark} />

              {issues.map((issue) => {
                const coords = issue.location?.coordinates;
                if (!coords?.lat || !coords?.lng) return null;
                return (
                  <Marker
                    key={issue.id}
                    position={[coords.lat, coords.lng]}
                    icon={priorityIcon(issue.priority)}
                  >
                    <Popup closeButton maxWidth={300}>
                      <div className="p-1 min-w-[200px]">
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest block mb-1">
                          #{issue.ticketId || issue.id}
                        </span>
                        <h4 className="font-artdeco-heading text-[#F2F0E4] text-sm mb-1">{issue.title}</h4>
                        <p className="text-[#888888] text-xs mb-3">{issue.location.address}</p>
                        <button
                          onClick={() => onSelectIssue(issue)}
                          className="w-full bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0A0A0A] py-1 text-xs font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#0A0A0A]" />
                          View Ticket
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {markedLocation && (
                <Marker position={markedLocation} icon={crosshairIcon}>
                  <Popup closeButton>
                    <div className="p-1 min-w-[180px]">
                      <p className="font-artdeco-heading text-[#D4AF37] text-xs mb-1 flex items-center gap-1 uppercase tracking-wider">
                        <span>📍</span> Marked Location
                      </p>
                      <p className="text-[#F2F0E4] text-xs font-mono">
                        Lat: {markedLocation.lat.toFixed(6)}<br />
                        Lng: {markedLocation.lng.toFixed(6)}
                      </p>
                      <button
                        onClick={clearMark}
                        className="mt-2 text-[10px] text-[#D4AF37] hover:underline cursor-pointer uppercase tracking-wider"
                      >
                        Remove mark
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            {markingMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-[#0A0A0A] text-[#F2F0E4] text-xs font-bold px-4 py-2 border border-[#D4AF37] shadow-md flex items-center gap-2 pointer-events-none uppercase tracking-wider">
                <Crosshair className="h-4 w-4 text-[#D4AF37]" />
                Click anywhere on the map to drop a pin
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
