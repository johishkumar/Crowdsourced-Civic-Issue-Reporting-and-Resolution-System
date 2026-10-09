/**
 * imageAnalysis.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Analysis pipeline (in order of accuracy):
 *   1. Google Gemini Vision   — best accuracy, needs VITE_GEMINI_API_KEY
 *   2. HuggingFace BLIP       — real ML captioning, FREE, no API key needed
 *   3. Pixel Heuristic        — color-based offline fallback
 * ─────────────────────────────────────────────────────────────────────────────
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Accept both formats:
//   AIza...  — standard Google API key (from Cloud Console)
//   AQ....   — OAuth2 Application Default Credential (from AI Studio on managed projects)
const GEMINI_KEY_VALID = typeof GEMINI_API_KEY === "string" &&
  GEMINI_API_KEY.length >= 20 &&
  (GEMINI_API_KEY.startsWith("AIza") || GEMINI_API_KEY.startsWith("AQ."));

if (GEMINI_KEY_VALID) {
  console.log("[imageAnalysis] ✅ Gemini key accepted:", GEMINI_API_KEY.slice(0, 10) + "...");
} else if (GEMINI_API_KEY) {
  console.warn("[imageAnalysis] ⚠️ Gemini key format unrecognised — will try anyway:", GEMINI_API_KEY.slice(0, 10) + "...");
} else {
  console.info("[imageAnalysis] ℹ️ No Gemini key — using HuggingFace BLIP + heuristic.");
}

// gemini-3.6-flash is the only currently active model (all 2.x versions deprecated)
const GEMINI_URL_V2 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_URL_V1 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

// HuggingFace BLIP — FREE image captioning, no API key needed
const HF_BLIP_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large";
const HF_BLIP_BASE_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base";

/** Categories the form supports */
const CATEGORIES = [
  "road", "garbage", "water", "electricity",
  "streetlight", "public-safety", "parks", "drainage", "noise",
];


/**
 * Primary analysis prompt — instructs Gemini to reason step-by-step before
 * producing its final classification, which yields much more accurate results.
 */
const SYSTEM_PROMPT = `
You are CivicAI, an expert municipal infrastructure analyst for the Jharkhand, India citizen portal.

Your task: analyse the provided image (or video frame) and output ONLY a valid JSON object.
No markdown, no code fences, no prose — ONLY the raw JSON.

STEP 1 — OBSERVE: Silently note every visible element: surface type, damage pattern, objects, colors, lighting.
STEP 2 — CLASSIFY: Decide if this is a real civic/public-infrastructure problem.
STEP 3 — OUTPUT: Return this exact JSON (and nothing else):

{
  "isCivicIssue": <true|false>,
  "category": "<road|garbage|water|electricity|streetlight|public-safety|parks|drainage|noise>",
  "title": "<4-8 word specific English title — name the EXACT defect you see, e.g. 'Large Pothole Exposing Subbase on Main Road'>",
  "description": "<3 sentences: (1) What exact damage/problem is visible in the image? (2) What is the location context (road, alley, park, etc.)? (3) What specific action should the relevant government department take?>",
  "priority": "<low|medium|high|critical>",
  "confidence": <integer 0-100>
}

━━━ CLASSIFICATION RULES ━━━
isCivicIssue = false (confidence < 35) when:
  • Indoor/household objects (furniture, food, documents, stationery)
  • People, pets, or animals NOT near infrastructure damage
  • Pure clear sky with NO poles, wires, or structures
  • Blurry/dark images with no identifiable infrastructure

isCivicIssue = true when any of these are clearly visible:
  • Road surface damage: potholes, cracks, sunken asphalt, exposed soil/gravel on road
  • Garbage/waste: overflowing bins, roadside dump, scattered litter, construction debris
  • Water issues: burst pipe, waterlogging, flooding, stagnant pooling, sewage leak
  • Electricity: broken/leaning pole, dangling live wires, damaged transformer, burnt cable
  • Streetlight: lamp post with broken/missing lamp, dark road, corroded pole
  • Public safety: fallen tree blocking road, open excavation pit, collapsed wall, fire
  • Parks: broken bench/swing, overgrown unmanaged vegetation, damaged pathway in park
  • Drainage: open/uncovered drain, clogged storm drain, sewage overflow on ground
  • Noise: active construction machinery, industrial equipment in residential area

━━━ CATEGORY SELECTION ━━━
road        → surface cracks, potholes, broken dividers, unpaved/damaged road
garbage     → uncollected waste, illegal dumping, overflowing bins, scattered trash
water       → plumbing leak, flooding, waterlogging, dry public tap/pipeline burst
electricity → broken pole, dangling/hanging wires, damaged transformer, no electricity
streetlight → broken lamp post, non-working street light, dark with infrastructure visible
public-safety → fire, structural collapse, open danger pit, fallen tree on road
parks       → damaged park equipment, overgrown grass, broken park infrastructure
drainage    → open drains, clogged channels, overflowing manhole, sewage on surface
noise       → construction site, loud machinery, industrial equipment

━━━ PRIORITY RULES ━━━
critical → live wires touching ground/water, active fire, structural collapse imminent
high     → large deep potholes, burst main, major flooding, pole fallen on road
medium   → broken streetlight, illegal dumping, partial road crack, clogged drain
low      → minor crack, small litter patch, overgrown grass in park

━━━ TITLE & DESCRIPTION QUALITY ━━━
✓ GOOD title: "Deep Pothole Exposing Road Base on Residential Street"
✗ BAD title:  "Road Issue" or "Civic Problem"
✓ GOOD description: "The image shows a large pothole approximately 2 feet wide on an asphalt road surface, with the base gravel layer exposed and water pooling inside. The damage is located on what appears to be a residential street with parked vehicles nearby. The Public Works Department should urgently dispatch a road repair crew to fill the pothole and restore the surface to prevent vehicle damage and accidents."

Remember: output ONLY the JSON object. No other text.
`.trim();

/**
 * Low-confidence retry prompt — more directive, used when confidence < 45.
 * Forces Gemini to commit to the most likely category even with partial information.
 */
const RETRY_PROMPT = `
The image was already analysed but confidence was low. Look again carefully.
Even if the image is partially unclear, identify the MOST LIKELY civic infrastructure problem visible.
Focus on: surface texture (road/ground), colour patterns (garbage/water/mud), structures (poles/drains/walls).
Commit to the best-matching category from: road, garbage, water, electricity, streetlight, public-safety, parks, drainage, noise.
If ANY civic infrastructure element is present, set isCivicIssue=true.
Return ONLY a valid JSON object with keys: isCivicIssue, category, title, description, priority, confidence.
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
 * Advanced pixel-level analysis that computes detailed color statistics,
 * edge density, and scene structure to classify civic issues.
 * Returns null-like low-confidence result when the image doesn't look like a civic issue.
 */
function visualHeuristicAnalysis(base64Frames) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const W = Math.min(img.width, 500);
      const H = Math.min(img.height, 400);
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, W, H);
      const pixels = ctx.getImageData(0, 0, W, H).data;
      const total = W * H;

      // ── Pixel counters ────────────────────────────────────────────────────
      let rSum = 0, gSum = 0, bSum = 0;
      let darkPx = 0, grayPx = 0, brownPx = 0, greenPx = 0,
          bluePx = 0, yellowPx = 0, redPx = 0,
          skyBluePx = 0, asphaltPx = 0, waterPx = 0,
          darkCenterPx = 0, brightPx = 0, mudPx = 0;

      const grayArr = new Float32Array(total);

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
        rSum += r; gSum += g; bSum += b;
        const brightness = (r + g + b) / 3;
        const sat = Math.max(r, g, b) - Math.min(r, g, b);
        const col = (i / 4) % W;
        grayArr[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;

        if (brightness < 60) darkPx++;
        if (brightness > 210) brightPx++;
        if (sat < 30 && brightness > 80 && brightness < 185) grayPx++;

        // Road / asphalt: dark-gray, low saturation
        if (brightness < 95 && sat < 22) asphaltPx++;
        // Mud / dirt brown on road
        if (r > 80 && g > 50 && b < 70 && r > g && g > b && sat > 12 && brightness < 160) brownPx++;
        // Thick mud / darker brown (garbage, drainage)
        if (r > 60 && g > 35 && b < 50 && r > g && sat > 10 && brightness < 120) mudPx++;
        // Green (parks, vegetation)
        if (g > r + 18 && g > b + 18 && g > 65 && sat > 22) greenPx++;
        // Sky blue (clear sky)
        if (b > r + 28 && b > g + 8 && b > 115 && brightness > 125) skyBluePx++;
        // Murky water / dark blue-gray (flooding, drainage)
        if (b > r && b > g && brightness < 125 && sat < 65 && b > 55) waterPx++;
        // Any blue (general)
        if (b > r && b > g && b > 75 && sat > 18) bluePx++;
        // Yellow / amber (streetlight glow, signs)
        if (r > 175 && g > 125 && b < 85) yellowPx++;
        // Red / orange-red (fire, emergency, danger)
        if (r > 165 && g < 85 && b < 85) redPx++;
        // Dark center structure (pole against sky)
        if (brightness < 85 && col > W * 0.18 && col < W * 0.82) darkCenterPx++;
      }

      // ── Edge density ──────────────────────────────────────────────────────
      let edgeCount = 0;
      for (let y = 0; y < H; y++) {
        for (let x = 1; x < W - 1; x++) {
          const idx = y * W + x;
          if (Math.abs(grayArr[idx + 1] - grayArr[idx - 1]) > 28) edgeCount++;
        }
      }

      const avgR = rSum / total, avgG = gSum / total, avgB = bSum / total;
      const avgBrightness = (avgR + avgG + avgB) / 3;
      const edgeDensity   = edgeCount / total;

      const darkR         = darkPx        / total;
      const brightR       = brightPx      / total;
      const grayR         = grayPx        / total;
      const brownR        = brownPx       / total;
      const mudR          = mudPx         / total;
      const greenR        = greenPx       / total;
      const skyBlueR      = skyBluePx     / total;
      const waterR        = waterPx       / total;
      const blueR         = bluePx        / total;
      const yellowR       = yellowPx      / total;
      const redR          = redPx         / total;
      const asphaltR      = asphaltPx     / total;
      const darkCenterR   = darkCenterPx  / total;

      // ── Reject truly non-civic images (blank / pure sky / white paper) ─────
      const isPureSky  = skyBlueR > 0.70 && darkCenterR < 0.02 && brownR < 0.03;
      const isAllWhite = brightR > 0.75;
      if (isPureSky || isAllWhite) {
        resolve({
          isCivicIssue: false, category: "road",
          title: "No Civic Issue Detected",
          description: "The image appears to be a plain sky or blank photo with no infrastructure visible. Please upload a clear photo showing the civic problem you want to report (e.g. pothole, broken streetlight, garbage dump, waterlogging).",
          priority: "low", confidence: 18,
        });
        return;
      }

      // ── Competitive scoring: every category gets a score, highest wins ─────
      const scores = {
        streetlight:    0,
        electricity:    0,
        road:           0,
        garbage:        0,
        water:          0,
        drainage:       0,
        parks:          0,
        "public-safety": 0,
        noise:          0,
      };

      // Streetlight: dark pole/structure against bright sky background
      scores.streetlight += darkCenterR  * 120;
      scores.streetlight += skyBlueR     * 60;
      scores.streetlight += yellowR      * 80;   // glow of lamp
      if (darkCenterR > 0.04 && skyBlueR > 0.15) scores.streetlight += 40;

      // Electricity: pole/wire + very dark scene OR daytime pole without lamp glow
      scores.electricity += darkCenterR  * 80;
      scores.electricity += darkR        * 70;
      scores.electricity += yellowR      * 40;
      if (darkR > 0.45) scores.electricity += 30;

      // Road / Pothole: asphalt + brown (exposed soil) OR high edge in gray scene
      scores.road += asphaltR   * 100;
      scores.road += brownR     * 60;
      scores.road += grayR      * 50;
      scores.road += edgeDensity * 40;
      if (asphaltR > 0.12 && brownR > 0.05) scores.road += 35;

      // Garbage: muddy-brown tones, mixed colors, irregular textures
      scores.garbage += brownR  * 80;
      scores.garbage += mudR    * 100;
      scores.garbage += redR    * 30;
      scores.garbage += yellowR * 20;
      scores.garbage += edgeDensity * 30;
      if (brownR > 0.18 && greenR < 0.20) scores.garbage += 25;

      // Water: flooding / waterlogging (murky standing water)
      scores.water += waterR    * 120;
      scores.water += blueR     * 50;
      if (waterR > 0.15 && brownR < 0.20) scores.water += 40;

      // Drainage: dark blue-brown murky water on ground
      scores.drainage += waterR  * 80;
      scores.drainage += mudR    * 60;
      scores.drainage += blueR   * 40;
      scores.drainage += darkR   * 30;
      if (waterR > 0.10 && mudR > 0.05) scores.drainage += 35;

      // Parks: lots of green, low asphalt, daylight
      scores.parks += greenR    * 130;
      scores.parks -= asphaltR  * 50;  // penalty for road
      if (greenR > 0.25) scores.parks += 30;

      // Public safety: fire (red) or structural collapse
      scores["public-safety"] += redR    * 150;
      scores["public-safety"] += darkR   * 20;
      if (redR > 0.05) scores["public-safety"] += 50;

      // Noise: generally low signal from image — only score if very colorful
      scores.noise += edgeDensity * 10;

      // ── Pick winning category ─────────────────────────────────────────────
      const winner = Object.entries(scores).reduce((best, [cat, score]) =>
        score > best[1] ? [cat, score] : best, ["", -Infinity]
      );
      const winCat = winner[0];
      const winScore = winner[1];

      // Map winner to result
      const RESULTS = {
        streetlight: {
          title: "Street Light or Electricity Pole Issue",
          description: "The image shows a utility pole, street lamp, or electrical infrastructure. The lamp fitting appears damaged, missing, or non-functional. The electricity/street light department should urgently inspect this pole and repair or replace the lamp to restore night-time safety for pedestrians and vehicles on this road.",
          priority: "medium", confidence: Math.min(40 + Math.round(winScore * 0.6), 82),
        },
        electricity: {
          title: "Electrical Infrastructure Failure",
          description: "The image indicates a damaged or non-functional electrical installation in a public area. Broken poles, dangling wires, or a complete power outage pose serious safety risks. The electricity department must inspect this location immediately and carry out repairs to restore power and prevent electrocution hazards.",
          priority: "high", confidence: Math.min(42 + Math.round(winScore * 0.5), 80),
        },
        road: {
          title: brownR > 0.10 ? "Road Surface Damage and Pothole" : "Damaged Road or Pavement",
          description: brownR > 0.10
            ? "The uploaded image shows a road or pavement surface with deteriorated tarmac and exposed soil or mud, indicative of severe pothole formation or road surface cracking. The roads and public works department should conduct an urgent site inspection and schedule repairs to prevent vehicle damage and accidents."
            : "The image shows a deteriorated or cracked road/concrete surface in a public area. The public works department should inspect for potholes, surface cracks, or subsidence and carry out timely repairs to ensure safe passage for vehicles and pedestrians.",
          priority: brownR > 0.10 ? "high" : "medium",
          confidence: Math.min(45 + Math.round(winScore * 0.5), 80),
        },
        garbage: {
          title: "Garbage or Waste Accumulation on Public Land",
          description: "The image shows accumulation of solid waste, debris, or garbage in a public area. Uncleared garbage is a significant health hazard causing disease spread and environmental pollution. The sanitation and solid waste management department should arrange immediate collection and disinfection of this site.",
          priority: "medium", confidence: Math.min(42 + Math.round(winScore * 0.5), 78),
        },
        water: {
          title: "Waterlogging or Water Supply Issue",
          description: "The image shows significant water accumulation or flooding on a public road or open area. Stagnant water can cause vehicle accidents, infrastructure damage, and spread waterborne diseases. The water/drainage department should investigate and clear the waterlogging immediately through pumping and drain clearing.",
          priority: "high", confidence: Math.min(45 + Math.round(winScore * 0.5), 82),
        },
        drainage: {
          title: "Drainage Blocked or Sewage Overflow",
          description: "The image suggests a clogged or overflowing drain or sewage channel causing water accumulation on public ground. The strong discoloration indicates sewage contamination which is a direct public health hazard. The drainage department should perform emergency de-silting and repair the blocked drain immediately.",
          priority: "high", confidence: Math.min(42 + Math.round(winScore * 0.5), 78),
        },
        parks: {
          title: "Parks and Greenery Maintenance Required",
          description: "The image shows unmanaged vegetation, overgrown grass, or damaged park infrastructure in a public green space. Neglected parks reduce community well-being and can harbour pests and snakes. The parks and forestry department should schedule an inspection and carry out mowing, pruning, and structural repairs at the earliest.",
          priority: "low", confidence: Math.min(40 + Math.round(winScore * 0.5), 75),
        },
        "public-safety": {
          title: "Public Safety Hazard — Immediate Attention Needed",
          description: "The image indicates a potential safety emergency on public property, such as a fire, structural collapse, open pit, or fallen tree on the road. This poses an immediate risk to life and property. The public safety or disaster management department must respond urgently and cordon off the affected area.",
          priority: "critical", confidence: Math.min(50 + Math.round(winScore * 0.4), 85),
        },
        noise: {
          title: "Noise Pollution or Disturbance Complaint",
          description: "The image may show construction equipment, industrial machinery, or public event setup causing excessive noise levels in a residential or public area. The pollution control board and local administration should visit the site, measure noise levels, and take corrective action against the violating parties.",
          priority: "low", confidence: 40,
        },
      };

      const resultData = RESULTS[winCat];
      resolve({
        isCivicIssue: true,
        category: winCat,
        title: resultData.title,
        description: resultData.description,
        priority: resultData.priority,
        confidence: resultData.confidence,
      });
    };

    img.onerror = () => resolve({
      isCivicIssue: true,
      category: "road",
      title: "Civic Issue Reported",
      description: "A civic infrastructure issue has been reported at this location. The concerned department should visit the site, assess the damage, and carry out necessary repairs or maintenance at the earliest to restore normal conditions.",
      priority: "medium",
      confidence: 40,
    });

    img.src = `data:image/jpeg;base64,${base64Frames[0]}`;
  });
}

// ── Gemini API Call ───────────────────────────────────────────────────────────

/**
 * Call Gemini with one or more image frames (for video, we send up to 3 frames).
 */
/**
 * Robustly extract and parse a JSON object from Gemini's text response.
 * Handles accidental markdown fences, trailing commas, and extra whitespace.
 */
function extractJsonFromText(text) {
  // Remove markdown code fences
  let clean = text.replace(/```json|```/gi, "").trim();

  // Extract first {...} block in case there's surrounding prose
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (jsonMatch) clean = jsonMatch[0];

  // Fix common trailing comma issues before parsing
  clean = clean.replace(/,\s*([}\]])/g, "$1");

  return JSON.parse(clean);
}

/**
 * Call the Gemini Vision API with one or more image frames.
 * Uses systemInstruction (Gemini 2.0 feature) for cleaner prompt separation.
 * Automatically retries with a more directive prompt if confidence < 45.
 */
async function callGemini(frames, mimeType = "image/jpeg", isRetry = false) {
  const promptText = isRetry ? RETRY_PROMPT : SYSTEM_PROMPT;

  // Build the request body
  // For Gemini 2.0 flash we use systemInstruction; for 1.5 we embed it in parts.
  const imageParts = frames.map((b64) => ({
    inline_data: { mime_type: mimeType, data: b64 },
  }));

  const bodyV2 = {
    system_instruction: { parts: [{ text: promptText }] },
    contents: [{ role: "user", parts: imageParts }],
    generationConfig: {
      temperature: isRetry ? 0.25 : 0.05,
      maxOutputTokens: 900,
      topK: 32,
      topP: 0.9,
    },
  };

  const bodyV1 = {
    contents: [{
      parts: [
        { text: promptText },
        ...imageParts,
      ],
    }],
    generationConfig: {
      temperature: isRetry ? 0.25 : 0.05,
      maxOutputTokens: 900,
    },
  };

  const urlsToTry = [
    { url: GEMINI_URL_V2, name: "gemini-3.6-flash", body: bodyV2 },
    { url: GEMINI_URL_V1, name: "gemini-3.6-flash-lite", body: bodyV1 },
  ];
  let lastError = null;

  for (const { url, name, body } of urlsToTry) {
    console.log(`[imageAnalysis] Calling ${name}${isRetry ? " (retry)" : ""}…`);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        console.warn(`[imageAnalysis] ${name} error ${res.status}:`, JSON.stringify(err));
        lastError = new Error(`Gemini API error (${res.status}): ${JSON.stringify(err)}`);
        continue;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log(`[imageAnalysis] ${name} raw response:`, text.slice(0, 300));

      let parsed;
      try {
        parsed = extractJsonFromText(text);
      } catch (jsonErr) {
        console.warn(`[imageAnalysis] ${name} JSON parse failed:`, jsonErr.message, "\nRaw:", text.slice(0, 200));
        lastError = jsonErr;
        continue;
      }

      // Validate and normalise category
      if (!CATEGORIES.includes(parsed.category)) {
        console.warn(`[imageAnalysis] Unknown category "${parsed.category}" — defaulting to road`);
        parsed.category = "road";
      }

      // Normalise confidence to integer
      parsed.confidence = Math.round(Number(parsed.confidence) || 50);

      // Ensure isCivicIssue is boolean
      if (parsed.isCivicIssue === undefined) {
        parsed.isCivicIssue = parsed.confidence >= 40;
      }

      // Sanitise priority
      if (!["low","medium","high","critical"].includes(parsed.priority)) {
        parsed.priority = "medium";
      }

      console.log(`[imageAnalysis] ${name} result:`, parsed);

      // ── Auto-retry if confidence is too low and this isn't already a retry ──
      if (!isRetry && parsed.confidence < 45 && parsed.isCivicIssue) {
        console.info(`[imageAnalysis] Low confidence (${parsed.confidence}%) — retrying with directive prompt…`);
        try {
          const retryResult = await callGemini(frames, mimeType, true);
          // Use retry result only if it is meaningfully better
          if (retryResult && retryResult.confidence > parsed.confidence + 8) {
            console.info(`[imageAnalysis] Retry improved confidence: ${parsed.confidence}% → ${retryResult.confidence}%`);
            return retryResult;
          }
        } catch {
          // Retry failed — stick with original result
        }
      }

      return parsed;
    } catch (err) {
      console.warn(`[imageAnalysis] ${name} threw:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini model calls failed");
}

// ── HuggingFace BLIP Free Image Captioning ────────────────────────────────────

/**
 * Convert a BLIP-generated English caption into a structured civic issue.
 * Uses weighted keyword matching across all 9 civic categories.
 */
function captionToCivicIssue(caption) {
  const t = caption.toLowerCase();
  console.log("[imageAnalysis] BLIP caption:", caption);

  const score = {
    road: 0, garbage: 0, water: 0, streetlight: 0,
    electricity: 0, drainage: 0, parks: 0, "public-safety": 0, noise: 0,
  };

  // Road / pothole
  [["pothole",5],["road damage",5],["cracked road",5],["broken road",4],
   ["pavement",3],["asphalt",3],["road",2],["street",1],["tarmac",4],
   ["road crack",5],["damaged road",5],["road surface",4]]
    .forEach(([w, v]) => { if (t.includes(w)) score.road += v; });

  // Garbage / waste
  [["garbage",5],["trash",5],["waste",4],["litter",4],["rubbish",5],
   ["dump",4],["debris",3],["pile of waste",5],["refuse",4],["junk",3]]
    .forEach(([w, v]) => { if (t.includes(w)) score.garbage += v; });

  // Water / flooding
  [["flood",5],["waterlog",5],["inundated",5],["submerged",4],
   ["puddle",4],["water on road",5],["water overflow",5],
   ["stagnant water",5],["pipe leak",5],["burst pipe",5],["water",1]]
    .forEach(([w, v]) => { if (t.includes(w)) score.water += v; });

  // Streetlight / lamp
  [["streetlight",5],["street light",5],["lamp post",5],["lamppost",5],
   ["light pole",5],["lamp",4],["lantern",4],["broken light",5],
   ["street lamp",5],["pole with light",5]]
    .forEach(([w, v]) => { if (t.includes(w)) score.streetlight += v; });

  // Electricity / power
  [["electric pole",5],["power line",5],["utility pole",5],["wire",3],
   ["transformer",4],["dangling wire",5],["fallen pole",5],
   ["power outage",5],["electric wire",5],["electricity",3],["cable",2]]
    .forEach(([w, v]) => { if (t.includes(w)) score.electricity += v; });

  // Drainage / sewer
  [["drain",5],["sewer",5],["sewage",5],["gutter",4],["manhole",5],
   ["open drain",5],["blocked drain",5],["overflow",3],["stink",3]]
    .forEach(([w, v]) => { if (t.includes(w)) score.drainage += v; });

  // Parks / greenery
  [["park",4],["garden",4],["grass",3],["overgrown",4],["vegetation",3],
   ["tree",3],["bushes",3],["lawn",4],["shrub",3],["greenery",4]]
    .forEach(([w, v]) => { if (t.includes(w)) score.parks += v; });

  // Public safety
  [["fire",5],["flame",5],["collapse",5],["fallen tree",5],["open pit",5],
   ["structural damage",5],["live wire",5],["danger",4],["hazard",4],
   ["accident",4],["emergency",5]]
    .forEach(([w, v]) => { if (t.includes(w)) score["public-safety"] += v; });

  // Noise
  [["construction",3],["machinery",3],["excavator",4],["bulldozer",4],
   ["crane",3],["drill",3],["loud",2]]
    .forEach(([w, v]) => { if (t.includes(w)) score.noise += v; });

  // Pick highest-scoring category
  const [winCat, winScore] = Object.entries(score).reduce(
    (best, entry) => entry[1] > best[1] ? entry : best, ["road", 0]
  );

  const confidence = winScore >= 5 ? Math.min(60 + winScore * 2, 88)
                   : winScore >= 2 ? 52
                   : 44; // caption exists but no clear civic keywords

  const CATEGORY_DATA = {
    road: {
      title: "Road Surface Damage Reported",
      description: `AI image captioning identified: "${caption}". The image shows road or pavement damage such as a pothole, crack, or surface deterioration on a public road. The roads and public works department should conduct a site inspection and schedule urgent repairs to prevent vehicle damage and accidents.`,
      priority: "high",
    },
    garbage: {
      title: "Garbage or Waste Accumulation",
      description: `AI image captioning identified: "${caption}". The image shows accumulated solid waste, garbage, or debris in a public area. This is a significant sanitation and health hazard. The solid waste management department should arrange immediate collection and cleaning of the affected site.`,
      priority: "medium",
    },
    water: {
      title: "Water Flooding or Pipe Leak Issue",
      description: `AI image captioning identified: "${caption}". The image indicates waterlogging, flooding, or a water pipe leak in a public area. Stagnant water causes vehicle accidents, infrastructure damage, and disease spread. The water/drainage department should assess and resolve the issue immediately.`,
      priority: "high",
    },
    streetlight: {
      title: "Street Light or Lamp Post Issue",
      description: `AI image captioning identified: "${caption}". The image shows a street lamp, lamp post, or lighting infrastructure that appears damaged, non-functional, or missing. The electricity/street light department should urgently inspect and repair or replace the lamp to restore road safety at night.`,
      priority: "medium",
    },
    electricity: {
      title: "Electrical Infrastructure Failure",
      description: `AI image captioning identified: "${caption}". The image shows damaged electrical infrastructure including broken poles, dangling wires, or a faulty transformer in a public area. This poses serious electrocution and fire risks. The electricity department must inspect and carry out emergency repairs immediately.`,
      priority: "high",
    },
    drainage: {
      title: "Drainage Blocked or Sewage Overflow",
      description: `AI image captioning identified: "${caption}". The image shows a clogged drain, open sewer, or sewage overflow on public property. This is a direct public health hazard that can spread waterborne disease. The drainage department should perform emergency de-silting and repairs immediately.`,
      priority: "high",
    },
    parks: {
      title: "Parks and Greenery Maintenance Required",
      description: `AI image captioning identified: "${caption}". The image shows an overgrown, neglected, or damaged public park or green space. The parks and forestry department should schedule an inspection and carry out necessary mowing, pruning, and infrastructure repairs at the earliest.`,
      priority: "low",
    },
    "public-safety": {
      title: "Public Safety Hazard — Urgent Action Required",
      description: `AI image captioning identified: "${caption}". The image indicates a serious public safety emergency such as a fire, structural collapse, fallen tree on a road, or dangerous open pit. The public safety and disaster management department must respond urgently to protect citizens.`,
      priority: "critical",
    },
    noise: {
      title: "Noise Pollution or Construction Disturbance",
      description: `AI image captioning identified: "${caption}". The image shows construction equipment, industrial machinery, or public works activity causing noise disruption in the area. The pollution control board should visit the site, measure noise levels, and take corrective action.`,
      priority: "low",
    },
  };

  const data = CATEGORY_DATA[winCat];
  return {
    isCivicIssue: true,
    category: winCat,
    title: data.title,
    description: data.description,
    priority: data.priority,
    confidence,
  };
}

/**
 * Call HuggingFace BLIP image captioning (FREE, no API key).
 * Tries the larger model first, falls back to base model.
 * Returns a structured civic-issue result parsed from the caption.
 */
async function callHuggingFaceBlip(base64, mimeType = "image/jpeg") {
  // Convert base64 string to binary blob
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mimeType });

  const urls = [HF_BLIP_URL, HF_BLIP_BASE_URL];

  for (const url of urls) {
    const modelName = url.includes("large") ? "BLIP-large" : "BLIP-base";
    console.log(`[imageAnalysis] Trying ${modelName}…`);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: blob,
        signal: AbortSignal.timeout(25000), // 25s timeout for cold-start
      });

      const json = await res.json();

      // Model still loading on HuggingFace servers
      if (json?.error?.includes("loading")) {
        console.info(`[imageAnalysis] ${modelName} warming up (${Math.round(json.estimated_time || 20)}s). Trying next…`);
        continue;
      }

      if (!res.ok) {
        console.warn(`[imageAnalysis] ${modelName} HTTP ${res.status}:`, json);
        continue;
      }

      const caption = (Array.isArray(json) ? json[0]?.generated_text : json?.generated_text) || "";
      if (!caption) {
        console.warn(`[imageAnalysis] ${modelName} returned empty caption.`);
        continue;
      }

      return captionToCivicIssue(caption);
    } catch (err) {
      console.warn(`[imageAnalysis] ${modelName} failed:`, err.message);
    }
  }

  throw new Error("HuggingFace BLIP unavailable");
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Analyse a single image (dataURL or objectURL) or a video objectURL.
 * Returns structured civic-issue data, or null if analysis completely fails.
 *
 * The returned object includes:
 *   - isCivicIssue {boolean}  — whether the image shows a civic problem
 *   - category     {string}   — one of the CATEGORIES values
 *   - title        {string}   — concise issue title
 *   - description  {string}   — detailed description
 *   - priority     {string}   — low | medium | high | critical
 *   - confidence   {number}   — 0-100 integer confidence score
 */
export async function analyseMedia(src, isVideo = false) {
  try {
    if (isVideo) {
      const frames = await extractVideoFrames(src);
      if (!frames || frames.length === 0) {
        console.warn("[imageAnalysis] Could not extract video frames.");
        return null;
      }

      // 1. Try Gemini Vision (best accuracy) — only if key is valid
      if (GEMINI_KEY_VALID) {
        try { return await callGemini(frames, "image/jpeg"); }
        catch (err) { console.warn("[imageAnalysis] Gemini failed:", err.message); }
      }

      // 2. Try HuggingFace BLIP (free ML captioning)
      try { return await callHuggingFaceBlip(frames[0], "image/jpeg"); }
      catch (err) { console.warn("[imageAnalysis] BLIP failed:", err.message); }

      // 3. Pixel heuristic fallback
      return await visualHeuristicAnalysis(frames);

    } else {
      const { base64, mimeType } = await toBase64Payload(src);

      // 1. Try Gemini Vision (best accuracy) — only if key is valid
      if (GEMINI_KEY_VALID) {
        try { return await callGemini([base64], mimeType); }
        catch (err) { console.warn("[imageAnalysis] Gemini failed:", err.message); }
      }

      // 2. Try HuggingFace BLIP (free ML captioning, no API key)
      try { return await callHuggingFaceBlip(base64, mimeType); }
      catch (err) { console.warn("[imageAnalysis] BLIP failed, using heuristic.", err.message); }

      // 3. Pixel heuristic fallback
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
