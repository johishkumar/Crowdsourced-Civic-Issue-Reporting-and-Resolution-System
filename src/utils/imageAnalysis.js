/**
 * imageAnalysis.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses Google Gemini 1.5 Flash to classify civic issues from uploaded images
 * or video thumbnails and auto-fill form fields.
 *
 * Falls back to canvas-based visual analysis when no API key is configured.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/** Categories the form supports */
const CATEGORIES = [
  "road", "garbage", "water", "electricity",
  "streetlight", "public-safety", "parks", "drainage", "noise",
];

/**
 * Detailed system prompt — gives Gemini explicit examples of what to look for.
 */
const SYSTEM_PROMPT = `
You are an expert civic-issue classifier for a citizen reporting portal in Jharkhand, India.
Carefully examine every detail of the provided image (or video frame) and return ONLY a JSON
object — no markdown, no prose, no code fences — with exactly these keys:

{
  "category": "<road|garbage|water|electricity|streetlight|public-safety|parks|drainage|noise>",
  "title": "<a specific, concrete 4-8 word English title describing the exact visible problem>",
  "description": "<3-4 sentences describing what you actually see: exact damage, location context, visible severity, and recommended action for the government department>",
  "priority": "<low|medium|high|critical>",
  "confidence": <integer 0-100 reflecting how certain you are this shows a real civic problem>
}

Category guidance:
- road        → potholes, cracked pavement, road cave-in, broken road divider, missing manholes
- garbage     → open trash dumps, overflowing bins, litter on streets, illegal dumping, rotting waste
- water       → pipe leaks, burst mains, waterlogging, flooding, stagnant water, dry taps
- electricity → broken poles, dangling wires, transformer damage, no power lines
- streetlight → non-functional lamp posts, broken lights, dark stretches at night
- public-safety → accidents, fallen trees on roads, fire, gas leaks, structural collapse risk
- parks       → damaged benches, overgrown grass, broken swings, fallen trees in parks
- drainage    → open/clogged drains, sewage overflow, stinking channels
- noise       → construction noise evidence (rarely visible), fireworks evidence

Priority guidance:
- critical → immediate safety risk (live wires, structural collapse, fire)
- high     → significant inconvenience / health risk (large potholes, sewage overflow, major flooding)
- medium   → moderate problem (broken streetlight, illegal dumping, partial road crack)
- low      → minor cosmetic / quality-of-life issue (minor pothole, overgrown grass)

Rules:
- Be SPECIFIC in the title — "Large Pothole on Main Road" not "Road Issue"
- Be SPECIFIC in description — describe what you literally see
- If image is too blurry or does not show a civic problem → confidence < 40
- Match category STRICTLY to the list above
`.trim();

// ── Video Thumbnail Extraction ────────────────────────────────────────────────

/**
 * Seek a hidden video element to a specific time and resolve with a base64 JPEG.
 */
function captureFrameAtTime(videoEl, time) {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      videoEl.removeEventListener("seeked", onSeeked);
      videoEl.removeEventListener("error", onError);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoEl.videoWidth || 640;
        canvas.height = videoEl.videoHeight || 360;
        canvas.getContext("2d").drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.88).split(",")[1];
        resolve(base64);
      } catch (e) {
        reject(e);
      }
    };
    const onError = (e) => {
      videoEl.removeEventListener("seeked", onSeeked);
      videoEl.removeEventListener("error", onError);
      reject(e);
    };
    videoEl.addEventListener("seeked", onSeeked);
    videoEl.addEventListener("error", onError);
    videoEl.currentTime = time;
  });
}

/**
 * Extract up to 3 frames from a video at 25%, 50%, 75% of its duration.
 * Returns array of base64-JPEG strings.
 */
async function extractVideoFrames(objectUrl) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "metadata";
    video.src = objectUrl;

    const onMeta = async () => {
      video.removeEventListener("loadedmetadata", onMeta);
      const dur = video.duration || 3;
      const times = [0.25, 0.5, 0.75].map((f) => Math.min(f * dur, dur - 0.1));
      const frames = [];
      for (const t of times) {
        try {
          const b64 = await captureFrameAtTime(video, t);
          frames.push(b64);
        } catch {
          /* skip failed frame */
        }
      }
      // Revoke only after all captures done
      resolve(frames.length > 0 ? frames : null);
    };

    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("error", () => resolve(null));
    video.load();
  });
}

// ── Image / Other Source Conversion ──────────────────────────────────────────

/**
 * Convert a dataURL or object URL to { base64, mimeType }.
 */
async function toBase64Payload(src) {
  if (src.startsWith("data:")) {
    const [header, base64] = src.split(",");
    const mimeType = header.match(/data:(.*?);/)?.[1] || "image/jpeg";
    return { base64, mimeType };
  }
  const response = await fetch(src);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const [header, base64] = reader.result.split(",");
      const mimeType = header.match(/data:(.*?);/)?.[1] || "image/jpeg";
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ── Canvas-based Visual Heuristics Fallback ──────────────────────────────────

/**
 * Analyse a base64 JPEG using canvas pixel data (color/brightness distributions)
 * to make a best-guess civic category. No API key required.
 */
function visualHeuristicAnalysis(base64Frames) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const W = Math.min(img.width, 320);
      const H = Math.min(img.height, 180);
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, W, H);
      const pixels = ctx.getImageData(0, 0, W, H).data;

      let rSum = 0, gSum = 0, bSum = 0;
      let darkPx = 0, grayPx = 0, brownPx = 0, greenPx = 0,
          bluePx = 0, yellowPx = 0, redPx = 0;
      const total = W * H;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
        rSum += r; gSum += g; bSum += b;

        const brightness = (r + g + b) / 3;
        const saturation = Math.max(r, g, b) - Math.min(r, g, b);

        if (brightness < 60) darkPx++;
        if (saturation < 30 && brightness > 80 && brightness < 180) grayPx++;

        // Brown tones (road surface, dirt, mud)
        if (r > 100 && g > 60 && b < 80 && r > g && g > b) brownPx++;
        // Green tones (parks, grass, vegetation)
        if (g > r && g > b && g > 80 && saturation > 20) greenPx++;
        // Blue tones (water, sky)
        if (b > r && b > g && b > 80 && saturation > 20) bluePx++;
        // Yellow/orange (streetlights, warning signs)
        if (r > 180 && g > 140 && b < 80) yellowPx++;
        // Red tones (fire, emergency)
        if (r > 180 && g < 80 && b < 80) redPx++;
      }

      const avgR = rSum / total, avgG = gSum / total, avgB = bSum / total;
      const avgBrightness = (avgR + avgG + avgB) / 3;

      const darkRatio   = darkPx   / total;
      const grayRatio   = grayPx   / total;
      const brownRatio  = brownPx  / total;
      const greenRatio  = greenPx  / total;
      const blueRatio   = bluePx   / total;
      const yellowRatio = yellowPx / total;
      const redRatio    = redPx    / total;

      let category = "road";
      let title = "Civic Infrastructure Issue";
      let description = "";
      let priority = "medium";
      let confidence = 60;

      // Decision tree based on dominant colors & brightness
      if (redRatio > 0.04) {
        category = "public-safety";
        title = "Possible Fire or Safety Emergency";
        description = "The uploaded media shows significant red-toned elements which may indicate a fire or emergency situation on public premises. The public safety department should investigate immediately to ensure citizen welfare.";
        priority = "critical";
        confidence = 65;
      } else if (darkRatio > 0.55 && yellowRatio > 0.02) {
        category = "streetlight";
        title = "Street Light Malfunction at Night";
        description = "The video appears to have been recorded in very low-light conditions with isolated light sources, suggesting a street lighting malfunction in a public area. The electricity/street light department should inspect and repair the non-functional lamp posts to ensure pedestrian safety.";
        priority = "medium";
        confidence = 68;
      } else if (darkRatio > 0.5 && yellowRatio < 0.02) {
        category = "electricity";
        title = "Power Outage in Public Area";
        description = "The media was captured in extremely dark conditions suggesting a power outage or complete street lighting failure in a public area. Immediate attention from the electricity department is required to restore power and ensure public safety.";
        priority = "high";
        confidence = 63;
      } else if (blueRatio > 0.18 && avgBrightness < 100) {
        category = "water";
        title = "Waterlogging or Flooding Detected";
        description = "Blue-dominant tones in the uploaded media suggest significant water accumulation or flooding on a public road or open area. The water/drainage department should assess the situation and clear waterlogging to prevent further property damage and vehicle accidents.";
        priority = "high";
        confidence = 67;
      } else if (greenRatio > 0.25) {
        category = "parks";
        title = "Parks and Greenery Maintenance Required";
        description = "The image shows predominantly green vegetation, potentially indicating overgrowth, fallen branches, or park infrastructure damage in a public green space. The parks and forestry department should inspect and carry out necessary maintenance.";
        priority = "low";
        confidence = 62;
      } else if (grayRatio > 0.35 && brownRatio > 0.08) {
        category = "road";
        title = "Road Surface Damage Detected";
        description = "The uploaded media shows a road or pavement surface with mixed gray and brown tones, indicative of deteriorated tarmac, pothole formation, or road surface cracking. The roads department should conduct a site inspection and schedule repairs to prevent vehicle damage and accidents.";
        priority = "medium";
        confidence = 65;
      } else if (grayRatio > 0.30) {
        category = "road";
        title = "Damaged Road or Pavement";
        description = "Gray-dominant tones in the media suggest a road, pavement, or concrete surface that appears damaged or deteriorated. The public works department should inspect the area for potholes, cracks, or surface degradation and carry out necessary repairs.";
        priority = "medium";
        confidence = 62;
      } else if (brownRatio > 0.20) {
        category = "garbage";
        title = "Garbage or Waste Accumulation";
        description = "Brown and earthy tones dominate the uploaded media, which may indicate accumulated garbage, debris, or waste material in a public area. The sanitation department should arrange immediate collection and cleaning of the affected site.";
        priority = "medium";
        confidence = 61;
      } else {
        // Generic — show moderate confidence with context
        category = "road";
        title = "Civic Issue Reported";
        description = "A civic issue has been reported in this location. The uploaded media shows a public area that may require infrastructure inspection. Please review the evidence and assign the appropriate department for site verification and resolution.";
        priority = "medium";
        confidence = 52;
      }

      resolve({ category, title, description, priority, confidence });
    };

    img.onerror = () => {
      resolve({
        category: "road",
        title: "Civic Issue Reported",
        description: "A civic infrastructure issue has been reported at this location. Please assign the appropriate department for site inspection and resolution.",
        priority: "medium",
        confidence: 50,
      });
    };

    img.src = `data:image/jpeg;base64,${base64Frames[0]}`;
  });
}

// ── Gemini API Call ───────────────────────────────────────────────────────────

/**
 * Call Gemini with one or more image frames (for video, we send up to 3 frames).
 */
async function callGemini(frames) {
  // Build parts: system prompt + each frame
  const parts = [
    { text: SYSTEM_PROMPT },
    ...frames.map((b64) => ({
      inline_data: { mime_type: "image/jpeg", data: b64 },
    })),
  ];

  const body = {
    contents: [{ parts }],
    generationConfig: { temperature: 0.15, maxOutputTokens: 600 },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Gemini API error: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  // Strip any accidental markdown fences
  const clean = text.replace(/```json|```/gi, "").trim();
  const parsed = JSON.parse(clean);

  if (!CATEGORIES.includes(parsed.category)) {
    parsed.category = "road";
  }
  return parsed;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Analyse a single image (dataURL or objectURL) or a video objectURL.
 * Returns structured civic-issue data, or null if analysis completely fails.
 */
export async function analyseMedia(src, isVideo = false) {
  try {
    if (isVideo) {
      // Extract up to 3 frames from the video
      const frames = await extractVideoFrames(src);
      if (!frames || frames.length === 0) {
        console.warn("[imageAnalysis] Could not extract video frames.");
        return null;
      }

      if (GEMINI_API_KEY) {
        try {
          return await callGemini(frames);
        } catch (err) {
          console.error("[imageAnalysis] Gemini video call failed:", err);
          // Fall through to visual heuristic
        }
      }

      // Visual heuristic fallback using captured frames
      return await visualHeuristicAnalysis(frames);
    } else {
      // Image path
      const { base64 } = await toBase64Payload(src);

      if (GEMINI_API_KEY) {
        try {
          return await callGemini([base64]);
        } catch (err) {
          console.error("[imageAnalysis] Gemini image call failed:", err);
        }
      }

      // Visual heuristic fallback
      return await visualHeuristicAnalysis([base64]);
    }
  } catch (err) {
    console.error("[imageAnalysis] analyseMedia failed:", err);
    return null;
  }
}

/**
 * Extract a thumbnail dataURL from a video ObjectURL.
 * Uses the fixed seek-based approach.
 */
export async function extractVideoThumbnail(videoSrc) {
  try {
    const frames = await extractVideoFrames(videoSrc);
    if (frames && frames.length > 0) {
      return `data:image/jpeg;base64,${frames[0]}`;
    }
    return null;
  } catch {
    return null;
  }
}
