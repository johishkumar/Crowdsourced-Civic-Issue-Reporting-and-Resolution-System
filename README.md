# Crowdsourced Civic Issue Reporting & Resolution System (CivicReport)

An interactive, crowdsourced civic issue reporting and resolution portal designed to bridge the gap between citizens, municipal admins, and NGOs for reporting, tracking, and resolving municipal hazards.

---

## 🚀 Live Demo 

- **Local Live Server URL**: [http://https://crowdsourced-civic-issue-reporting-seven.vercel.app/](https://crowdsourced-civic-issue-reporting-seven.vercel.app/) *(Follow standard setup below to launch)*

---

## ✨ Design Aesthetics & Visual Identity
- **Premium Themes**: Sophisticated traditional Indian theme blending rich tones (Saffron, Peacock Blue, and Jewel accents) with modern **Glassmorphism** (backdrop filtration, subtle box shadows, semi-transparent panels).
- **Background Patterns**: Decorative, responsive Rangoli/Mandala configurations with floating animated blur blobs.
- **Dynamic UX**: Hover transitions, micro-animations, loading shimmers, and interactive progress widgets to provide an engaging interface.

---

## 🌟 Core Features

1. **Role-Based Portals**:
   - **Citizen**: Post reports, upvote community concerns, check user XP metrics, view historical reports, and rate resolutions.
   - **Admin/Officer**: Access dashboard analytics, assign departments to reports, log ETA/comments, and toggle issue ticket status.
   - **NGO**: Collaborative action log updates and incident verification feeds.
2. **Interactive Map Layout**:
   - Visualizes incident hotspots (roads, garbage, electricity, etc.) across Jharkhand locations (Khunti, Ranchi, Dhanbad, Jamshedpur) with geospatial overlay controls.
3. **AI-Assistive Reporting Form**:
   - Allows users to report community concerns. Featuring Dialect Voice Input simulation, coordinate matching, category auto-tags, and image upload simulation.
4. **Municipal Red Line (Emergency Mode)**:
   - High-severity portal to report critical hazards (e.g. gas leaks, structural collapse) that issues immediate dispatches to response units.
5. **Gamification & Leaderboard**:
   - Active citizens earn XP values and community badges ("First Reporter", "Community Hero") to encourage civic engagement.
6. **Detailed System Diagnostics**:
   - Integrated charting illustrating monthly trends of reported/resolved issues and category breakdowns.
7. **Multilingual Localizations**:
   - Supports translation sets for **English (en)**, **Hindi (hi)**, **Tamil (ta)**, and **Malayalam (ml)** with dialect configurations for Bihar/Jharkhand regions (Bhojpuri, Maithili, Magahi, Santali).

---

## 🔐 Credentials for Demo Login
Switch tabs on the login dashboard and fill using the quick credentials helper:

| Role Logged In | Email Address | Phone Number | Password / OTP |
|---|---|---|---|
| 👥 **Citizen** | `rajesh@demo.com` | `+911234567890` | Password: `demo123` / OTP: `123456` |
| 🛡️ **Admin** | `priya@demo.com` | `+911234567891` | Password: `admin123` / OTP: `123456` |
| 🌐 **NGO** | `ngo@demo.com` | `+911234567892` | Password: `ngo123` / OTP: `123456` |

---

## 🛠️ CLI Commands & Development Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (version 18+) and [npm](https://www.npmjs.com/) installed on your machine.

### 2. Install Project Dependencies
Run the following cmd from the project root:
```bash
npm install
```

### 3. Run Development Server
Spin up the local hot-refresh server:
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) on your browser.

### 4. Build Production Distribution
Compile and minify static assets for deployment:
```bash
npm run build
```
Build files will be generated under the `/dist` directory.

### 5. Preview Production Build Locally
Spin up a local server to preview the built application:
```bash
npm run preview
```

### 6. Lint Codebase
Scan codebase using Oxlint for fast static analysis check:
```bash
npm run lint
```
