<div align="center">

# 🎓 AI Attendance System

### Real-Time Face Recognition Attendance Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.9-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

A production-ready, full-stack attendance management platform powered by **real-time AI face detection & recognition** — built with a glassmorphic dark-mode dashboard.

[🚀 Live Demo](#) · [📖 API Docs](#api-reference) · [🐛 Report Bug](https://github.com/ManchalaMadhan1812/ai-attendance-system/issues) · [💡 Request Feature](https://github.com/ManchalaMadhan1812/ai-attendance-system/issues)

</div>

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🎥 **Live Face Recognition** | Real-time webcam feed with bounding boxes, confidence scores & name labels |
| 👤 **Student Registration** | Upload profile photos, auto-extract face embeddings & index them |
| 📋 **Attendance Logs** | Auto-assigned status (Present / Late / Absent) with date & department filters |
| 📊 **Analytics Dashboard** | Live turnout rate, department-wise completion metrics & trend charts |
| 📥 **Export Reports** | Download attendance logs as **CSV** or **Excel (.xlsx)** |
| 🔒 **Admin Portal** | Protected admin view for manual attendance marking & roster management |
| ⚡ **Smart Cooldown** | Prevents duplicate attendance entries per recognition session |

---

## 🖥️ Tech Stack

### Frontend
- **React 19** + **Vite 8** — lightning-fast HMR dev experience
- **React Router v7** — client-side SPA routing
- **Axios** — HTTP client for REST API calls
- **Lucide React** — crisp icon set
- **Vanilla CSS** — custom glassmorphic dark UI (no frameworks)

### Backend
- **FastAPI** — async Python REST API with auto-generated Swagger docs
- **OpenCV (cv2)** — real-time face detection & recognition engine
- **SQLAlchemy** + **SQLite** — lightweight ORM & embedded database
- **Pandas + OpenPyXL** — attendance report generation & Excel export
- **NumPy + Pillow** — image processing & face embedding math

---

## 📁 Project Structure

```
ai-attendance-system/
├── backend/
│   ├── app.py              # FastAPI routes & API endpoints
│   ├── face_engine.py      # OpenCV face detection & recognition engine
│   ├── database.py         # SQLAlchemy models (Student, Attendance)
│   ├── requirements.txt    # Python dependencies
│   └── uploads/            # Registered user profile photos
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LiveFeed.jsx          # Webcam feed & face bounding boxes
│   │   │   ├── Registration.jsx      # Student registration module
│   │   │   ├── AttendanceLogs.jsx    # Logs table & CSV/Excel export
│   │   │   ├── Analytics.jsx         # Metrics & department charts
│   │   │   ├── AdminPortal.jsx       # Admin-only management panel
│   │   │   └── ManualMarkModal.jsx   # Manual attendance marking
│   │   ├── App.jsx                   # Top navbar & routing layout
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Glassmorphic dark UI styles
│   ├── .env.example                  # Required environment variables
│   ├── package.json
│   └── vite.config.js
│
├── netlify.toml            # Netlify build & SPA redirect config
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+
- A system camera / webcam

---

### 1. Clone the Repository

```bash
git clone https://github.com/ManchalaMadhan1812/ai-attendance-system.git
cd ai-attendance-system
```

---

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app:app --reload --port 8000
```

> Backend API runs at **`http://localhost:8000`**  
> Interactive API docs available at **`http://localhost:8000/docs`**

---

### 3. Frontend Setup

```bash
cd frontend

# Copy environment variables
cp .env.example .env
# Edit .env and set VITE_API_URL=http://localhost:8000

# Install dependencies
npm install

# Start the dev server
npm run dev
```

> Frontend dashboard runs at **`http://localhost:5173`**

---

## ⚙️ Environment Variables

The frontend reads the backend URL from a single env variable:

```env
# frontend/.env
VITE_API_URL=http://localhost:8000
```

For production (e.g., deployed backend on Railway/Render):
```env
VITE_API_URL=https://your-backend.railway.app
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/students` | List all registered students |
| `POST` | `/api/students/register` | Register a new student with photo |
| `DELETE` | `/api/students/{id}` | Remove a student from roster |
| `POST` | `/api/attendance/recognize` | Run face recognition on a frame |
| `GET` | `/api/attendance/logs` | Fetch attendance logs (with filters) |
| `GET` | `/api/attendance/stats` | Get dashboard analytics stats |
| `GET` | `/api/attendance/export/csv` | Export logs as CSV |
| `GET` | `/api/attendance/export/excel` | Export logs as Excel (.xlsx) |

> Full interactive API documentation: **`http://localhost:8000/docs`**

---

## 🌐 Deployment

### Frontend → Netlify
The `netlify.toml` at the root auto-configures the build:

```toml
[build]
  base    = "frontend"
  command = "npm install && npm run build"
  publish = "frontend/dist"
```

1. Connect your GitHub repo on [Netlify](https://app.netlify.com)
2. Build settings are auto-detected from `netlify.toml`
3. Add environment variable `VITE_API_URL` pointing to your hosted backend
4. Deploy ✨

### Backend → Railway / Render
Recommended free-tier platforms for hosting the FastAPI backend:
- **[Railway](https://railway.app)** — Auto-detects Python, connects to GitHub
- **[Render](https://render.com)** — Free tier, supports FastAPI + uvicorn

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Made with ❤️ by [ManchalaMadhan1812](https://github.com/ManchalaMadhan1812)

⭐ **Star this repo if you found it helpful!**

</div>
