# 🏛️ Crowdsourced Civic Issue Reporting & Resolution System (CivicReport)

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express.js](https://img.shields.io/badge/Node.js-Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Twilio](https://img.shields.io/badge/SMS_Gateway-Twilio%20%7C%20Textbelt-F22F46?logo=twilio&logoColor=white)](https://www.twilio.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An end-to-end, full-stack crowdsourced civic issue reporting and resolution platform designed to bridge the gap between citizens, municipal administrators, and NGOs for reporting, tracking, verifying, and resolving urban infrastructure hazards and municipal issues in real time.

---

## 🌐 Live Demo & Deployment

- **Vercel Live Web App**: [[https://crowdsourced-civic-issue-reporting-six.vercel.app/](https://crowdsourced-civic-issue-reporting-six.vercel.app/)]
---

## ✨ Design Aesthetics & Visual Identity

- **Cultural & Modern Hybrid Theme**: Features a sophisticated traditional Indian color scheme (Saffron, Deep Teal, Gold, Peacock Blue, and Amber) combined with modern **Glassmorphism** (backdrop blur filters, semi-transparent frosted cards, refined elevation shadows).
- **Dynamic Backgrounds**: Reactive Rangoli and Mandala geometry patterns with floating animated blur blobs.
- **Micro-Animations & Micro-Interactions**: Smooth hover effects, status badge transitions, modal animations, and loading skeletons crafted for a responsive, state-of-the-art user interface.

---

## 🌟 Core Feature Highlights

### 1. 👥 Multi-Role Interactive Portals
- **Citizen Portal**: Report civic issues, upload photos, upvote community concerns, earn XP & badges, track resolution progress, and rate completed resolutions.
- **Municipal Officer / Admin Portal**: Analytics dashboard, assign reports to specific municipal departments, update resolution statuses (Pending, In Progress, Resolved), record ETA, and add officer notes.
- **NGO Collaborative Portal**: Track local community issues, log field action verifications, coordinate cleanup drives, and support civic initiatives.

### 2. 📱 Multi-Provider SMS & OTP Authentication System
- Integrated SMS gateway supporting **Twilio Verify & Messaging**, **Textbelt**, and **Custom Webhook APIs**.
- In-app **SMS Gateway Configuration Modal** to configure Account SIDs, Auth Tokens, and test live SMS delivery to real numbers directly from the frontend.
- Phone number formatting with auto-detection for country codes (defaults to India `+91`).

### 3. 🚨 Municipal Red Line (Emergency Mode)
- High-severity dispatch portal for urgent hazards (e.g. gas leaks, live electrical wire breaks, building collapses).
- Triggers immediate emergency alert banners and prioritizes tickets for rapid municipal response teams.

### 4. 🗺️ Geospatial & Hotspot Mapping
- Visualizes incident locations across regional districts (Khunti, Ranchi, Dhanbad, Jamshedpur) with interactive category filters, status indicators, and coordinate pinpoints.

### 5. 🎤 AI-Assistive & Regional Dialect Voice Input
- Intelligent reporting assistant supporting voice-to-text input with dialect simulation for regional languages (Bhojpuri, Maithili, Magahi, Santali) along with auto-category tagging.

### 6. 🏆 Gamification & Leaderboard System
- Community engagement engine rewarding active citizens with Experience Points (XP) and achievement badges (*"First Reporter"*, *"Community Hero"*, *"Vigilant Citizen"*).

### 7. 📊 Real-Time Analytics & System Diagnostics
- Interactive charts illustrating monthly report submissions, resolution rate metrics, department efficiency breakdowns, and status distribution summaries.

### 8. 🌐 Multilingual Localization
- Complete i18n translation support for **English (en)**, **Hindi (hi)**, **Tamil (ta)**, and **Malayalam (ml)** with instant language toggling across all dashboards.

### 9. 📟 ESP32 RFID Attendance Sub-system (Hardware Extension)
- Includes a dedicated PHP/ESP32 backend module under `/esp32-rfid-attendance` for hardware-integrated municipal officer field attendance logging using RFID cards and OTP verification.

---

## 🔐 Demo Credentials

Quick-fill demo buttons are provided on the Login page for seamless testing:

| Role | Email Address | Phone Number | Password | Demo OTP |
|---|---|---|---|---|
| 👥 **Citizen** | `rajesh@demo.com` | `+911234567890` | `demo123` | `123456` |
| 🛡️ **Admin / Officer** | `priya@demo.com` | `+911234567891` | `admin123` | `123456` |
| 🌐 **NGO Organization** | `ngo@demo.com` | `+911234567892` | `ngo123` | `123456` |

---

## 📂 Repository Structure

```
Crowdsourced-Civic-Issue-Reporting-and-Resolution-System/
├── server.js                     # Express REST API server (Authentication, Issues, SMS, Analytics)
├── index.html                    # Single Page Application HTML root
├── vite.config.js                # Vite build & development server config
├── package.json                  # Dependencies and npm scripts
├── README.md                     # Documentation
├── esp32-rfid-attendance/        # Sub-system for ESP32 RFID Attendance (PHP backend)
│   ├── config.php                # Database & Hardware SMS gateway setup
│   ├── api_attendance.php        # Hardware RFID API endpoint
│   ├── index.php                 # Attendance dashboard UI
│   └── database.sql              # Database structure
├── public/                       # Static public assets & icons
└── src/                          # React Application Source
    ├── App.jsx                   # Main Router & Application Container
    ├── index.css                 # Global CSS & Tailwind design tokens
    ├── Login.jsx                 # Multi-role authentication & OTP portal
    ├── components/               # UI Components
    │   ├── Analytics.jsx         # Analytics charts & performance metrics
    │   ├── AppHeader.jsx         # Top Navigation & Language / SMS settings
    │   ├── IssueCard.jsx         # Individual issue card view
    │   ├── Leaderboard.jsx       # Citizen XP & Gamification board
    │   ├── MunicipalRedLine.jsx  # Emergency hazard reporting portal
    │   ├── ReportIssue.jsx       # AI-assisted issue creation form
    │   ├── SmsSettingsModal.jsx  # Live SMS Gateway Configuration Modal
    │   └── VoiceAssistModal.jsx  # Regional Dialect Voice Input modal
    ├── utils/                    # Utility Functions
    │   ├── authHelper.js         # Authentication helpers & state
    │   ├── mockData.js           # Default civic dataset & mock issues
    │   ├── smsHelper.js          # Multi-provider SMS dispatch engine
    │   └── translations.js       # Multilingual i18n dictionary
```

---

## 🔌 API Endpoints Summary

The backend (`server.js`) exposes the following RESTful API routes:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/auth/login` | User authentication (Password / OTP) |
| `GET` | `/api/issues` | Retrieve all reported civic issues |
| `POST` | `/api/issues` | Create a new civic issue report |
| `PATCH` | `/api/issues/:id` | Update issue status, assign officer, or log ETA |
| `POST` | `/api/issues/:id/upvote` | Upvote a civic issue ticket |
| `GET` | `/api/notifications` | Fetch user notification alerts |
| `GET` | `/api/analytics` | Fetch municipal resolution metrics |
| `POST` | `/twilio-api/*` | Proxy endpoint for Twilio API requests |

---

## 🛠️ CLI Commands & Development Setup

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/johishkumar/Crowdsourced-Civic-Issue-Reporting-and-Resolution-System.git
cd Crowdsourced-Civic-Issue-Reporting-and-Resolution-System
npm install
```

### 3. Running the Server & Application

#### Option A: Start Frontend Dev Server
```bash
npm run dev
```
Access the application at [http://localhost:5173/](http://localhost:5173/).

#### Option B: Start Full-Stack Backend Server
```bash
node server.js
```
The Express backend server runs on `http://localhost:5000/`.

### 4. Production Build & Preview
To create an optimized production bundle:
```bash
npm run build
```
To preview the built production bundle locally:
```bash
npm run preview
```

### 5. Linting & Code Quality
Run fast static analysis checks using Oxlint:
```bash
npm run lint
```

---

## ⚙️ SMS Gateway Configuration

1. Click on the **Gear (⚙️) icon** in the top navigation header or open **SMS Settings**.
2. Select your provider:
   - **Textbelt**: Free tier for instant testing (1 SMS/day per IP).
   - **Twilio**: Enter your `Twilio Account SID`, `Auth Token`, and `From Phone Number`.
   - **Custom API Webhook**: Define custom HTTP Method, Headers, and Body template using `{phone}` and `{message}` placeholders.
3. Test delivery instantly with your 10-digit mobile number in the connection test field.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the [Issues page](https://github.com/johishkumar/Crowdsourced-Civic-Issue-Reporting-and-Resolution-System/issues).
