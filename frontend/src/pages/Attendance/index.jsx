import { useState, useEffect, useRef, useCallback } from "react";
import attendanceService from "../../services/attendanceService";
import dashboardService from "../../services/dashboardService";
import studentService from "../../services/studentService";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Toast from "../../components/common/Toast";

import AttendanceStats from "./AttendanceStats";
import AttendanceScanner from "./AttendanceScanner";
import RecognitionResult from "./RecognitionResult";
import SessionActivityLog from "./SessionActivityLog";
import AttendanceHistoryTable from "./AttendanceHistoryTable";

import { getErrorMessage } from "../../utils/getErrorMessage";
import "./Attendance.css";

export default function Attendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const isScanningRef = useRef(false);

  // Active view: "terminal" (Scanner & Session) or "records" (Full Database History)
  const [activeView, setActiveView] = useState("terminal");

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoScan, setAutoScan] = useState(false);

  // Verification results & logs
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionLogs, setSessionLogs] = useState([]);
  const [toast, setToast] = useState(null);

  // Real backend statistics & records
  const [stats, setStats] = useState({
    students: 0,
    present: 0,
    absent: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [historyList, setHistoryList] = useState([]);
  const [studentMap, setStudentMap] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
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
        "Could not access webcam. Please check camera permissions in your browser settings."
      );
      setCameraActive(false);
    }
  }, []);

  // Stop Camera Stream
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

  // Fetch real statistics from backend
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const { data } = await dashboardService.getStats();
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch attendance records and student lookup
  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const [attendanceRes, studentsRes] = await Promise.allSettled([
        attendanceService.list(),
        studentService.list(),
      ]);

      if (
        studentsRes.status === "fulfilled" &&
        Array.isArray(studentsRes.value?.data)
      ) {
        const map = {};
        studentsRes.value.data.forEach((st) => {
          map[st.id] = st;
        });
        setStudentMap(map);
      }

      if (
        attendanceRes.status === "fulfilled" &&
        Array.isArray(attendanceRes.value?.data)
      ) {
        setHistoryList(attendanceRes.value.data);
      }
    } catch (err) {
      console.error("Error fetching attendance history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    startCamera();
    fetchStats();
    fetchAttendanceData();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera, fetchStats, fetchAttendanceData]);

  // Capture current camera frame and send to verification endpoint
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

    // Generate Base64 JPEG frame
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);

    isScanningRef.current = true;
    setLoading(true);
    setErrorMessage("");

    try {
      const { data } = await attendanceService.mark(imageBase64);
      setScanResult(data);
      setErrorMessage("");

      // Update in-memory session logs
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
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev.filter((item) => item.student_id !== data.student_id),
      ]);

      // Show toast confirmation
      if (data.already_marked) {
        setToast({
          type: "success",
          message: `${data.student_name} (${data.student_code}): ${data.message}`,
        });
      } else {
        setToast({
          type: "success",
          message: `Attendance marked for ${data.student_name} (${data.student_code})`,
        });
      }

      // Re-fetch backend history and summary stats to keep counts live
      fetchAttendanceData();
      fetchStats();
    } catch (err) {
      const errMsg = getErrorMessage(err);
      setErrorMessage(errMsg);
      setScanResult(null);
    } finally {
      setLoading(false);
      isScanningRef.current = false;
    }
  }, [fetchAttendanceData, fetchStats]);

  // Auto-Scan interval hook (runs every 3.5s when active)
  useEffect(() => {
    let intervalId = null;

    if (autoScan && cameraActive) {
      intervalId = setInterval(() => {
        if (!isScanningRef.current) {
          captureAndMark();
        }
      }, 3500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoScan, cameraActive, captureAndMark]);

  return (
    <div className="attendance-page">
      {/* Toast Feedback */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header with Action Mode Switch */}
      <PageHeader
        title="Attendance Management"
        subtitle="Live AI facial recognition terminal &amp; verified institutional attendance logs"
      />

      {/* Section B: Today's Real Attendance Statistics */}
      <AttendanceStats stats={stats} loading={loadingStats} />

      {/* Segmented View Tabs */}
      <div className="attendance-nav-tabs" role="tablist" aria-label="Attendance Views">
        <button
          type="button"
          role="tab"
          aria-selected={activeView === "terminal"}
          className={`att-tab-btn ${activeView === "terminal" ? "active" : ""}`}
          onClick={() => setActiveView("terminal")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span>Live Biometric Terminal</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeView === "records"}
          className={`att-tab-btn ${activeView === "records" ? "active" : ""}`}
          onClick={() => setActiveView("records")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Attendance Records Log ({historyList.length})</span>
        </button>
      </div>

      {/* Section A: Live Biometric Terminal */}
      {activeView === "terminal" && (
        <div className="terminal-split-layout">
          {/* Left Column: Camera Viewport & Controls */}
          <AttendanceScanner
            videoRef={videoRef}
            canvasRef={canvasRef}
            cameraActive={cameraActive}
            cameraError={cameraError}
            loading={loading}
            autoScan={autoScan}
            onToggleAutoScan={() => setAutoScan((prev) => !prev)}
            onCapture={captureAndMark}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
          />

          {/* Right Column: Real-time Feedback & Session Activity */}
          <div className="terminal-right-column">
            <RecognitionResult
              scanResult={scanResult}
              errorMessage={errorMessage}
              loading={loading}
              cameraActive={cameraActive}
            />

            <SessionActivityLog logs={sessionLogs} />
          </div>
        </div>
      )}

      {/* Section C: Attendance Records / History */}
      {activeView === "records" && (
        <Card>
          <AttendanceHistoryTable
            records={historyList}
            studentMap={studentMap}
            loading={loadingHistory}
            onRefresh={fetchAttendanceData}
          />
        </Card>
      )}
    </div>
  );
}
