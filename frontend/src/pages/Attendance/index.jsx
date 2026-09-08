import { useState, useEffect, useRef, useCallback } from "react";
import attendanceService from "../../services/attendanceService";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function Attendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionLogs, setSessionLogs] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("camera"); // "camera" or "history"

  const isScanningRef = useRef(false);

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        "Could not access webcam. Please check camera permissions in your browser."
      );
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setAutoScan(false);
  }, []);

  // Initialize camera on mount & cleanup on unmount
  useEffect(() => {
    startCamera();
    fetchTodayHistory();

    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Fetch Attendance History for Today
  const fetchTodayHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data } = await attendanceService.list();
      setHistoryList(data || []);
    } catch (err) {
      console.error("Error loading attendance history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Capture Frame and Mark Attendance
  const captureAndMark = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isScanningRef.current) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert frame to Base64 JPEG string
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);

    isScanningRef.current = true;
    setLoading(true);
    setErrorMessage("");

    try {
      const { data } = await attendanceService.mark(imageBase64);
      setScanResult(data);
      setErrorMessage("");

      // Add to live session logs
      setSessionLogs((prev) => [
        {
          id: data.id || Date.now(),
          student_id: data.student_id,
          student_name: data.student_name,
          student_code: data.student_code,
          course: data.course,
          status: data.status,
          confidence_score: data.confidence_score,
          already_marked: data.already_marked,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.filter((item) => item.student_id !== data.student_id),
      ]);

      // Refresh today's history list
      fetchTodayHistory();
    } catch (err) {
      const errMsg = getErrorMessage(err);
      setErrorMessage(errMsg);
      setScanResult(null);
    } finally {
      setLoading(false);
      isScanningRef.current = false;
    }
  }, []);

  // Auto-Scan interval hook
  useEffect(() => {
    let intervalId = null;

    if (autoScan && cameraActive) {
      intervalId = setInterval(() => {
        if (!isScanningRef.current) {
          captureAndMark();
        }
      }, 3500); // scan every 3.5s in auto mode
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoScan, cameraActive, captureAndMark]);

  return (
    <div className="attendance-page">
      <PageHeader
        title="Live Camera Attendance"
        buttonText={activeTab === "camera" ? "View History" : "Back to Camera"}
        onButtonClick={() =>
          setActiveTab(activeTab === "camera" ? "history" : "camera")
        }
      />

      {activeTab === "camera" ? (
        <div className="attendance-layout">
          {/* LEFT: Camera Viewfinder */}
          <div className="camera-section">
            <Card>
              <div className="camera-header">
                <h3>Live Face Recognition Scanner</h3>
                <div className="camera-status-indicator">
                  <span
                    className={`status-dot ${
                      cameraActive ? "active" : "inactive"
                    }`}
                  />
                  <span>{cameraActive ? "Camera Live" : "Camera Off"}</span>
                </div>
              </div>

              {cameraError ? (
                <div className="camera-error-banner">
                  <p>{cameraError}</p>
                  <button onClick={startCamera}>Retry Camera Access</button>
                </div>
              ) : (
                <div className="video-viewport">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="video-feed"
                  />

                  {/* Hidden Canvas for Frame Capturing */}
                  <canvas ref={canvasRef} style={{ display: "none" }} />

                  {/* Viewfinder Target Reticle */}
                  {cameraActive && (
                    <div className="reticle-overlay">
                      <div className="reticle-box">
                        <div className="corner top-left" />
                        <div className="corner top-right" />
                        <div className="corner bottom-left" />
                        <div className="corner bottom-right" />
                        {loading && <div className="scanning-beam" />}
                      </div>
                      <p className="reticle-hint">
                        {loading
                          ? "Recognizing face..."
                          : "Position your face inside the box"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="camera-controls">
                <button
                  type="button"
                  onClick={captureAndMark}
                  disabled={!cameraActive || loading}
                  className="btn-mark"
                >
                  {loading ? "Processing..." : "📸 Mark Attendance"}
                </button>

                <button
                  type="button"
                  onClick={() => setAutoScan((prev) => !prev)}
                  disabled={!cameraActive}
                  className={`btn-autoscan ${autoScan ? "active" : ""}`}
                >
                  {autoScan ? "⏹ Stop Auto-Scan" : "🔄 Start Auto-Scan"}
                </button>

                <button
                  type="button"
                  onClick={cameraActive ? stopCamera : startCamera}
                  className="btn-toggle-camera"
                >
                  {cameraActive ? "Turn Camera Off" : "Turn Camera On"}
                </button>
              </div>
            </Card>

            {/* Real-time Recognition Result Banner */}
            {scanResult && (
              <div
                className={`scan-result-card ${
                  scanResult.already_marked ? "warning" : "success"
                }`}
              >
                <div className="result-header">
                  <span className="result-icon">
                    {scanResult.already_marked ? "⚠️" : "✅"}
                  </span>
                  <div>
                    <h4>{scanResult.message}</h4>
                    <p className="result-sub">
                      {scanResult.already_marked
                        ? "Student already checked in for today"
                        : "Attendance successfully recorded in PostgreSQL"}
                    </p>
                  </div>
                </div>

                <div className="result-details-grid">
                  <div className="detail-item">
                    <span className="label">Student Name</span>
                    <span className="value student-name">
                      {scanResult.student_name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Student Code</span>
                    <span className="value">{scanResult.student_code}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Course</span>
                    <span className="value">
                      {scanResult.course || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Confidence Score</span>
                    <span className="value score">
                      {scanResult.confidence_score
                        ? `${(
                            parseFloat(scanResult.confidence_score) * 100
                          ).toFixed(1)}%`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date</span>
                    <span className="value">{scanResult.date}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status</span>
                    <span className="badge-present">
                      {scanResult.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="scan-result-card error">
                <div className="result-header">
                  <span className="result-icon">❌</span>
                  <div>
                    <h4>Recognition Failed</h4>
                    <p className="result-sub">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Live Session Activity Stream */}
          <div className="activity-section">
            <Card>
              <div className="activity-header">
                <h3>Today's Live Session Log</h3>
                <span className="count-badge">
                  {sessionLogs.length} Marked
                </span>
              </div>

              {sessionLogs.length === 0 ? (
                <div className="empty-logs">
                  <p>No faces recognized in this session yet.</p>
                  <span className="subtext">
                    Look at the camera and click <strong>Mark Attendance</strong> or enable <strong>Auto-Scan</strong>.
                  </span>
                </div>
              ) : (
                <div className="logs-list">
                  {sessionLogs.map((log) => (
                    <div key={log.id} className="log-item">
                      <div className="log-avatar">
                        {log.student_name?.charAt(0) || "S"}
                      </div>
                      <div className="log-info">
                        <div className="log-title">
                          <strong>{log.student_name}</strong>
                          <span className="log-code">({log.student_code})</span>
                        </div>
                        <div className="log-meta">
                          <span>{log.course}</span>
                          <span>•</span>
                          <span>{log.time}</span>
                          {log.confidence_score && (
                            <>
                              <span>•</span>
                              <span className="log-score">
                                Score: {(parseFloat(log.confidence_score) * 100).toFixed(1)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="log-status">
                        <span
                          className={`badge ${
                            log.already_marked ? "badge-warning" : "badge-success"
                          }`}
                        >
                          {log.already_marked ? "Checked-in" : "Present"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        /* HISTORY TAB */
        <Card>
          <div className="history-header">
            <h3>Database Attendance Records (Today)</h3>
            <button onClick={fetchTodayHistory} disabled={loadingHistory}>
              {loadingHistory ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>

          {loadingHistory ? (
            <LoadingSpinner />
          ) : historyList.length === 0 ? (
            <p style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
              No attendance records found for today.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Student ID</th>
                  <th>Date</th>
                  <th>Check-In Time</th>
                  <th>Status</th>
                  <th>Confidence Score</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((rec) => (
                  <tr key={rec.id}>
                    <td>#{rec.id}</td>
                    <td>Student #{rec.student_id}</td>
                    <td>{rec.date}</td>
                    <td>
                      {rec.check_in_time
                        ? new Date(rec.check_in_time).toLocaleTimeString()
                        : "N/A"}
                    </td>
                    <td>
                      <span className="badge-present">{rec.status}</span>
                    </td>
                    <td>{rec.confidence_score || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}
