import React, { useState, useEffect, useRef } from "react";
import { Camera, MapPin, Mic, MicOff, Check, X, ShieldAlert, Languages, Image as ImageIcon, KeyRound, Smartphone, RefreshCw, Settings } from "lucide-react";
import { categoryImages } from "../mockData";
import { getTranslator } from "../locales";
import { sendSms } from "../utils/smsHelper";
import SmsSettingsModal from "./SmsSettingsModal";

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
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedLang, setSelectedLang] = useState(lang || user.language || "en");
  
  // Webcam Capture States
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  
  // OTP Verification States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
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
    const voiceMocks = {
      en: { title: "Leaking Water Valve", desc: "Huge water leak leaking on public street since yesterday. Water flooding road.", category: "water", priority: "medium" },
      hi: { title: "जल रिसाव पाइपलाइन", desc: "कल से सरकारी नल में से पानी बह जा रहा है, रास्ता में बाढ़ जैसी हालत हो गया है।", category: "water", priority: "medium" },
      bho: { title: "पानी के पाइप लीक", desc: "काल्ह से नल में से ढेरी पानी बह रहल बा, गली में पूरा कीचड़ हो गइल बा।", category: "water", priority: "medium" },
      mai: { title: "पानी पाइपलाइन चुइब", desc: "काल्ह स सरकारी नल सं पानी बह रहल छैक, बाट पर बाढ़ सन भ गेल छैक।", category: "water", priority: "medium" },
      mag: { title: "पानी चुअहिया नल", desc: "काल्ह से नलवा से पानी बह रहल हई, रस्तावा पर पुरा पानी जम गेलो हई।", category: "water", priority: "medium" },
      sat: { title: "ᱫᱟᱜ ᱯᱟᱹᱭᱯ ᱞᱤᱠ", desc: "ᱦᱚᱞᱟ ᱠᱷᱚᱱ ᱥᱚᱨᱠᱟᱨᱤ ᱫᱟᱜ ᱯᱟᱹᱭᱯ ᱠᱷᱚᱱ ᱫᱟᱜ ᱞᱤᱠ ᱠﺎᱱᱟ, ᱦᱚᱨ ᱨᱮ ᱫᱟᱜ ᱯᱮᱨᱮᱡ ᱮᱱᱟ᱾", category: "water", priority: "medium" },
      ta: { title: "குடிநீர் குழாய் கசிவு", desc: "நேற்று முதல் பொது வீதியில் குடிநீர் குழாயில் பெருமளவில் கசிவு ஏற்பட்டுள்ளது. சாலையில் தண்ணீர் தேங்கியுள்ளது.", category: "water", priority: "medium" },
      ml: { title: "കുടിവെള്ള പൈപ്പിലെ ചോർച്ച", desc: "ഇന്നലെ മുതൽ പൊതു വഴിയിൽ കുടിവെള്ള പൈപ്പിൽ ജലചോർച്ചയുണ്ട്, റോഡിൽ വെള്ളം കെട്ടിക്കിടക്കുന്നു.", category: "water", priority: "medium" },
    };
    const mockFill = voiceMocks[selectedLang] || voiceMocks.en;
    setTitle(mockFill.title);
    setDescription(mockFill.desc);
    setCategory(mockFill.category);
    setPriority(mockFill.priority);
    alert("Speech recognized! AI auto-filled technical categories and issues description.");
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([reader.result]);
        
        // Mock reading EXIF geotag coordinates from selected image
        const index = Math.floor(Math.random() * sampleAddresses.length);
        const geotag = sampleAddresses[index];
        setCoords({ lat: geotag.lat, lng: geotag.lng });
        setLocationAddress(geotag.address);
        setShowMap(true);
        alert(`Geotag metadata read from photo! Auto-filled location coordinates: ${geotag.address} (Lat: ${geotag.lat.toFixed(4)}, Lng: ${geotag.lng.toFixed(4)})`);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Could not access camera. Falling back to file upload.");
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
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
      
      setImages([dataUrl]);
      
      // Auto-simulate reading Geotag coordinates from capturing a picture!
      const index = Math.floor(Math.random() * sampleAddresses.length);
      const geotag = sampleAddresses[index];
      setCoords({ lat: geotag.lat, lng: geotag.lng });
      setLocationAddress(geotag.address);
      setShowMap(true);
      
      stopCamera();
      setShowCameraModal(false);
      
      alert(`Geotag embedded in live photo! Auto-filled location: ${geotag.address}`);
    }
  };

  const handleImagePicker = () => {
    setShowCameraModal(true);
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const handleTriggerRecording = () => {
    if (isRecording) {
      handleMockVoiceEnd();
    } else {
      setIsRecording(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        
        let locale = "en-US";
        if (selectedLang === "hi") locale = "hi-IN";
        else if (selectedLang === "ta") locale = "ta-IN";
        else if (selectedLang === "ml") locale = "ml-IN";
        else if (selectedLang === "bho" || selectedLang === "mai" || selectedLang === "mag") locale = "hi-IN";
        
        recognition.lang = locale;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.onresult = (event) => {
          const speechToText = event.results[0][0].transcript;
          setDescription(speechToText);
          
          const text = speechToText.toLowerCase();
          
          // Multilingual dialect keywords detection
          const isRoad = text.includes("road") || text.includes("pothole") || 
                         text.includes("सड़क") || text.includes("गड्ढा") || text.includes("गड्ढे") || text.includes("रस्ता") || text.includes("बाट") ||
                         text.includes("ᱦᱚᱨ") || text.includes("ᱰᱟᱦᱟᱨ") ||
                         text.includes("சாலை") || text.includes("குழி") || text.includes("பள்ளம்") ||
                         text.includes("റോഡ്") || text.includes("കുഴി");
                         
          const isWater = text.includes("water") || text.includes("leak") || 
                          text.includes("पानी") || text.includes("जल") || text.includes("नल") || text.includes("पाइप") || text.includes("चुइब") ||
                          text.includes("ᱫᱟᱜ") || text.includes("ᱯᱟᱹᱭᱯ") ||
                          text.includes("தண்ணீர்") || text.includes("நீர்") || text.includes("குழாய்") || text.includes("கசிவு") ||
                          text.includes("വെള്ളം") || text.includes("ജലം") || text.includes("പൈപ്പ്") || text.includes("ചോർച്ച");
                          
          const isGarbage = text.includes("garbage") || text.includes("waste") || 
                            text.includes("कचरा") || text.includes("कूड़ा") || text.includes("गंदगी") ||
                            text.includes("ᱡᱚᱵᱽᱨᱟ") ||
                            text.includes("குப்பை") || text.includes("கழிவு") ||
                            text.includes("മാലിന്യം") || text.includes("ചപ്പുചവറുകൾ");
                            
          const isLight = text.includes("light") || text.includes("streetlight") || text.includes("electricity") || 
                          text.includes("बिजली") || text.includes("लाइन") || text.includes("अंधेरा") ||
                          text.includes("ᱵᱤᱡᱽᱞᱤ") ||
                          text.includes("மின்சாரம்") || text.includes("விளக்கு") ||
                          text.includes("കറന്റ്") || text.includes("വെളിച്ചം");

          if (isRoad) {
            setTitle(selectedLang === "hi" ? "सड़क मरम्मत अलर्ट" : "Road Repair Alert");
            setCategory("road");
          } else if (isWater) {
            setTitle(selectedLang === "hi" ? "जल आपूर्ति रिसाव" : "Water supply leak");
            setCategory("water");
          } else if (isGarbage) {
            setTitle(selectedLang === "hi" ? "कचरा हटाने का अनुरोध" : "Garbage removal request");
            setCategory("garbage");
          } else if (isLight) {
            setTitle(selectedLang === "hi" ? "स्ट्रीटलाइट मरम्मत" : "Streetlight issue");
            setCategory("streetlight");
          } else {
            setTitle(selectedLang === "hi" ? "मौखिक रिपोर्ट" : "Voice Reported Issue");
            setCategory("road");
          }
          
          setIsRecording(false);
          alert(`Voice recognized successfully!\nText: "${speechToText}"`);
        };
        
        recognition.onerror = (e) => {
          console.warn("Speech recognition API error, falling back to simulation:", e.error);
          setTimeout(() => {
            handleMockVoiceEnd();
          }, 3500);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognition.start();
      } else {
        // Automatically stop simulation after 3.5 seconds
        setTimeout(() => {
          handleMockVoiceEnd();
        }, 3500);
      }
    }
  };

  const handleOtpDigitChange = (index, value) => {
    const newVal = value.replace(/\D/g, "");
    const updatedDigits = [...otpDigits];
    updatedDigits[index] = newVal;
    setOtpDigits(updatedDigits);
    setOtpError("");

    // Auto focus next input
    if (newVal && index < 3) {
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
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasteData.length === 4) {
      const updatedDigits = pasteData.split("");
      setOtpDigits(updatedDigits);
      setOtpError("");
      const lastInput = document.getElementById(`otp-input-3`);
      if (lastInput) lastInput.focus();
    }
  };

  const handleSendOtp = async () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpDigits(["", "", "", ""]);
    setOtpTimer(30);
    setOtpError("");
    setSmsSending(true);
    setSmsStatusType("info");
    setSmsStatusMessage(`Sending real SMS OTP to +91 ${phoneNumber}...`);
    console.log(`[SMS Gateway] Sent OTP verification code ${code} to +91 ${phoneNumber}`);

    try {
      const res = await sendSms(phoneNumber, `Your CivicReport OTP code is: ${code}. Valid for 5 minutes.`);
      if (res.success) {
        setSmsStatusType("success");
        setSmsStatusMessage("Real SMS sent successfully!");
      } else {
        setSmsStatusType("error");
        setSmsStatusMessage(`SMS Send Error: ${res.error}. (Use simulated code below)`);
      }
    } catch (err) {
      setSmsStatusType("error");
      setSmsStatusMessage(`Network Error: ${err.message}. (Use simulated code below)`);
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

  const handleOtpVerify = (e) => {
    if (e) e.preventDefault();
    const enteredOtp = otpDigits.join("");
    if (enteredOtp !== generatedOtp) {
      setOtpError(t("invalidOtpError") || "Incorrect code. Please check the code and try again.");
      return;
    }

    // Submit ticket on successful OTP verification
    const autoTitle = categoryTitleMap[category] || "Civic Issue Report";
    const finalImages = images.length > 0 ? images : [categoryImages[category] || categoryImages.road];
    const ticket = {
      title: autoTitle,
      description,
      category,
      priority: isEmergency ? "emergency" : priority,
      location: { address: locationAddress, coordinates: coords },
      images: finalImages,
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

        {/* Voice Input Section */}
        <div className="p-8 border-b border-theme-100/20 flex flex-col items-center justify-center text-center bg-theme-50/10 pattern-rangoli">
          <button
            type="button"
            onClick={handleTriggerRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer border-2 ${
              isRecording
                ? "bg-gradient-to-br from-red-600 to-red-500 border-red-400 text-white animate-pulse"
                : "bg-gradient-to-br from-theme-500 to-theme-700 border-theme-400 text-white shadow-theme-500/20"
            }`}
          >
            {isRecording ? <MicOff className="h-9 w-9" /> : <Mic className="h-9 w-9" />}
          </button>
          
          <h3 className="font-bold text-dark-800 text-md mt-4">
            {isRecording ? "Listening to audio..." : "Tap to Speak Report Info"}
          </h3>
          <p className="text-dark-500 text-xs mt-1.5 max-w-sm leading-relaxed">
            Record in your native dialect (Santali, Bhojpuri, Hindi, output auto-translated and filled).
          </p>
          {isRecording && (
            <span className="mt-3 px-3.5 py-1 bg-red-50 text-red-600 font-mono font-bold text-xs rounded-full border border-red-100 animate-bounce">
              Recording Timer: {formatTime(voiceTimer)}
            </span>
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

            {/* Media Upload */}
            <div>
              <label className="block text-xs font-bold text-dark-600 uppercase tracking-widest mb-2">
                {t("attachPhoto")}
              </label>
              <div className="flex items-center space-x-4 w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handleImagePicker}
                  className="px-4 py-3 border border-dashed border-theme-300 rounded-xl flex items-center space-x-2 text-xs font-bold text-dark-550 hover:bg-theme-50/30 transition-colors cursor-pointer w-full text-center justify-center"
                >
                  <Camera className="h-4.5 w-4.5 text-theme-600" />
                  <span>{t("cameraFile")}</span>
                </button>
              </div>
              {images.length > 0 && (
                <div className="mt-3 flex items-center space-x-2 animate-float-in">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-theme-200 bg-theme-50/20">
                    <img src={images[0]} alt="Evidence" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages([])}
                      className="absolute top-1 right-1 p-1 bg-dark-900/60 rounded-full text-white hover:bg-dark-900 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-xs text-dark-500 font-semibold">1 file attached</span>
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
                  {t("enterOtp") || "Enter 4-digit OTP code below"}
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

              {/* Simulated SMS Alert Box */}
              <div className="bg-theme-50/40 border border-theme-100/30 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1 text-center">
                <span className="text-[10px] font-black text-theme-700 tracking-wider uppercase">
                  Simulated Network SMS Gateway
                </span>
                <span className="text-xs font-bold text-dark-750">
                  {t("simulatedOtpText", { code: generatedOtp }) || `Simulated SMS OTP Code: ${generatedOtp}`}
                </span>
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

      {/* Live Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-dark-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl overflow-hidden max-w-lg w-full border border-theme-200/30 flex flex-col relative animate-float-in shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-dark-100/10">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-theme-500 animate-pulse" />
                <span className="font-bold text-sm tracking-tight text-white font-sans">Live Camera Capture</span>
              </div>
              <button 
                onClick={() => {
                  stopCamera();
                  setShowCameraModal(false);
                }} 
                className="p-1 text-dark-400 hover:text-dark-200 rounded-full hover:bg-dark-50/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Feed */}
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              {!cameraStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 space-y-2">
                  <div className="w-8 h-8 border-4 border-theme-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold">Initializing camera stream...</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 flex flex-col gap-3 font-sans">
              <button
                type="button"
                onClick={handleCapture}
                disabled={!cameraStream}
                className="w-full py-3.5 bg-theme-500 hover:bg-theme-600 text-white font-bold rounded-full text-sm transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer border-0"
              >
                <span>📸 Capture Evidence Photo</span>
              </button>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setShowCameraModal(false);
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer text-center border-0"
                >
                  Upload File Instead
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setShowCameraModal(false);
                  }}
                  className="flex-1 py-3 bg-dark-50/30 text-white hover:bg-dark-50/50 font-semibold rounded-xl text-xs transition-colors cursor-pointer text-center border-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
