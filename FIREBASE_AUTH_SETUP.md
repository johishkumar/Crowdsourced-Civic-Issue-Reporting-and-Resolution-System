# 🔥 Firebase Phone Authentication — Setup Guide

This document explains how to configure, run, and test the **real Firebase SMS OTP system** for the Jharkhand Civic Pragati Portal.

---

## Architecture Overview

```
User enters phone number
      │
      ▼
FirebasePhoneAuthModal opens (src/components/FirebasePhoneAuthModal.jsx)
      │
      ▼
createRecaptchaVerifier() → invisible reCAPTCHA executed
      │
      ▼
signInWithPhoneNumber(auth, "+91XXXXXXXXXX", verifier)
      │  Firebase / Google infrastructure sends a REAL SMS OTP
      ▼
User receives OTP on their physical phone
      │
      ▼
confirmationResult.confirm(otp)  ← entered by user in 6-box UI
      │  Firebase verifies the OTP server-side
      ▼
UserCredential returned → app user object built → onLogin() called
      │
      ▼
User authenticated — civic dashboard loads
```

> **No OTP value is ever stored, logged, or displayed inside this application.**

---

## Files Created / Modified

| File | Purpose |
|---|---|
| `src/firebase/firebaseConfig.js` | Firebase initialization — reads from `.env.local` |
| `src/firebase/phoneAuthService.js` | `sendOtp()`, `verifyOtp()`, `signOutUser()`, error translator |
| `src/components/FirebasePhoneAuthModal.jsx` | Production OTP modal (Phone → OTP → Success) |
| `src/Login.jsx` | Wired up to open `FirebasePhoneAuthModal` on "Verify Mobile" click |
| `src/App.jsx` | Firebase auth persistence + `signOutUser()` on logout |
| `.env.example` | Template for required `VITE_FIREBASE_*` environment variables |
| `.gitignore` | Updated to protect `server/.env` |

---

## Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. `jharkhand-civic-portal`)
3. Disable or enable Google Analytics → **Create project**

---

## Step 2 — Register Your Web App

1. In the Firebase Console, open your project
2. Click the **`</>`** (Web) icon to add a web app
3. Enter a nickname (e.g. `CivicPortal Web`)
4. Click **Register app**
5. Firebase shows the `firebaseConfig` object — copy those values for Step 6

---

## Step 3 — Enable Phone Authentication

1. Firebase Console → **Authentication** → **Sign-in method**
2. Click **Phone** → toggle **Enable** → click **Save**

> ⚠️ Firebase Blaze (pay-as-you-go) plan required for production SMS. Free Spark plan has very strict limits.

---

## Step 4 — Configure Authorized Domains

Firebase only accepts reCAPTCHA/OTP requests from whitelisted domains.

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add:
   - `localhost` ← already present (local dev)
   - Your production domain e.g. `civic.jharkhand.gov.in`
   - Any Vercel / Netlify preview URL

> The dev server runs HTTPS via Vite's `basicSsl` plugin. `localhost` must be in the list.

---

## Step 5 — Get Firebase Config Values

**Project Settings (⚙) → General → Your apps → SDK setup and configuration**

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef...",
};
```

---

## Step 6 — Create `.env.local` in Project Root

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

> `.env.local` is in `.gitignore` — it will **never** be committed to source control.

---

## Step 7 — Run the Project Locally

**Terminal 1 — Frontend**
```bash
npm run dev
```
Opens `https://localhost:5173` (HTTPS required for reCAPTCHA).

**Terminal 2 — Backend (optional)**
```bash
cd server && node server.js
```

Accept the browser's self-signed certificate warning — expected in dev.

---

## Step 8 — Test Real OTP Delivery

1. Open `https://localhost:5173`
2. Click **"Verify Mobile & Login via OTP"**
3. Enter your **real 10-digit Indian mobile number**
4. Click **"Send OTP via SMS"** — Firebase sends a real SMS
5. Enter the 6-digit code from your phone
6. Dashboard loads — you are authenticated ✅

**Tip:** Register test phone numbers with fixed OTPs in Firebase Console → Authentication → Phone → **Test phone numbers**. This lets you test without consuming SMS quota.

---

## Step 9 — Deploy to Production

### Vercel / Netlify
```bash
npm run build   # dist/ folder created
```
Add `VITE_FIREBASE_*` environment variables in your platform's dashboard.

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # public dir: dist
npm run build
firebase deploy --only hosting
```
Add your production domain to Firebase Authorized Domains after deploying.

---

## Security Summary

| ✅ | Measure |
|---|---|
| ✅ | OTP never stored, displayed, or hardcoded |
| ✅ | All Firebase config in `.env.local` (git-ignored) |
| ✅ | `browserLocalPersistence` for session continuity |
| ✅ | Firebase `signOut()` on logout clears server-side token |
| ✅ | Invisible reCAPTCHA v3 prevents automated abuse |
| ✅ | reCAPTCHA reset before each new OTP request |
| ✅ | 30-second resend countdown prevents spam |
| ✅ | All Firebase errors translated to friendly messages |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `auth/operation-not-allowed` | Enable Phone Auth in Firebase Console → Authentication → Sign-in method |
| reCAPTCHA verification fails | Add `localhost` to Firebase Authorized Domains |
| `auth/captcha-check-failed` | Dev server must use HTTPS; Vite `basicSsl` plugin is already configured |
| SMS not received | Check Firebase Console → Authentication → Usage for quota |
| White screen on load | Check browser console — ensure `.env.local` has all `VITE_FIREBASE_*` values |
| `auth/invalid-phone-number` | Enter 10 digits only (without +91); the app prepends the country code |
| `auth/too-many-requests` | Wait ~10 minutes or use Firebase test phone numbers |
