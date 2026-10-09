// ─── Firebase Phone Authentication Service ───────────────────────────────────
// This module wraps Firebase Phone Auth into clean, reusable functions.
// All real OTP delivery is handled by Firebase / Google SMS infrastructure.
// No OTP values are stored, logged, or displayed by this application.

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebaseConfig";

// ─── Internal reCAPTCHA instance reference ───────────────────────────────────
let recaptchaVerifierInstance = null;

/**
 * Destroys any existing RecaptchaVerifier and clears its DOM container.
 * Must be called before creating a new verifier (e.g. on Resend OTP).
 */
export function clearRecaptcha() {
  try {
    if (recaptchaVerifierInstance) {
      recaptchaVerifierInstance.clear();
    }
  } catch (_) {
    // Verifier may already be in a bad state — silently ignore
  } finally {
    recaptchaVerifierInstance = null;
  }

  // Clear the DOM element so Firebase can re-render it fresh
  const el = document.getElementById("firebase-recaptcha-container");
  if (el) el.innerHTML = "";
}

/**
 * Creates an invisible reCAPTCHA verifier attached to
 * id="firebase-recaptcha-container" and stores it for later use.
 *
 * @returns {RecaptchaVerifier}
 * @throws {Error} if Firebase is not configured
 */
export function createRecaptchaVerifier() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  clearRecaptcha(); // Always start fresh

  recaptchaVerifierInstance = new RecaptchaVerifier(
    auth,
    "firebase-recaptcha-container",
    {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved — signInWithPhoneNumber will proceed automatically
      },
      "expired-callback": () => {
        // Token expired — next sendOtp call will recreate the verifier
        clearRecaptcha();
      },
    }
  );

  return recaptchaVerifierInstance;
}

/**
 * Sends a real OTP SMS to `phoneE164` via Firebase Phone Authentication.
 *
 * @param {string} phoneE164 - Phone in E.164 format, e.g. "+919876543210"
 * @returns {Promise<import("firebase/auth").ConfirmationResult>}
 * @throws {Error} if Firebase is not configured
 */
export async function sendOtp(phoneE164) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  const verifier = createRecaptchaVerifier();

  // Render the (invisible) widget before calling signInWithPhoneNumber
  await verifier.render();

  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneE164,
    verifier
  );

  return confirmationResult;
}

/**
 * Verifies the OTP entered by the user against Firebase's confirmation result.
 *
 * @param {import("firebase/auth").ConfirmationResult} confirmationResult
 * @param {string} otp - 6-digit OTP string
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function verifyOtp(confirmationResult, otp) {
  const credential = await confirmationResult.confirm(otp);
  return credential;
}

/**
 * Signs the current user out of Firebase Authentication.
 * Safe to call even when Firebase is not configured.
 *
 * @returns {Promise<void>}
 */
export async function signOutUser() {
  if (!isFirebaseConfigured || !auth) return;
  await firebaseSignOut(auth);
}

/**
 * Subscribes to Firebase auth state changes.
 * Returns a no-op unsubscribe function when Firebase is not configured.
 *
 * @param {(user: import("firebase/auth").User | null) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onAuthChange(callback) {
  if (!isFirebaseConfigured || !auth) {
    // Return a no-op unsubscribe — nothing to listen to
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ─── User-friendly Firebase error translator ─────────────────────────────────

/**
 * Converts raw Firebase Auth error codes into friendly, user-facing messages.
 * Raw error codes are never shown to the user.
 *
 * @param {Error & { code?: string }} error
 * @returns {string}
 */
export function getFirebaseErrorMessage(error) {
  const code = error?.code || error?.message || "";

  // Special internal error for unconfigured Firebase
  if (code === "FIREBASE_NOT_CONFIGURED") {
    return "Firebase Phone Authentication is not yet configured. Please follow the setup guide in FIREBASE_AUTH_SETUP.md.";
  }

  const messages = {
    "auth/invalid-api-key":
      "Firebase API key is invalid. Please check your .env.local file and ensure all VITE_FIREBASE_* values are correct.",
    "auth/invalid-phone-number":
      "The mobile number you entered is not valid. Please enter a 10-digit Indian mobile number.",
    "auth/missing-phone-number":
      "Please enter your mobile number before requesting an OTP.",
    "auth/quota-exceeded":
      "Too many OTP requests have been made. Please try again after some time.",
    "auth/too-many-requests":
      "You've made too many requests. Please wait a moment and try again.",
    "auth/invalid-verification-code":
      "The OTP you entered is incorrect. Please check it and try again.",
    "auth/code-expired":
      "Your OTP has expired. Please go back and request a new one.",
    "auth/session-expired":
      "Your verification session has expired. Please request a new OTP.",
    "auth/missing-verification-code":
      "Please enter the 6-digit OTP sent to your mobile number.",
    "auth/captcha-check-failed":
      "Security verification failed. Please refresh the page and try again.",
    "auth/network-request-failed":
      "A network error occurred. Please check your internet connection and try again.",
    "auth/user-disabled":
      "This account has been disabled. Please contact support.",
    "auth/operation-not-allowed":
      "Phone authentication is not enabled. Please enable it in the Firebase Console → Authentication → Sign-in method.",
    "auth/app-not-authorized":
      "This app is not authorized. Please check the Firebase Console configuration and authorized domains.",
    "auth/web-storage-unsupported":
      "Your browser does not support web storage. Please enable cookies and try again.",
    "auth/internal-error":
      "An internal error occurred. Please try again.",
    "auth/popup-blocked":
      "The reCAPTCHA popup was blocked. Please allow popups and try again.",
    "auth/billing-not-enabled":
      "Firebase Phone Auth requires the Blaze (paid) plan. Please upgrade your Firebase project.",
  };

  return (
    messages[code] ||
    "An unexpected error occurred during authentication. Please try again."
  );
}
