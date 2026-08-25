import React, { useState, useEffect, useRef } from "react";
import { Camera, MapPin, Mic, MicOff, Check, X, ShieldAlert, Languages, Image as ImageIcon, KeyRound, Smartphone, RefreshCw, Settings, Video, Film, Sparkles, AlertCircle } from "lucide-react";
import { categoryImages } from "../mockData";
import { getTranslator } from "../locales";
import { sendSms } from "../utils/smsHelper";
import SmsSettingsModal from "./SmsSettingsModal";
import { analyseMedia } from "../utils/imageAnalysis";

export default function ReportIssue({ user, onAddIssue, lang = "en" }) {
  const t = getTranslator(lang);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("road");
  const [priority, setPriority] = useState("medium");
  const [locationAddress, setLocationAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedLang, setSelectedLang] = useState(lang || user.language || "en");
  
  // Webcam Capture States
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraModalTab, setCameraModalTab] = useState("photo"); // "photo" | "video"
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(false);          // camera unavailable
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoRecordingTime, setVideoRecordingTime] = useState(0);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const videoTimerRef = useRef(null);
  const videoInputRef = useRef(null);
  
  // OTP Verification States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [showSmsSettings, setShowSmsSettings] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [smsStatusMessage, setSmsStatusMessage] = useState("");
  const [smsStatusType, setSmsStatusType] = useState("info");

  // OTP Countdown Timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);
  
  useEffect(() => {
    if (lang) {
      setSelectedLang(lang);
    }
  }, [lang]);

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize Google Map
  useEffect(() => {
    // Google Maps removed — using Leaflet/OSM iframe instead
  }, [showMap]);

  // Update map marker/center when coords change
  useEffect(() => {
    // Handled via iframe src re-render
  }, [coords]);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState(0);
  const recordingInterval = useRef(null);
  const recognitionRef = useRef(null);

  // Enhanced voice state
  const [interimText, setInterimText] = useState("");
  const [voiceFilled, setVoiceFilled] = useState(false);
  const [voiceOriginal, setVoiceOriginal] = useState("");
  const [voiceDetectedCategory, setVoiceDetectedCategory] = useState("");
  const [voiceToastVisible, setVoiceToastVisible] = useState(false);

  // AI Image/Video Analysis state
  const [aiAnalysing, setAiAnalysing] = useState(false);
  const [aiResult, setAiResult] = useState(null);   // { category, title, description, priority, confidence }
  const [aiError, setAiError] = useState(false);
  const [aiSource, setAiSource] = useState("");      // "image" | "video"
  const [aiToastVisible, setAiToastVisible] = useState(false);

  const sampleAddresses = [
    { address: "Kutchery Road, Ranchi, Jharkhand", lat: 23.3698, lng: 85.3241 },
    { address: "Court Road, Khunti, Jharkhand", lat: 23.0801, lng: 85.2795 },
    { address: "Bistupur Market Road, Jamshedpur", lat: 22.7984, lng: 86.1792 },
    { address: "Katras Road, Dhanbad, Jharkhand", lat: 23.8012, lng: 86.4194 },
  ];

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setVoiceTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingInterval.current);
      setVoiceTimer(0);
    }
    return () => clearInterval(recordingInterval.current);
  }, [isRecording]);

  const handleMockVoiceEnd = () => {
    setIsRecording(false);
    setInterimText("");
    const voiceMocks = {
      en: { title: "Leaking Water Valve", desc: "Huge water leak leaking on public street since yesterday. Water flooding road.", category: "water", priority: "medium", emoji: "💧" },
      hi: { title: "जल रिसाव पाइपलाइन", desc: "कल से सरकारी नल में से पानी बह जा रहा है, रास्ता में बाढ़ जैसी हालत हो गया है।", category: "water", priority: "medium", emoji: "💧" },
      bho: { title: "पानी के पाइप लीक", desc: "काल्ह से नल में से ढेरी पानी बह रहल बा, गली में पूरा कीचड़ हो गइल बा।", category: "water", priority: "medium", emoji: "💧" },
      mai: { title: "पानी पाइपलाइन चुइब", desc: "काल्ह स सरकारी नल सं पानी बह रहल छैक, बाट पर बाढ़ सन भ गेल छैक।", category: "water", priority: "medium", emoji: "💧" },
      mag: { title: "पानी चुअहिया नल", desc: "काल्ह से नलवा से पानी बह रहल हई, रस्तावा पर पुरा पानी जम गेलो हई।", category: "water", priority: "medium", emoji: "💧" },
      sat: { title: "ᱫᱟᱜ ᱯᱟᱹᱭᱯ ᱞᱤᱠ", desc: "ᱦᱚᱞᱟ ᱠᱷᱚᱱ ᱥᱚᱨᱠᱟᱨᱤ ᱫᱟᱜ ᱯᱟᱹᱭᱯ ᱠᱷᱚᱱ ᱫᱟᱜ ᱞᱤᱠ ᱠﺎᱱᱟ, ᱦᱚᱨ ᱨᱮ ᱫᱟᱜ ᱯᱮᱨᱮᱡ ᱮᱱᱟ᱾", category: "water", priority: "medium", emoji: "💧" },
      ta: { title: "குடிநீர் குழாய் கசிவு", desc: "நேற்று முதல் பொது வீதியில் குடிநீர் குழாயில் பெருமளவில் கசிவு ஏற்பட்டுள்ளது. சாலையில் தண்ணீர் தேங்கியுள்ளது.", category: "water", priority: "medium", emoji: "💧" },
      ml: { title: "കുടിവെള്ള പൈപ്പിലെ ചോർച്ച", desc: "ഇന്നലെ മുതൽ പൊതു വഴിയിൽ കുടിവെള്ള പൈപ്പിൽ ജലചോർച്ചയുണ്ട്, റോഡിൽ വെള്ളം കെട്ടിക്കിടക്കുന്നു.", category: "water", priority: "medium", emoji: "💧" },
    };
    const mockFill = voiceMocks[selectedLang] || voiceMocks.en;
    setTitle(mockFill.title);
    setDescription(mockFill.desc);
    setCategory(mockFill.category);
    setPriority(mockFill.priority);
    setVoiceOriginal(mockFill.desc);
    setVoiceDetectedCategory(`${mockFill.emoji || "📢"} ${mockFill.title}`);
    setVoiceFilled(true);
    setVoiceToastVisible(true);
    setTimeout(() => setVoiceToastVisible(false), 4000);
  };

  // Real Device GPS using browser Geolocation API
  const handleDeviceGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });
        setShowMap(true);
        // Reverse geocode using OpenStreetMap Nominatim (free, no API key)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const address = data.display_name || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
          setLocationAddress(address);
        } catch {
          setLocationAddress(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
        }
        setGpsLoading(false);
      },
      (error) => {
        setGpsLoading(false);
        const msgs = {
          1: "Location permission denied. Please allow location access in your browser settings.",
          2: "Location unavailable. Try again.",
          3: "Location request timed out. Try again.",
        };
        alert(msgs[error.code] || "Could not get your location.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const fileInputRef = useRef(null);

  // ── Shared AI analysis runner ────────────────────────────────────────────
  // analyseMedia() handles both Gemini API (if key set) and visual heuristic fallback internally.
  const runAiAnalysis = async (src, isVideo = false) => {
    setAiResult(null);
    setAiError(false);
    setAiAnalysing(true);
    setAiSource(isVideo ? "video" : "image");
    try {
      const result = await analyseMedia(src, isVideo);
      if (result && result.confidence >= 45) {
        setAiResult(result);
        setCategory(result.category);
        setTitle(result.title);
        setDescription(result.description);
        setPriority(result.priority || "medium");
        setAiToastVisible(true);
        setTimeout(() => setAiToastVisible(false), 4500);
      } else {
        setAiError(true);
      }
    } catch {
      setAiError(true);
    } finally {
      setAiAnalysing(false);
    }
  };

  // ── Image file picker handler ─────────────────────────────────────────────
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const firstFile = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setImages((prev) => [...prev, dataUrl]);
      // Trigger AI analysis on the first uploaded image — pass filename for fallback
      runAiAnalysis(dataUrl, false);
    };
    reader.readAsDataURL(firstFile);
    // Add remaining files without analysis
    files.slice(1).forEach((file) => {
      const r = new FileReader();
      r.onloadend = () => setImages((prev) => [...prev, r.result]);
      r.readAsDataURL(file);
    });
    e.target.value = "";
  };

  // ── Video file picker handler ─────────────────────────────────────────────
  const handleVideoFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const firstFile = files[0];
    const url = URL.createObjectURL(firstFile);
    setVideos((prev) => [...prev, { url, name: firstFile.name, size: firstFile.size }]);
    // Trigger AI analysis on first video thumbnail — pass filename for fallback
    runAiAnalysis(url, true);
    // Add remaining videos
    files.slice(1).forEach((file) => {
      const u = URL.createObjectURL(file);
      setVideos((prev) => [...prev, { url: u, name: file.name, size: file.size }]);
    });
    e.target.value = "";
  };

  const startCamera = async () => {
    setCameraError(false);
    try {
      // Try ideal rear camera first (mobile), fall back to any camera (desktop/laptop)
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch {
        // Rear camera not available (desktop) — use any available camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access error:", err);
      // Keep the modal open — show inline error so user can use file upload button
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraError(false);
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setImages((prev) => [...prev, dataUrl]);
      stopCamera();
      setShowCameraModal(false);
      // Run AI analysis on the live-captured photo
      runAiAnalysis(dataUrl, false, "camera-capture.jpg");
    }
  };

  // ── Live Video Recording via MediaRecorder ────────────────────────────────
  const startVideoRecording = () => {
    if (!cameraStream) return;
    const chunks = [];
    // Pick a supported MIME type — Safari needs mp4, Chrome/Firefox prefer webm
    const mimeType = MediaRecorder.isTypeSupported("video/webm; codecs=vp8")
      ? "video/webm; codecs=vp8"
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "video/mp4";
    const recorder = new MediaRecorder(cameraStream, { mimeType });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const name = `live_evidence_${Date.now()}.${ext}`;
      setVideos((prev) => [...prev, { url, name, size: blob.size }]);
      clearInterval(videoTimerRef.current);
      setVideoRecordingTime(0);
      setIsVideoRecording(false);
      stopCamera();
      setShowCameraModal(false);
      // Run AI analysis on the live-recorded video
      runAiAnalysis(url, true, name);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsVideoRecording(true);
    setVideoRecordingTime(0);
    videoTimerRef.current = setInterval(() => setVideoRecordingTime((t) => t + 1), 1000);
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isVideoRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleImagePicker = () => {
    setCameraError(false);
    setCameraModalTab("photo");
    setShowCameraModal(true);
    setTimeout(() => { startCamera(); }, 100);
  };

  const handleVideoPicker = () => {
    setCameraError(false);
    setCameraModalTab("video");
    setShowCameraModal(true);
    setTimeout(() => { startCamera(); }, 100);
  };

  // ── Dialect → browser locale map ──────────────────────────────────────────
  const getLocaleForLang = (lang) => {
    const map = {
      en: "en-US",
      hi: "hi-IN",
      ta: "ta-IN",
      ml: "ml-IN",
      // Bhojpuri, Maithili, Magahi share Devanagari and are closest to hi-IN
      bho: "hi-IN",
      mai: "hi-IN",
      mag: "hi-IN",
      // Santali (Ol Chiki script) — no dedicated browser locale; use en-IN for
      // broadest audio model compatibility then map keywords manually
      sat: "en-IN",
    };
    return map[lang] || "en-US";
  };

  // ── Multi-language keyword → category detection ───────────────────────────
  const classifyVoiceText = (text) => {
    const t = text.toLowerCase();

    // Road / Pothole
    if (
      t.includes("road") || t.includes("pothole") || t.includes("tarmac") ||
      // Hindi
      t.includes("सड़क") || t.includes("गड्ढा") || t.includes("गड्ढे") || t.includes("रास्ता") ||
      // Bhojpuri
      t.includes("रस्तवा") || t.includes("रस्ता") || t.includes("गड्ढा") ||
      // Maithili
      t.includes("बाट") || t.includes("रस्ता") ||
      // Magahi
      t.includes("रस्तावा") || t.includes("गड्ढा") ||
      // Santali (phonetic transliteration captured via en-IN)
      t.includes("hor") || t.includes("dahar") || t.includes("ᱦᱚᱨ") || t.includes("ᱰᱟᱦᱟᱨ") ||
      // Tamil
      t.includes("சாலை") || t.includes("குழி") || t.includes("பள்ளம்") ||
      // Malayalam
      t.includes("റോഡ്") || t.includes("കുഴി")
    ) return { cat: "road", titles: { en: "Road Repair Alert", hi: "सड़क मरम्मत अलर्ट", bho: "रस्तवा सुधार अलर्ट", sat: "Hor Doho Alert", ta: "சாலை பழுது அலர்ட்", ml: "റോഡ് റിപ്പയർ അലർട്ട്" }, emoji: "🛣️" };

    // Water / Pipe leak
    if (
      t.includes("water") || t.includes("leak") || t.includes("pipe") || t.includes("flood") ||
      t.includes("पानी") || t.includes("जल") || t.includes("नल") || t.includes("पाइप") || t.includes("चुअव") ||
      // Bhojpuri
      t.includes("पनिया") || t.includes("नलवा") || t.includes("चुइब") ||
      // Santali phonetic
      t.includes("dak") || t.includes("ᱫᱟᱜ") || t.includes("ᱯᱟᱹᱭᱯ") ||
      t.includes("தண்ணீர்") || t.includes("நீர்") || t.includes("குழாய்") || t.includes("கசிவு") ||
      t.includes("വെള്ളം") || t.includes("ജലം") || t.includes("പൈപ്പ്") || t.includes("ചോർച്ച")
    ) return { cat: "water", titles: { en: "Water Supply Leak", hi: "जल आपूर्ति रिसाव", bho: "पनिया पाइप लीक", sat: "Dak Leak Report", ta: "குடிநீர் கசிவு", ml: "ജലക്കുഴൽ ചോർച്ച" }, emoji: "💧" };

    // Garbage / Sanitation
    if (
      t.includes("garbage") || t.includes("waste") || t.includes("trash") || t.includes("sanitation") || t.includes("dump") ||
      t.includes("कचरा") || t.includes("कूड़ा") || t.includes("गंदगी") || t.includes("सफाई") ||
      // Bhojpuri / Maithili
      t.includes("कचड़ा") || t.includes("गंदगी") ||
      // Santali phonetic
      t.includes("jokhira") || t.includes("ᱡᱚᱵᱽᱨᱟ") ||
      t.includes("குப்பை") || t.includes("கழிவு") || t.includes("தூய்மை") ||
      t.includes("മാലിന്യം") || t.includes("ചപ്പുചവറ്")
    ) return { cat: "garbage", titles: { en: "Garbage Removal Request", hi: "कचरा हटाने का अनुरोध", bho: "कचड़ा उठाव के अनुरोध", sat: "Jokhira Hatao Request", ta: "குப்பை அகற்று கோரிக்கை", ml: "മാലിന്യ നിർമ്മാർജ്ജന അഭ്യർത്ഥന" }, emoji: "🗑️" };

    // Electricity / Street Light
    if (
      t.includes("light") || t.includes("electric") || t.includes("power") || t.includes("dark") || t.includes("outage") ||
      t.includes("बिजली") || t.includes("लाइट") || t.includes("अंधेरा") || t.includes("करंट") ||
      // Bhojpuri
      t.includes("बिजुली") || t.includes("लाइन") || t.includes("अंजोर") ||
      // Santali phonetic
      t.includes("bijli") || t.includes("ᱵᱤᱡᱽᱞᱤ") ||
      t.includes("மின்சாரம்") || t.includes("விளக்கு") || t.includes("இருள்") ||
      t.includes("കറന്റ്") || t.includes("വെളിച்ചം") || t.includes("ഇരുട്ട്")
    ) {
      const catKey = t.includes("street") || t.includes("lamp") || t.includes("pole") ||
                     t.includes("सड़क") || t.includes("खंभ") || t.includes("विळक्கு") ? "streetlight" : "electricity";
      return { cat: catKey, titles: { en: "Streetlight / Electricity Issue", hi: "बिजली / स्ट्रीटलाइट समस्या", bho: "बिजुली लाइन खराब", sat: "Bijli Problem Report", ta: "மின் தடை புகார்", ml: "വൈദ്യുതി പ്രശ്നം" }, emoji: "💡" };
    }

    // Drainage
    if (
      t.includes("drain") || t.includes("sewer") || t.includes("stink") || t.includes("clog") ||
      t.includes("नाला") || t.includes("ड्रेन") || t.includes("सीवर") || t.includes("बदबू") ||
      t.includes("ᱩᱡᱩ") ||
      t.includes("வடிகால்") || t.includes("சாக்கடை") ||
      t.includes("ഓട") || t.includes("ചാനൽ")
    ) return { cat: "drainage", titles: { en: "Open Drainage Issue", hi: "खुला नाला शिकायत", bho: "नाला जाम बा", sat: "Drain Block Report", ta: "வடிகால் அடைப்பு", ml: "ഓട അടഞ്ഞ പ്രശ്നം" }, emoji: "🚧" };

    // Noise
    if (
      t.includes("noise") || t.includes("loud") || t.includes("sound") || t.includes("disturb") ||
      t.includes("शोर") || t.includes("आवाज") || t.includes("ध्वनि") ||
      t.includes("शोर") || t.includes("गड़गड़") ||
      t.includes("சத்தம்") || t.includes("ஆரவாரம்") ||
      t.includes("ശബ്ദം") || t.includes("ബഹളം")
    ) return { cat: "noise", titles: { en: "Noise Pollution Complaint", hi: "ध्वनि प्रदूषण शिकायत", bho: "शोर-शराबा शिकायत", sat: "Noise Problem Report", ta: "ஒலி மாசு புகார்", ml: "ശബ്ദ മലിനീകരണ പരാതി" }, emoji: "🔊" };

    // Public Safety / Emergency
    if (
      t.includes("accident") || t.includes("fire") || t.includes("danger") || t.includes("help") || t.includes("emergency") ||
      t.includes("हादसा") || t.includes("आग") || t.includes("खतरा") || t.includes("मदद") ||
      t.includes("आगि") || t.includes("खतरा") ||
      t.includes("தீ") || t.includes("ஆபத்து") || t.includes("உதவி") ||
      t.includes("തീ") || t.includes("അപകടം") || t.includes("സഹായം")
    ) return { cat: "public-safety", titles: { en: "Public Safety Emergency", hi: "सार्वजनिक सुरक्षा आपात", bho: "सुरक्षा इमरजेंसी", sat: "Emergency Safety Report", ta: "பொது பாதுகாப்பு அவசரநிலை", ml: "പൊതു സുരക്ഷ അടിയന്തരാവസ്ഥ" }, emoji: "🚨" };

    // Default / general
    return { cat: "road", titles: { en: "Voice Reported Civic Issue", hi: "वॉइस रिपोर्ट — नागरिक समस्या", bho: "आवाज रिपोर्ट", sat: "Voice Report", ta: "குரல் புகார்", ml: "ശബ്ദ റിപ്പോർട്ട്" }, emoji: "📢" };
  };

  const handleTriggerRecording = () => {
    // ── Stop if already recording ──────────────────────────────────────────
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
      setInterimText("");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Reset voice state
    setVoiceFilled(false);
    setVoiceOriginal("");
    setVoiceDetectedCategory("");
    setInterimText("");

    if (!SpeechRecognition) {
      handleMockVoiceEnd();
      return;
    }

    const locale = getLocaleForLang(selectedLang);
    let recognition;
    try {
      recognition = new SpeechRecognition();
    } catch (e) {
      handleMockVoiceEnd();
      return;
    }

    recognition.lang = locale;
    recognition.interimResults = true;   // ← live streaming
    recognition.continuous = false;
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;

    let handled = false;

    recognition.onstart = () => { 
      setIsRecording(true); 
    };

    // Live interim results — update Description field directly in real-time as user speaks
    recognition.onresult = (event) => {
      let interim = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      const activeText = (finalTranscript || interim).trim();
      setInterimText(interim || finalTranscript);

      // LIVE UPDATE DESCRIPTION TEXTAREA AS USER SPEAKS!
      if (activeText) {
        setDescription(activeText);
      }

      if (finalTranscript) {
        handled = true;
        const spokenText = finalTranscript.trim();
        const classified = classifyVoiceText(spokenText);
        const titleKey = ["hi", "bho", "mai", "mag"].includes(selectedLang) ? "hi"
                        : ["ta"].includes(selectedLang) ? "ta"
                        : ["ml"].includes(selectedLang) ? "ml"
                        : ["sat"].includes(selectedLang) ? "sat"
                        : "en";
        const autoTitle = classified.titles[titleKey] || classified.titles.en;

        setDescription(spokenText);
        setTitle(autoTitle);
        setCategory(classified.cat);
        setVoiceOriginal(spokenText);
        setVoiceDetectedCategory(`${classified.emoji} ${classified.titles.en}`);
        setVoiceFilled(true);
        setInterimText("");
        setIsRecording(false);

        // Auto-set emergency if emergency keywords detected
        const lower = spokenText.toLowerCase();
        if (
          lower.includes("emergency") || lower.includes("आपात") || lower.includes("help") ||
          lower.includes("मदद") || lower.includes("आगि") || lower.includes("fire") || lower.includes("urgent")
        ) {
          setIsEmergency(true);
          setPriority("critical");
        }

        // Show success toast
        setVoiceToastVisible(true);
        setTimeout(() => setVoiceToastVisible(false), 4000);
      }
    };

    recognition.onerror = (e) => {
      console.warn("Speech recognition error:", e?.error);
      handled = true;
      setIsRecording(false);
      setInterimText("");

      // Only surface actionable errors to the user
      if (e?.error === "not-allowed" || e?.error === "audio-capture") {
        alert(
          e.error === "not-allowed"
            ? "Microphone access was denied.\n\nTo fix this:\n1. Click the 🔒 icon in your browser's address bar.\n2. Set Microphone → Allow.\n3. Reload the page and try again."
            : "No microphone detected. Please connect a microphone and try again."
        );
        return;
      }

      // For all other errors (network, service-not-allowed, etc.) silently fallback
      handleMockVoiceEnd();
    };

    recognition.onend = () => {
      if (!handled) {
        setIsRecording(false);
        setInterimText("");
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("recognition.start() error:", err);
      handleMockVoiceEnd();
    }
  };

  const handleOtpDigitChange = (index, value) => {
    const newVal = value.replace(/\D/g, "");
    const updatedDigits = [...otpDigits];
    updatedDigits[index] = newVal;
    setOtpDigits(updatedDigits);
    setOtpError("");

    // Auto focus next input
    if (newVal && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const updatedDigits = [...otpDigits];
        updatedDigits[index - 1] = "";
        setOtpDigits(updatedDigits);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData.length === 6) {
      const updatedDigits = pasteData.split("");
      setOtpDigits(updatedDigits);
      setOtpError("");
      const lastInput = document.getElementById(`otp-input-5`);
      if (lastInput) lastInput.focus();
    }
  };

  const handleSendOtp = async () => {
    const fullPhone = `+91${phoneNumber}`;
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpTimer(30);
    setOtpError("");
    setSmsSending(true);
    setSmsStatusType("info");
    setSmsStatusMessage(`Sending OTP to ${fullPhone}…`);

    try {
      const res = await fetch("/api/auth/send-mobile-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmsStatusType("success");
        setSmsStatusMessage(`✓ OTP sent to ${fullPhone} via SMS!`);
        setGeneratedOtp(""); // Twilio Verify owns the OTP
      } else {
        setSmsStatusType("error");
        setSmsStatusMessage(`SMS Error: ${data.message || "Failed to send OTP."}`);
      }
    } catch (err) {
      setSmsStatusType("error");
      setSmsStatusMessage(`Network error: ${err.message}`);
    } finally {
      setSmsSending(false);
    }
  };

  // Maps category value to a human-readable default title
  const categoryTitleMap = {
    road: "Road & Pothole Issue",
    garbage: "Garbage & Sanitation Issue",
    water: "Water Leakage & Supply Issue",
    electricity: "Electricity Outage",
    streetlight: "Broken Street Light",
    "public-safety": "Public Safety Emergency",
    parks: "Parks & Forestry Issue",
    drainage: "Open Drainage Issue",
    noise: "Noise Pollution",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || !locationAddress.trim() || !phoneNumber.trim()) {
      alert("Please fill in all mandatory fields.");
      return;
    }
    if (phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    
    // Open verification modal and generate first OTP
    handleSendOtp();
    setShowOtpModal(true);
  };

  const handleOtpVerify = async (e) => {
    if (e) e.preventDefault();
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length !== 6) {
      setOtpError("Please enter all 6 digits of the OTP.");
      return;
    }

    setSmsSending(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-mobile-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phoneNumber}`, otp: enteredOtp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOtpError(data.message || "Incorrect OTP. Please try again.");
        setSmsSending(false);
        return;
      }
    } catch (err) {
      setOtpError("Network error. Please try again.");
      setSmsSending(false);
      return;
    }
    setSmsSending(false);

    // Submit ticket on successful OTP verification
    const autoTitle = categoryTitleMap[category] || "Civic Issue Report";
    const finalImages = images.length > 0 ? images : [categoryImages[category] || categoryImages.road];
    const finalVideos = videos.map((v) => v.url);
    const ticket = {
      title: autoTitle,
      description,
      category,
      priority: isEmergency ? "emergency" : priority,
      location: { address: locationAddress, coordinates: coords },
      images: finalImages,
      videos: finalVideos,
      reportedBy: { 
        id: user.id || "1", 
        name: user.name || "Rajesh Kumar", 
        email: user.email || "rajesh@demo.com",
        phone: phoneNumber 
      },
      isEmergency,
      reportingMethod: isRecording ? "voice" : "form",
      language: selectedLang,
    };

    onAddIssue(ticket);
    setTitle("");
    setDescription("");
    setLocationAddress("");
    setImages([]);
    setVideos([]);
    setIsEmergency(false);
    setPhoneNumber("");
    setShowOtpModal(false);
    alert("Success! Your citizenship report ticket has been submitted to Municipality.");
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remain = secs % 60;
    return `${mins}:${remain < 10 ? "0" : ""}${remain}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-float-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-dark-800 tracking-tight">{t("reportCivicIssue")}</h1>
        <p className="text-dark-500 font-medium mt-1">{t("reportSubtitle")}</p>
        <div className="flex items-center mt-3 gap-1.5 font-bold">
          <div className="h-0.5 w-16 bg-gradient-to-r from-theme-400 to-theme-200 rounded-full" />
          <div className="w-1.5 h-1.5 rounded-full bg-theme-400" />
          <div className="w-1 h-1 rounded-full bg-theme-300" />
          <div className="h-0.5 w-8 bg-gradient-to-r from-theme-300 to-transparent rounded-full" />
        </div>
      </div>

      <div className="card-premium rounded-3xl overflow-hidden">
        {/* Dialect Switcher Banner */}
        <div className="bg-theme-50/40 p-6 border-b border-theme-100/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Languages className="h-5 w-5 text-theme-600 animate-pulse" />
            <span className="text-sm font-bold text-dark-700">{t("audioDialectMode")}</span>
          </div>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="px-4 py-2 border border-theme-200/30 rounded-xl bg-white text-xs font-bold text-dark-700 focus:outline-none cursor-pointer"
          >
            <option value="en">English (US)</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="ml">Malayalam (മലയാളം)</option>
            <option value="bho">Bhojpuri (भोजपुरी)</option>
            <option value="mai">Maithili (मैथिली)</option>
            <option value="mag">Magahi (मगही)</option>
            <option value="sat">Santali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
          </select>
        </div>

        {/* ── Voice Input Section (Enhanced) ───────────────────────────────── */}
        <div className="p-8 border-b border-theme-100/20 flex flex-col items-center justify-center text-center bg-theme-50/10 relative overflow-hidden" style={{backgroundImage: "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.04) 0%, transparent 70%)"}}
        >
          {/* Dialect Language Badge */}
          <div className="absolute top-3 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-theme-50 rounded-full border border-theme-200/40 text-[10px] font-black text-theme-700 uppercase tracking-wider">
            <Languages className="h-3 w-3" />
            <span>{
              selectedLang === "sat" ? "Santali" :
              selectedLang === "bho" ? "Bhojpuri" :
              selectedLang === "mai" ? "Maithili" :
              selectedLang === "mag" ? "Magahi" :
              selectedLang === "hi"  ? "Hindi" :
              selectedLang === "ta"  ? "Tamil" :
              selectedLang === "ml"  ? "Malayalam" : "English"
            } dialect</span>
          </div>

          {/* Mic Button + Animated Rings */}
          <div className="relative mt-2">
            {/* Pulsing rings when recording */}
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" style={{animationDuration: "0.9s"}} />
                <span className="absolute -inset-3 rounded-full bg-red-400/10 animate-ping" style={{animationDuration: "1.3s", animationDelay: "0.2s"}} />
              </>
            )}
            <button
              type="button"
              onClick={handleTriggerRecording}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer border-2 ${
                isRecording
                  ? "bg-gradient-to-br from-red-600 to-red-400 border-red-300 text-white"
                  : voiceFilled
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-emerald-500/30"
                  : "bg-gradient-to-br from-theme-500 to-theme-700 border-theme-400 text-white shadow-theme-500/20"
              }`}
              title={isRecording ? "Tap to stop recording" : "Tap to start speaking"}
            >
              {isRecording ? <MicOff className="h-9 w-9" /> : voiceFilled ? <Check className="h-9 w-9" /> : <Mic className="h-9 w-9" />}
            </button>
          </div>

          {/* Title + Subtitle */}
          <h3 className="font-bold text-dark-800 text-md mt-4">
            {isRecording ? "🎙️ Listening… speak now" : voiceFilled ? "✅ Voice filled! Tap to re-record" : "Tap to Speak Report Info"}
          </h3>
          <p className="text-dark-500 text-xs mt-1 max-w-sm leading-relaxed">
            {isRecording
              ? "Speak in your native dialect — Santali, Bhojpuri, Hindi, Tamil, Malayalam, or English."
              : "Record in your native dialect — AI auto-detects issue type and fills the form."
            }
          </p>

          {/* Recording Timer */}
          {isRecording && (
            <span className="mt-3 px-3.5 py-1 bg-red-50 text-red-600 font-mono font-bold text-xs rounded-full border border-red-100">
              ⏺ {formatTime(voiceTimer)}
            </span>
          )}

          {/* Animated Waveform bars (visible while recording) */}
          {isRecording && (
            <div className="flex items-end gap-[3px] mt-4 h-8">
              {[0.4,0.7,1,0.85,0.6,1,0.75,0.5,0.9,0.65,1,0.8,0.45,0.7,0.95].map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-red-500 opacity-80"
                  style={{
                    height: `${h * 28}px`,
                    animation: `waveBar 0.${6 + (i % 5)}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.06}s`,
                  }}
                />
              ))}
              <style>{`
                @keyframes waveBar {
                  from { transform: scaleY(0.2); opacity: 0.4; }
                  to   { transform: scaleY(1);   opacity: 1;   }
                }
              `}</style>
            </div>
          )}

          {/* Live interim transcript */}
          {interimText && (
            <div className="mt-4 w-full max-w-sm px-4 py-2.5 bg-white/80 border border-theme-200/40 rounded-xl text-left animate-pulse">
              <span className="text-[10px] font-black text-theme-600 uppercase tracking-wider block mb-0.5">🎤 Hearing…</span>
              <p className="text-sm text-dark-700 font-medium leading-snug italic">{interimText}</p>
            </div>
          )}

          {/* Translation / Auto-fill result panel */}
          {voiceFilled && !isRecording && (
            <div className="mt-4 w-full max-w-md bg-emerald-50 border border-emerald-200/60 rounded-2xl p-4 text-left space-y-2 animate-float-in">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">🤖 AI Auto-Fill Result</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex gap-2 text-xs">
                  <span className="font-bold text-dark-600 w-20 shrink-0">Spoken:</span>
                  <span className="text-dark-700 italic line-clamp-2">{voiceOriginal}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="font-bold text-dark-600 w-20 shrink-0">Detected:</span>
                  <span className="text-emerald-700 font-bold">{voiceDetectedCategory}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="font-bold text-dark-600 w-20 shrink-0">Filled:</span>
                  <span className="text-theme-700 font-semibold">Category · Title · Description</span>
                </div>
              </div>
            </div>
          )}

          {/* Floating voice success toast */}
          {voiceToastVisible && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-float-in">
              <Check className="h-4 w-4" />
              <span>Voice report filled! Review and submit.</span>
            </div>
          )}

          {/* Floating AI analysis success toast */}
          {aiToastVisible && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-violet-600 text-white text-xs font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-float-in" style={{ zIndex: 51 }}>
              <Sparkles className="h-4 w-4" />
              <span>🤖 AI auto-filled category &amp; description!</span>
            </div>
          )}
        </div>

        {/* Regular Input Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-dark-600 uppercase tracking-widest mb-2">
                {t("mainCategory")}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-theme-200/40 rounded-xl text-sm bg-white/80 focus:bg-white transition-all duration-200 cursor-pointer"
              >
                <option value="road">Road & Potholes</option>
                <option value="garbage">Garbage & Sanitation</option>
                <option value="water">Water leakage & Supply</option>
                <option value="electricity">Electricity Outage</option>
                <option value="streetlight">Broken Street Light</option>
                <option value="public-safety">Public Safety Emergency</option>
                <option value="parks">Parks & Forestry</option>
                <option value="drainage">Open Drainage</option>
                <option value="noise">Noise Pollution</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-dark-600 uppercase tracking-widest mb-2">
              {t("detailedDescription")}
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What seems to be the problem? Include Landmark reference guides..."
              className="w-full p-4 border border-theme-200/40 rounded-xl text-sm bg-white/80 focus:bg-white transition-all duration-200"
            />
          </div>

          {/* Mobile Verification Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-theme-50/20 p-6 rounded-2xl border border-theme-100/10">
            <div>
              <label className="block text-xs font-bold text-dark-600 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-theme-600" />
                  {t("phoneNumber") || "Reporter Mobile Number *"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSmsSettings(true)}
                  className="text-theme-650 hover:text-theme-750 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider cursor-pointer hover:underline"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Config Gateway</span>
                </button>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-sm text-dark-550 font-black">+91</span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder={t("phonePlaceholder") || "Enter 10-digit mobile number"}
                  className="w-full pl-14 pr-4 py-3 border border-theme-200/40 rounded-xl text-sm bg-white/80 focus:bg-white transition-all duration-200 font-semibold text-dark-750"
                />
              </div>
            </div>
            <div className="flex items-center text-xs text-dark-500/80 font-medium leading-relaxed">
              <span>
                <strong>Note:</strong> A 4-digit verification code (OTP) will be generated to verify this ticket reporting.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GPS Simulation */}
            <div>
              <label className="block text-xs font-bold text-dark-600 uppercase tracking-widest mb-2">
                {t("geoCoords")}
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  onFocus={() => setShowMap(true)}
                  placeholder="Address or click Auto GPS"
                  className="flex-1 px-4 py-3 border border-theme-200/40 rounded-xl text-sm bg-white/80 focus:bg-white transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={handleDeviceGPS}
                  disabled={gpsLoading}
                  className="px-4 py-2.5 bg-theme-50 border border-theme-200 text-theme-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:bg-theme-100 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait shrink-0"
                >
                  {gpsLoading ? (
                    <div className="w-4 h-4 border-2 border-theme-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MapPin className="h-4.5 w-4.5 shrink-0 text-theme-600" />
                  )}
                  <span>{gpsLoading ? "Locating…" : "Auto GPS"}</span>
                </button>
              </div>
              {coords && (
                <span className="text-[10px] text-dark-500/60 font-mono mt-1.5 block">
                  📍 {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </span>
              )}
              {/* OpenStreetMap embed — no API key, shows real coordinates */}
              {showMap && coords && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-theme-200/40 shadow-inner animate-fade-in">
                  <iframe
                    key={`${coords.lat}-${coords.lng}`}
                    title="Location Map"
                    width="100%"
                    height="220"
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.015},${coords.lat - 0.01},${coords.lng + 0.015},${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lng}`}
                    className="w-full"
                    style={{ border: 0 }}
                    allowFullScreen
                  />
                  <div className="flex items-center justify-between px-3 py-1.5 bg-theme-50/60 border-t border-theme-100/30">
                    <span className="text-[9px] font-mono text-dark-500">
                      📍 {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                    </span>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=15/${coords.lat}/${coords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-theme-600 hover:underline"
                    >
                      Open in OSM ↗
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Media Upload — Photo + Video */}
            <div>
              <label className="block text-xs font-bold text-dark-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span>Attach Photo / Video Evidence</span>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[9px] font-black normal-case tracking-normal border border-violet-200/60">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI Auto-Fill
                </span>
              </label>

              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              <input
                type="file"
                ref={videoInputRef}
                className="hidden"
                accept="video/*"
                multiple
                onChange={handleVideoFileChange}
              />

              {/* Two-button row */}
              <div className="grid grid-cols-2 gap-2">
                {/* Photo button */}
                <button
                  type="button"
                  onClick={handleImagePicker}
                  className="py-3 px-3 border border-dashed border-theme-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-dark-550 hover:bg-theme-50/40 transition-colors cursor-pointer group"
                >
                  <Camera className="h-4 w-4 text-theme-600 group-hover:scale-110 transition-transform" />
                  <span>📷 Photo</span>
                </button>

                {/* Video button */}
                <button
                  type="button"
                  onClick={handleVideoPicker}
                  className="py-3 px-3 border border-dashed border-red-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-dark-550 hover:bg-red-50/30 transition-colors cursor-pointer group"
                >
                  <Video className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" />
                  <span>🎬 Video</span>
                </button>
              </div>

              {/* Upload from device shortcuts */}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 text-[10px] font-bold text-theme-600 hover:text-theme-700 py-1.5 bg-theme-50/40 hover:bg-theme-100/50 rounded-lg transition-colors cursor-pointer border border-theme-200/30"
                >
                  + Upload Image File
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex-1 text-[10px] font-bold text-red-500 hover:text-red-600 py-1.5 bg-red-50/30 hover:bg-red-100/40 rounded-lg transition-colors cursor-pointer border border-red-200/30"
                >
                  + Upload Video File
                </button>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="mt-3 space-y-1.5 animate-float-in">
                  <span className="text-[10px] font-black text-dark-500 uppercase tracking-wider">
                    📷 {images.length} Photo{images.length > 1 ? "s" : ""}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {images.map((src, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-theme-200 bg-theme-50/20 flex-shrink-0">
                        <img src={src} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-dark-900/70 rounded-full text-white hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Previews */}
              {videos.length > 0 && (
                <div className="mt-3 space-y-2 animate-float-in">
                  <span className="text-[10px] font-black text-dark-500 uppercase tracking-wider">
                    🎬 {videos.length} Video{videos.length > 1 ? "s" : ""}
                  </span>
                  {videos.map((v, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-red-200/50 bg-black/5">
                      <video
                        src={v.url}
                        controls
                        className="w-full rounded-xl max-h-36 object-contain bg-black"
                      />
                      <div className="flex items-center justify-between px-2 py-1 bg-dark-50/20">
                        <span className="text-[9px] font-semibold text-dark-500 truncate max-w-[70%]">{v.name}</span>
                        <button
                          type="button"
                          onClick={() => setVideos((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── AI Analysis Result Panel ─────────────────────────────── */}
              {aiAnalysing && (
                <div className="mt-4 rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-violet-600 animate-spin" style={{ animationDuration: "2s" }} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-violet-700 uppercase tracking-wider">
                        🤖 AI Analysing {aiSource === "video" ? "Video" : "Photo"}…
                      </p>
                      <p className="text-[10px] text-violet-500/80 font-medium mt-0.5">
                        Detecting civic issue type &amp; generating description
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    {[40, 65, 90, 55, 75].map((w, i) => (
                      <div
                        key={i}
                        className="h-1.5 rounded-full bg-violet-300/60"
                        style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!aiAnalysing && aiResult && !aiResult.lowConfidence && (
                <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 animate-float-in">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-700 uppercase tracking-wider">🤖 AI Auto-Filled Form</p>
                        <p className="text-[10px] text-emerald-500/80 font-medium">
                          {aiResult.confidence}% confidence · detected from {aiSource}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiResult(null)}
                      className="text-dark-400 hover:text-dark-600 transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-widest font-black text-dark-500 w-20 shrink-0">Category</span>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold capitalize">
                        ✓ {aiResult.category.replace(/-/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] uppercase tracking-widest font-black text-dark-500 w-20 shrink-0 pt-0.5">Title</span>
                      <span className="text-xs text-dark-700 font-semibold leading-snug">{aiResult.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-widest font-black text-dark-500 w-20 shrink-0">Priority</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        aiResult.priority === "critical" ? "bg-red-100 text-red-700" :
                        aiResult.priority === "high"     ? "bg-orange-100 text-orange-700" :
                        aiResult.priority === "medium"   ? "bg-yellow-100 text-yellow-700" :
                                                           "bg-green-100 text-green-700"
                      }`}>{aiResult.priority}</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-200/50">
                      <p className="text-[10px] font-black text-emerald-600 mb-1">📝 Description filled:</p>
                      <p className="text-[10px] text-dark-600 leading-relaxed font-medium line-clamp-3">{aiResult.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {!aiAnalysing && aiResult && aiResult.lowConfidence && (
                <div className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50 p-3 animate-float-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Low Confidence Detection</p>
                      <p className="text-[10px] text-amber-600/80 font-medium">
                        Detected: <strong>{aiResult.category}</strong> ({aiResult.confidence}% confidence) — please verify manually.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!aiAnalysing && aiError && (
                <div className="mt-4 rounded-2xl border border-red-200/50 bg-red-50 p-3 animate-float-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-[10px] font-semibold text-red-600">
                      AI analysis unavailable — please fill category &amp; description manually.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Priority + Emergency Switcher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-theme-50/30 p-6 rounded-2xl border border-theme-100/20 items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-dark-650 uppercase tracking-widest mb-2">
                {t("generalPriority")}
              </label>
              <div className="flex space-x-2">
                {["low", "medium", "high", "critical"].map((prio) => (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => setPriority(prio)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                      priority === prio
                        ? "bg-dark-800 border-dark-900 text-white shadow-sm"
                        : "bg-white border-theme-200/50 text-dark-600 hover:bg-theme-50/50"
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3.5 md:justify-end">
              <label className="flex items-center select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="h-5 w-5 text-red-600 focus:ring-red-500 border-theme-200 rounded cursor-pointer shrink-0 accent-red-600"
                />
                <span className="ml-2.5">
                  <span className="text-xs font-bold text-red-700 block uppercase tracking-wider">
                    {t("criticalEmergency")}
                  </span>
                  <span className="text-[10px] text-dark-500/50 block font-semibold leading-tight">
                    {t("emergencyDesc")}
                  </span>
                </span>
              </label>
              <ShieldAlert className={`h-8 w-8 text-red-600 animate-pulse ${isEmergency ? "opacity-100" : "opacity-30"}`} />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="btn-theme px-6 py-3 text-sm font-bold flex items-center space-x-2 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Check className="h-4.5 w-4.5" />
              <span>{t("submitTicket")}</span>
            </button>
          </div>
        </form>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-theme-200/50 animate-float-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-theme-500 to-theme-600 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <KeyRound className="h-5.5 w-5.5 text-white" />
                <h3 className="font-black text-sm tracking-wider uppercase">
                  {t("otpVerification") || "OTP Verification"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="p-1 px-[5.5px] rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-dark-700 text-center leading-relaxed">
                  {t("otpSentTo", { phone: phoneNumber }) || `We have sent a verification code to +91 ${phoneNumber}`}
                </p>
                <p className="text-xs text-dark-500 font-medium">
                  {t("enterOtp") || "Enter 6-digit OTP sent via SMS"}
                </p>
              </div>

              {smsStatusMessage && (
                <div className={`text-center text-xs font-bold py-2 px-3 rounded-xl border ${
                  smsStatusType === "success" 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                    : smsStatusType === "error" 
                      ? "bg-amber-50 border-amber-100 text-amber-850" 
                      : "bg-theme-50/50 border-theme-100/30 text-theme-850 animate-pulse"
                }`}>
                  {smsStatusMessage}
                </div>
              )}

              {/* Segmented 4-Digit Inputs */}
              <div className="flex justify-center items-center gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    className="w-14 h-14 text-center text-2xl font-extrabold border border-theme-200 rounded-2xl bg-theme-50/10 focus:bg-white focus:ring-2 focus:ring-theme-400 focus:outline-none transition-all text-dark-850"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Error Message */}
              {otpError && (
                <div className="text-center text-xs font-bold text-red-650 bg-red-50 py-2 rounded-xl border border-red-100">
                  {otpError}
                </div>
              )}

              {/* Resend / Timer */}
              <div className="text-center flex justify-center items-center gap-1.5 text-xs text-dark-500 font-semibold">
                {otpTimer > 0 ? (
                  <span>
                    {t("resendIn", { time: otpTimer }) || `Resend code in ${otpTimer}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-theme-600 hover:text-theme-700 font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{t("resendCode") || "Resend Code"}</span>
                  </button>
                )}
              </div>


              {/* Actions */}
              <button
                type="button"
                onClick={handleOtpVerify}
                className="w-full bg-gradient-to-r from-theme-500 to-theme-600 hover:from-theme-600 hover:to-theme-700 text-white font-black text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-theme-500/25 flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
              >
                <span>{t("verifySubmit") || "Verify & Submit"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <SmsSettingsModal isOpen={showSmsSettings} onClose={() => setShowSmsSettings(false)} />

      {/* ── Live Camera Modal (Photo + Video Tabs) ── */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-dark-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl overflow-hidden max-w-lg w-full border border-theme-200/30 flex flex-col relative animate-float-in shadow-2xl">

            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-dark-100/10">
              <div className="flex items-center space-x-2">
                {cameraModalTab === "photo"
                  ? <Camera className="h-5 w-5 text-theme-500 animate-pulse" />
                  : <Film className="h-5 w-5 text-red-500 animate-pulse" />
                }
                <span className="font-bold text-sm tracking-tight text-white font-sans">
                  {cameraModalTab === "photo" ? "Capture Photo Evidence" : "Record Video Evidence"}
                </span>
              </div>
              <button
                onClick={() => {
                  if (isVideoRecording) stopVideoRecording();
                  stopCamera();
                  setShowCameraModal(false);
                  setIsVideoRecording(false);
                  setVideoRecordingTime(0);
                }}
                className="p-1 text-dark-400 hover:text-dark-200 rounded-full hover:bg-dark-50/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Photo / Video Tab Switcher */}
            <div className="flex border-b border-dark-100/10">
              <button
                type="button"
                onClick={() => { setCameraModalTab("photo"); }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-0 ${
                  cameraModalTab === "photo"
                    ? "bg-theme-500/20 text-theme-300 border-b-2 border-theme-400"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <Camera className="h-3.5 w-3.5" /> Photo
              </button>
              <button
                type="button"
                onClick={() => { setCameraModalTab("video"); }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-0 ${
                  cameraModalTab === "video"
                    ? "bg-red-500/20 text-red-300 border-b-2 border-red-400"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <Video className="h-3.5 w-3.5" /> Video
              </button>
            </div>

            {/* Live Camera Feed */}
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Camera loading spinner */}
              {!cameraStream && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 space-y-2">
                  <div className="w-8 h-8 border-4 border-theme-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold">Initializing camera stream...</span>
                </div>
              )}
              {/* Camera unavailable — show upload buttons right here */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 px-8 text-center bg-black/90">
                  <div className="text-5xl">📷</div>
                  <div>
                    <p className="text-sm font-black text-white mb-1">Camera Not Accessible</p>
                    <p className="text-[11px] text-white/50 leading-relaxed">
                      Permission denied or camera is in use by another app.
                    </p>
                  </div>
                  {/* Upload buttons inline */}
                  <div className="flex flex-col w-full gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setShowCameraModal(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full py-3 bg-theme-500 hover:bg-theme-600 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border-0 shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
                      Upload Photo from Device
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setShowCameraModal(false);
                        videoInputRef.current?.click();
                      }}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border-0 shadow-lg"
                    >
                      <Video className="h-4 w-4" />
                      Upload Video from Device
                    </button>
                  </div>
                </div>
              )}
              {/* Recording indicator overlay */}
              {isVideoRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 text-white text-xs font-black px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                  REC {Math.floor(videoRecordingTime / 60)}:{String(videoRecordingTime % 60).padStart(2, "0")}
                </div>
              )}
            </div>

            {/* Actions — hidden when camera is unavailable (buttons are shown inline above) */}
            {!cameraError && (
            <div className="p-5 flex flex-col gap-3 font-sans">
              {cameraModalTab === "photo" ? (
                /* ─ Photo Actions ─ */
                <>
                  <button
                    type="button"
                    onClick={handleCapture}
                    disabled={!cameraStream}
                    className="w-full py-3.5 bg-theme-500 hover:bg-theme-600 text-white font-bold rounded-full text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer border-0"
                  >
                    <Camera className="h-4.5 w-4.5" />
                    Capture Evidence Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setShowCameraModal(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full py-2.5 bg-dark-800 hover:bg-dark-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer text-center border-0"
                  >
                    📁 Upload Image from Device Instead
                  </button>
                </>
              ) : (
                /* ─ Video Actions ─ */
                <>
                  {!isVideoRecording ? (
                    <button
                      type="button"
                      onClick={startVideoRecording}
                      disabled={!cameraStream}
                      className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-red-900/30 hover:shadow-lg disabled:opacity-50 cursor-pointer border-0"
                    >
                      <Video className="h-4.5 w-4.5" />
                      Start Video Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVideoRecording}
                      className="w-full py-3.5 bg-dark-800 hover:bg-dark-700 text-white font-bold rounded-full text-sm transition-all flex items-center justify-center gap-2 shadow-md animate-pulse cursor-pointer border-0"
                    >
                      <span className="w-3 h-3 bg-red-500 rounded-sm" />
                      Stop &amp; Save Recording ({Math.floor(videoRecordingTime / 60)}:{String(videoRecordingTime % 60).padStart(2, "0")})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setShowCameraModal(false);
                      videoInputRef.current?.click();
                    }}
                    className="w-full py-2.5 bg-dark-800 hover:bg-dark-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer text-center border-0"
                  >
                    📁 Upload Video from Device Instead
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  if (isVideoRecording) stopVideoRecording();
                  stopCamera();
                  setShowCameraModal(false);
                  setIsVideoRecording(false);
                  setVideoRecordingTime(0);
                }}
                className="w-full py-2 text-white/40 hover:text-white/70 font-semibold rounded-xl text-xs transition-colors cursor-pointer text-center border-0 bg-transparent"
              >
                Cancel
              </button>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
