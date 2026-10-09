// ─── Firebase Configuration ─────────────────────────────────────────────────
// All values are loaded from environment variables.
// Never hardcode Firebase config directly in this file.
//
// Setup: create a .env.local file in the project root with:
//   VITE_FIREBASE_API_KEY=...
//   VITE_FIREBASE_AUTH_DOMAIN=...
//   VITE_FIREBASE_PROJECT_ID=...
//   VITE_FIREBASE_STORAGE_BUCKET=...
//   VITE_FIREBASE_MESSAGING_SENDER_ID=...
//   VITE_FIREBASE_APP_ID=...
//
// Until those values are set, Firebase will NOT be initialized and the Phone
// OTP button will show a friendly "not configured" message instead of crashing.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";

// ─── Guard: check every required env var before touching Firebase ─────────────
const REQUIRED_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missing = REQUIRED_KEYS.filter(
  (key) => !import.meta.env[key] || import.meta.env[key].trim() === ""
);

/**
 * True when all required Firebase env vars are present.
 * When false, the phone auth modal shows a setup message instead of crashing.
 */
export const isFirebaseConfigured = missing.length === 0;

if (!isFirebaseConfigured) {
  // Warn once in dev console — do NOT throw, so the rest of the app still works.
  console.warn(
    "[Firebase] Phone Authentication is not configured.\n" +
    "Create a .env.local file in the project root with:\n\n" +
    REQUIRED_KEYS.map((k) => `  ${k}=your_value_here`).join("\n") +
    "\n\nSee FIREBASE_AUTH_SETUP.md for step-by-step instructions."
  );
}

// ─── Lazy initialization ──────────────────────────────────────────────────────
// Firebase is only initialized when all env vars are present.
// This prevents the app from crashing when .env.local hasn't been created yet.

let app = null;
let auth = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Prevent duplicate initialization on Vite HMR hot reloads
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  // Local persistence keeps the user signed in after a page refresh
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export { app, auth };
