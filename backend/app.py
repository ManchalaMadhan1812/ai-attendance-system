import os
import json
import base64
import io
from datetime import datetime, date
from typing import Optional, List

from fastapi import FastAPI, Depends, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
import numpy as np
import cv2
import pandas as pd

from database import init_db, get_db, Student, Attendance
from face_engine import FaceEngine

# Initialize FastAPI App
app = FastAPI(title="AI Attendance System API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB and Face Engine
init_db()
face_engine = FaceEngine(uploads_dir="uploads")

# Mount Uploads dir to serve images
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.on_event("startup")
def startup_event():
    init_db()


@app.get("/")
def root():
    return {"message": "AI Attendance System API Server Running", "status": "online"}


# --- STUDENT MANAGEMENT ENDPOINTS ---

@app.get("/api/students")
def get_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return students


@app.post("/api/students/register")
async def register_student(
    student_id: str = Form(...),
    name: str = Form(...),
    department: str = Form("General"),
    email: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if student ID already exists
    existing = db.query(Student).filter(Student.student_id == student_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Student with ID '{student_id}' already registered.")

    image_bytes = await file.read()
    try:
        image_path, face_encoding_json = face_engine.register_face_image(student_id, name, image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process face image: {str(e)}")

    new_student = Student(
        student_id=student_id,
        name=name,
        department=department,
        email=email,
        image_path=image_path,
        face_encoding=face_encoding_json
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    return {"message": "Student registered successfully", "student": new_student}


@app.put("/api/students/{student_id}")
async def update_student(
    student_id: str,
    name: str = Form(...),
    department: str = Form("General"),
    email: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.name = name
    student.department = department
    student.email = email

    if file:
        image_bytes = await file.read()
        try:
            image_path, face_encoding_json = face_engine.register_face_image(student_id, name, image_bytes)
            student.image_path = image_path
            student.face_encoding = face_encoding_json
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to update face image: {str(e)}")

    db.commit()
    db.refresh(student)
    return {"message": "Student profile updated successfully", "student": student}


@app.delete("/api/students/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Delete uploaded image file if present
    if student.image_path and os.path.exists(student.image_path):
        try:
            os.remove(student.image_path)
        except Exception:
            pass
            
    db.delete(student)
    db.commit()
    return {"message": f"Student {student_id} deleted successfully"}


# --- REAL-TIME FACE RECOGNITION & ATTENDANCE ENDPOINTS ---

@app.post("/api/attendance/recognize-frame")
async def recognize_frame(
    frame_data: dict, # expecting {"image_base64": "data:image/jpeg;base64,..."}
    db: Session = Depends(get_db)
):
    """
    Receives base64 web camera frame, detects faces, performs recognition against DB,
    and automatically logs attendance if matched and not on cooldown.
    """
    raw_b64 = frame_data.get("image_base64", "")
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",")[1]
        
    try:
        image_bytes = base64.b64decode(raw_b64)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid frame base64 data")

    faces = face_engine.detect_faces(img_bgr)
    results = []
    registered_students = db.query(Student).all()
    
    now = datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M:%S")

    for bbox in faces:
        x, y, w, h = [int(v) for v in bbox]
        face_roi = img_bgr[y:y+h, x:x+w]
        
        # Anti-Spoofing Liveness check
        is_live, liveness_score = face_engine.check_liveness(face_roi) if face_roi.size > 0 else (True, 100.0)
        
        face_feature = face_engine.extract_face_feature(img_bgr, (x, y, w, h))
        matched_student, confidence = face_engine.match_face(face_feature, registered_students)
        
        detection_info = {
            "bbox": [x, y, w, h],
            "recognized": False,
            "is_live": is_live,
            "liveness_score": liveness_score,
            "student_id": None,
            "name": "Unknown",
            "confidence": confidence,
            "status_message": "Spoof Alert (Fake Face / Photo Detected)" if not is_live else "Face Detected"
        }

        if matched_student and is_live:
            detection_info["recognized"] = True
            detection_info["student_id"] = matched_student.student_id
            detection_info["name"] = matched_student.name

            # Check duplicate cooldown to prevent spam logging
            if not face_engine.is_cooldown_active(matched_student.student_id, cooldown_seconds=30):
                # Calculate status (e.g. Late if past 09:30 AM)
                cutoff = now.replace(hour=9, minute=30, second=0)
                status_str = "Present" if now <= cutoff else "Late"
                
                # Check if already marked today
                already_marked = db.query(Attendance).filter(
                    Attendance.student_id == matched_student.student_id,
                    Attendance.date == current_date
                ).first()

                if not already_marked:
                    new_attendance = Attendance(
                        student_id=matched_student.student_id,
                        student_name=matched_student.name,
                        department=matched_student.department,
                        timestamp=now,
                        date=current_date,
                        time=current_time,
                        status=status_str,
                        confidence=confidence
                    )
                    db.add(new_attendance)
                    db.commit()
                    face_engine.mark_cooldown(matched_student.student_id)
                    detection_info["status_message"] = f"Attendance Marked ({status_str})!"
                else:
                    face_engine.mark_cooldown(matched_student.student_id)
                    detection_info["status_message"] = f"Already Marked Today ({already_marked.time})"
            else:
                detection_info["status_message"] = "Recognized (Cooldown)"

        results.append(detection_info)

    return {"faces_count": len(faces), "detections": results}


@app.post("/api/attendance/manual-mark")
def manual_mark_attendance(
    student_id: str = Form(...),
    status: str = Form("Present"), # Present, Late, Excused, Absent
    date_str: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    clean_id = student_id.strip()
    student = db.query(Student).filter(Student.student_id.ilike(clean_id)).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student ID '{clean_id}' not found in database roster.")

    now = datetime.now()
    target_date = date_str or now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M:%S")

    # Check if already marked for date
    existing = db.query(Attendance).filter(
        Attendance.student_id == student_id,
        Attendance.date == target_date
    ).first()

    if existing:
        existing.status = status
        db.commit()
        return {"message": f"Attendance for {student.name} updated to {status}", "log": existing}
    else:
        new_attendance = Attendance(
            student_id=student.student_id,
            student_name=student.name,
            department=student.department,
            timestamp=now,
            date=target_date,
            time=current_time,
            status=status,
            confidence=100.0
        )
        db.add(new_attendance)
        db.commit()
        db.refresh(new_attendance)
        return {"message": f"Manual attendance recorded for {student.name}", "log": new_attendance}


@app.delete("/api/attendance/logs/{log_id}")
def delete_attendance_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(Attendance).filter(Attendance.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log record not found")
    db.delete(log)
    db.commit()
    return {"message": "Attendance record deleted successfully"}



# --- ATTENDANCE LOGS & REPORTS ENDPOINTS ---

@app.get("/api/attendance/logs")
def get_attendance_logs(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Attendance)
    
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    if department and department != "All":
        query = query.filter(Attendance.department == department)
        
    logs = query.order_by(Attendance.id.desc()).all()
    return logs


@app.get("/api/attendance/stats")
def get_attendance_stats(db: Session = Depends(get_db)):
    today_str = date.today().strftime("%Y-%m-%d")
    total_students = db.query(Student).count()
    today_attendance = db.query(Attendance).filter(Attendance.date == today_str).all()
    
    present_count = sum(1 for a in today_attendance if a.status == "Present")
    late_count = sum(1 for a in today_attendance if a.status == "Late")
    absent_count = max(0, total_students - (present_count + late_count))

    # Department breakdown
    dept_counts = {}
    students = db.query(Student).all()
    for s in students:
        dept = s.department or "General"
        if dept not in dept_counts:
            dept_counts[dept] = {"total": 0, "present": 0}
        dept_counts[dept]["total"] += 1

    for a in today_attendance:
        dept = a.department or "General"
        if dept in dept_counts:
            dept_counts[dept]["present"] += 1

    return {
        "total_students": total_students,
        "today_present": present_count,
        "today_late": late_count,
        "today_absent": absent_count,
        "attendance_rate": round(((present_count + late_count) / total_students * 100), 1) if total_students > 0 else 0,
        "department_stats": dept_counts
    }


@app.get("/api/attendance/export")
def export_attendance_csv(
    format: str = "csv",
    db: Session = Depends(get_db)
):
    logs = db.query(Attendance).order_by(Attendance.id.desc()).all()
    data = [{
        "ID": log.id,
        "Student ID": log.student_id,
        "Name": log.student_name,
        "Department": log.department,
        "Date": log.date,
        "Time": log.time,
        "Status": log.status,
        "Confidence (%)": log.confidence
    } for log in logs]

    df = pd.DataFrame(data)

    if format == "excel":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Attendance')
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=attendance_report.xlsx"}
        )
    else:
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        response = StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = "attachment; filename=attendance_report.csv"
        return response
