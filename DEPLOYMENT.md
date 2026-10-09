# Deployment Guide: Crowdsourced Civic Issue Reporting & Resolution System

This repository is ready to be deployed to production cloud platforms (**Vercel**, **Render**, **Railway**, or **Netlify**).

---

## 🚀 Option 1: Render (Recommended for Full-Stack Node.js + Vite + Express)

Render allows you to host both the Express backend API and Vite React frontend seamlessly as a Web Service.

### Step 1: Create a Free MongoDB Atlas Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Create a **Free Shared Cluster (M0)**.
3. Under **Database Access**, create a database user and password.
4. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere).
5. Click **Connect** → **Drivers** and copy your MongoDB connection string (`mongodb+srv://<username>:<password>@cluster.mongodb.net/SIH?retryWrites=true&w=majority`).

### Step 2: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository: `johishkumar/Crowdsourced-Civic-Issue-Reporting-and-Resolution-System`.
3. Configure the Web Service settings:
   - **Name**: `civic-issue-portal` (or any name)
   - **Region**: Choose closest to your users (e.g. Singapore / Frankfurt / Oregon)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add **Environment Variables**:
   - `NODE_ENV` = `production`
   - `SERVE_STATIC` = `true`
   - `MONGODB_URI` = *Your MongoDB Atlas Connection String*
   - `VITE_GEMINI_API_KEY` = *Your Gemini API Key*
   - `TWILIO_ACCOUNT_SID` = *(Optional) Your Twilio SID*
   - `TWILIO_AUTH_TOKEN` = *(Optional) Your Twilio Token*
   - `TWILIO_VERIFY_SERVICE_SID` = *(Optional) Your Twilio Verify Service SID*
5. Click **Create Web Service**. Render will automatically build the React app and start your Express server!

---

## ⚡ Option 2: Vercel (Recommended for React Frontend)

### Step 1: Deploy Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New** → **Project**.
2. Import your GitHub repository `johishkumar/Crowdsourced-Civic-Issue-Reporting-and-Resolution-System`.
3. Vercel automatically detects **Vite**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables in Vercel settings:
   - `VITE_GEMINI_API_KEY` = *Your Gemini API Key*
   - `VITE_FIREBASE_API_KEY` = *Your Firebase Key*
5. Click **Deploy**. Vercel will give you a live production URL (e.g., `https://civic-issue-portal.vercel.app`).

---

## 🚂 Option 3: Railway

1. Go to [Railway.app](https://railway.app/).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select `johishkumar/Crowdsourced-Civic-Issue-Reporting-and-Resolution-System`.
4. Add a **MongoDB Database** plugin inside Railway with 1 click.
5. Railway will set `PORT` and `MONGODB_URI` automatically and host your app live!

---

## 📁 Local Production Test

To test the production build locally on your machine before deploying:

```bash
# 1. Build the Vite production frontend
npm run build

# 2. Set static serving mode & start server
set SERVE_STATIC=true
npm start
```
Then visit `http://localhost:5000` in your browser.
