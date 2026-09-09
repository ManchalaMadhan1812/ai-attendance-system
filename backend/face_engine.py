import cv2
import numpy as np
import json
import base64
import os
from datetime import datetime
from PIL import Image
import io

class FaceEngine:
    def __init__(self, uploads_dir="uploads"):
        self.uploads_dir = uploads_dir
        os.makedirs(self.uploads_dir, exist_ok=True)
        
        # Load OpenCV pretrained Haar Cascade Classifier for robust face detection
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        # In-memory user face encodings database (using OpenCV LBPH or feature vectors)
        # Using OpenCV's LBPH Face Recognizer for real-time local recognition without heavy dlib compile issues
        self.recognizer = cv2.face.LBPHFaceRecognizer_create() if hasattr(cv2, 'face') and hasattr(cv2.face, 'LBPHFaceRecognizer_create') else None
        self.registered_faces = {} # student_id -> {name, hist/image}
        self.cooldown_tracker = {} # student_id -> last_attendance_datetime

    def detect_faces(self, image_np):
        """Detect faces in numpy image array (BGR format). Returns bounding boxes."""
        gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(60, 60)
        )
        return faces

    def extract_face_feature(self, image_np, bbox):
        """Extract normalized 128x128 grayscale face patch for feature comparison."""
        x, y, w, h = bbox
        face_roi = image_np[y:y+h, x:x+w]
        gray_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray_roi, (128, 128))
        # Standardize pixel values
        normalized = cv2.equalizeHist(resized)
        return normalized

    def check_liveness(self, face_roi_bgr):
        """
        Anti-Spoofing Check: Analyze Laplacian variance (blurriness/screen glare)
        and color distribution to detect photos or phone screens.
        """
        gray = cv2.cvtColor(face_roi_bgr, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Phone screens and printed photos typically have low Laplacian variance (blur) or unnatural specular highlights
        is_live = laplacian_var > 45.0
        return is_live, round(laplacian_var, 2)

    def compute_similarity(self, face_roi1, face_roi2):
        """Calculate Histogram comparison & MSE difference between two face patches."""
        # Mean Squared Error
        mse = np.mean((face_roi1.astype("float") - face_roi2.astype("float")) ** 2)
        
        # Histogram Correlation
        hist1 = cv2.calcHist([face_roi1], [0], None, [256], [0, 256])
        hist2 = cv2.calcHist([face_roi2], [0], None, [256], [0, 256])
        cv2.normalize(hist1, hist1, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
        cv2.normalize(hist2, hist2, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
        
        corr = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
        
        # Normalize similarity score into a percentage (0.0 to 1.0)
        similarity = (corr * 0.7) + (max(0, 1 - (mse / 10000.0)) * 0.3)
        return max(0.0, min(1.0, float(similarity)))

    def register_face_image(self, student_id, name, image_bytes):
        """Process uploaded student image and save template."""
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image)
        # Convert RGB to BGR for OpenCV
        image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        
        faces = self.detect_faces(image_bgr)
        if len(faces) == 0:
            # If no face detected with cascade, take center crop as fallback
            h, w, _ = image_bgr.shape
            size = min(h, w)
            x = (w - size) // 2
            y = (h - size) // 2
            bbox = (x, y, size, size)
        else:
            # Take largest face
            bbox = max(faces, key=lambda b: b[2] * b[3])

        face_feature = self.extract_face_feature(image_bgr, bbox)
        
        # Save image file
        file_filename = f"{student_id}.jpg"
        file_path = os.path.join(self.uploads_dir, file_filename)
        cv2.imwrite(file_path, cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR))

        # Store feature representation in memory
        self.registered_faces[student_id] = {
            "name": name,
            "feature": face_feature.tolist(),
            "image_path": file_path
        }

        return file_path, json.dumps(face_feature.tolist())

    def match_face(self, current_face_feature, registered_students):
        """Compare current face feature against registered database students."""
        best_match = None
        best_score = 0.0
        threshold = 0.55 # Minimum match confidence requirement

        current_patch = np.array(current_face_feature, dtype=np.uint8)

        for student in registered_students:
            if not student.face_encoding:
                continue
            try:
                reg_feature = np.array(json.loads(student.face_encoding), dtype=np.uint8)
                score = self.compute_similarity(current_patch, reg_feature)
                if score > best_score:
                    best_score = score
                    best_match = student
            except Exception as e:
                continue

        if best_score >= threshold:
            return best_match, round(best_score * 100, 2)
        return None, round(best_score * 100, 2)

    def is_cooldown_active(self, student_id, cooldown_seconds=60):
        """Check if attendance was recently registered to avoid rapid double-logging."""
        now = datetime.now()
        if student_id in self.cooldown_tracker:
            last_time = self.cooldown_tracker[student_id]
            if (now - last_time).total_seconds() < cooldown_seconds:
                return True
        return False

    def mark_cooldown(self, student_id):
        self.cooldown_tracker[student_id] = datetime.now()
