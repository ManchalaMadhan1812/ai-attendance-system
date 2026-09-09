# Real-Time AI Attendance System

A production-ready, full-stack **AI Attendance System** featuring real-time face detection, recognition, automated attendance logging, user profile management, and an interactive glassmorphic web dashboard.

---

## 🌟 Key Features

1. **Real-time Face Detection & Recognition**
   - Web camera integration directly in the browser dashboard.
   - Detects multiple faces in real-time with visual bounding boxes and confidence scores.
   - Intelligent cooldown mechanism to prevent duplicate attendance logs.

2. **User & Student Registration**
   - Upload student/employee profile images.
   - Automatic feature vector calculation & template indexing.
   - Manage registered roster profiles with search and deletion capabilities.

3. **Attendance Records & Export**
   - Automated status assignment (**Present**, **Late**, **Absent**).
   - Filter logs by date range or department.
   - Export official attendance logs to **CSV** or **Excel (.xlsx)**.

4. **Analytics & Dashboard**
   - Live turnout rate breakdown.
   - Department-wise attendance completion metrics.

---

## 📁 Repository Structure

```
AI Attendance System/
├── backend/
│   ├── app.py                 # FastAPI Web Server & API Endpoints
│   ├── face_engine.py         # OpenCV Face Detection & Recognition Engine
│   ├── database.py            # SQLite SQLAlchemy Models
│   ├── requirements.txt       # Python Dependencies
│   └── uploads/               # Registered User Profile Photos
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── LiveFeed.jsx        # Live Webcam Feed & Recognition Bounding Boxes
    │   │   ├── Registration.jsx    # User Registration Module
    │   │   ├── AttendanceLogs.jsx  # Logs Table & Export CSV/Excel
    │   │   └── Analytics.jsx       # Analytics Metrics & Charts
    │   ├── App.jsx                 # Top Navbar & Navigation Layout
    │   ├── main.jsx                # React Entry Point
    │   └── index.css               # Modern Glassmorphic Dark UI Styling
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### 1. Backend Setup (FastAPI & OpenCV)

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Run the backend API server:

```bash
uvicorn app:app --reload --port 8000
```
*Backend API will run at `http://localhost:8000` (API documentation available at `http://localhost:8000/docs`).*

---

### 2. Frontend Setup (React & Vite)

Navigate to the `frontend` directory and install dependencies:

```bash
cd frontend
npm install
```

Start the dev server:

```bash
npm run dev
```
*Frontend dashboard will be accessible at `http://localhost:5173`.*

---

## 🛠️ Tech Stack

- **Backend**: Python 3, FastAPI, OpenCV (`cv2`), SQLAlchemy, SQLite, Pandas, NumPy, Pillow
- **Frontend**: React, Vite, Lucide Icons, Axios, Glassmorphism Vanilla CSS
