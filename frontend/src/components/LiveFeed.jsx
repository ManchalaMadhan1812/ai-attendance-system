import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function LiveFeed() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState([]);
  const [latestRecognition, setLatestRecognition] = useState(null);
  const [fps, setFps] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  // Start Webcam
  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMsg("Unable to access webcam. Please check browser camera permissions.");
    }
  };

  // Stop Webcam
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Frame Capture & Face Recognition Loop
  useEffect(() => {
    let intervalId;
    let frameCount = 0;
    let lastTime = performance.now();

    const processFrame = async () => {
      if (!isStreaming || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Data = canvas.toDataURL('image/jpeg', 0.8);

      try {
        const response = await axios.post(`${API_BASE}/api/attendance/recognize-frame`, {
          image_base64: base64Data
        });

        const detectedList = response.data.detections || [];
        setDetections(detectedList);

        // Track FPS
        frameCount++;
        const now = performance.now();
        if (now - lastTime >= 1000) {
          setFps(frameCount);
          frameCount = 0;
          lastTime = now;
        }

        // Highlight recent attendance log event
        const newlyRecognized = detectedList.find(d => d.recognized && d.status_message.includes('Marked'));
        if (newlyRecognized) {
          setLatestRecognition({
            name: newlyRecognized.name,
            student_id: newlyRecognized.student_id,
            status: newlyRecognized.status_message,
            time: new Date().toLocaleTimeString()
          });
        }
      } catch (err) {
        console.error("Recognition API error:", err);
      }
    };

    if (isStreaming) {
      intervalId = setInterval(processFrame, 400); // 2.5 FPS analysis rate
    }

    return () => clearInterval(intervalId);
  }, [isStreaming]);

  // Draw Bounding Boxes on Overlay Canvas
  useEffect(() => {
    if (!overlayCanvasRef.current || !videoRef.current) return;
    const overlay = overlayCanvasRef.current;
    const ctx = overlay.getContext('2d');
    
    overlay.width = videoRef.current.videoWidth || 640;
    overlay.height = videoRef.current.videoHeight || 480;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    detections.forEach(det => {
      const [x, y, w, h] = det.bbox;
      const isRecognized = det.recognized;
      const isLive = det.is_live !== false;

      // Color scheme: Emerald for Recognized, Cyan for Unrecognized, Rose for Spoof/Fake Photo
      let strokeColor = '#06b6d4';
      if (!isLive) strokeColor = '#f43f5e';
      else if (isRecognized) strokeColor = '#10b981';
      
      // Draw Bounding Box
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      // Label background
      let bgColor = 'rgba(6, 182, 212, 0.85)';
      if (!isLive) bgColor = 'rgba(244, 63, 94, 0.85)';
      else if (isRecognized) bgColor = 'rgba(16, 185, 129, 0.85)';
      
      ctx.fillStyle = bgColor;
      let labelText = isRecognized ? `${det.name} (${det.confidence}%)` : `Unknown Face (${det.confidence}%)`;
      if (!isLive) labelText = "SPOOF ALERT (Fake Photo/Screen)";

      ctx.font = 'bold 13px Inter, sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      
      ctx.fillRect(x, y - 28 > 0 ? y - 28 : y, textWidth + 16, 26);

      // Label Text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, x + 8, (y - 28 > 0 ? y - 28 : y) + 18);
    });
  }, [detections]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
      {/* Video Stream Box */}
      <div className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Camera color="#06b6d4" size={24} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Live AI Vision Feed</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>
              {fps} Processing FPS
            </span>
            <button onClick={isStreaming ? stopCamera : startCamera} className="gradient-btn" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              <RefreshCw size={16} />
              {isStreaming ? 'Toggle Feed' : 'Start Camera'}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Video Canvas Container */}
        <div style={{ position: 'relative', width: '100%', height: '480px', borderRadius: '12px', overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            playsInline
            muted
          />
          {/* Overlay for Bounding Boxes */}
          <canvas
            ref={overlayCanvasRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          />
          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {!isStreaming && (
            <div style={{ position: 'absolute', textAlign: 'center', color: '#6b7280' }}>
              <Camera size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Camera is currently paused</p>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Detections Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Latest Recognized Alert */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Sparkles color="#8b5cf6" size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Live Recognition Alert</h3>
          </div>

          {latestRecognition ? (
            <div className="glass-card" style={{ padding: '14px', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <CheckCircle color="#10b981" size={20} />
                <span style={{ fontWeight: 600, color: '#10b981' }}>Attendance Verified</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f9fafb' }}>{latestRecognition.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '4px' }}>ID: {latestRecognition.student_id}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '8px' }}>Logged at {latestRecognition.time}</div>
            </div>
          ) : (
            <div style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>
              Awaiting face detection...
            </div>
          )}
        </div>

        {/* Current Frame Active Detections */}
        <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <UserCheck color="#06b6d4" size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Faces in View ({detections.length})</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
            {detections.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                No faces detected in video frame
              </p>
            ) : (
              detections.map((det, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: det.recognized ? '#10b981' : '#38bdf8' }}>
                      {det.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {det.status_message}
                    </div>
                  </div>
                  <span className={`status-badge ${det.recognized ? 'present' : 'absent'}`}>
                    {det.confidence}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
