import { useState, useEffect, useRef, useCallback } from "react";
import studentService from "../../services/studentService";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function RegisterFaceModal({
  studentId,
  studentName,
  student,
  onClose,
  onSuccess,
}) {
  const id = studentId || student?.id;
  const name = studentName || student?.name;
  const studentCode = student?.student_code;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const startCamera = async () => {
    try {
      setCameraError("");
      setErrorMessage("");
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

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCaptureAndRegister = async () => {
    if (!videoRef.current || !canvasRef.current || loading) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      setErrorMessage("Camera feed is not ready yet. Please wait a moment.");
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert frame to Base64 JPEG string
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await studentService.registerFace(id, imageBase64);
      const msg = response?.data?.message || "Face registered successfully!";
      setSuccessMessage(msg);

      if (onSuccess) {
        await onSuccess();
      }

      setTimeout(() => {
        stopCamera();
        if (onClose) {
          onClose();
        }
      }, 1500);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleClose();
        }
      }}
    >
      <div
        className="modal-content"
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "560px",
          padding: "24px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1e293b" }}>
              Register Student Face
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.875rem",
                color: "#64748b",
              }}
            >
              Student: <strong>{name}</strong>{" "}
              {studentCode ? `(${studentCode})` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "0 6px",
              lineHeight: 1,
            }}
            title="Close"
          >
            &times;
          </button>
        </div>

        {/* Camera Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div className="camera-status-indicator">
            <span
              className={`status-dot ${cameraActive ? "active" : "inactive"}`}
            />
            <span>{cameraActive ? "Camera Live" : "Camera Off"}</span>
          </div>
          {cameraActive && !loading && (
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Position face inside the frame
            </span>
          )}
        </div>

        {/* Camera Viewport or Error */}
        {cameraError ? (
          <div className="camera-error-banner" style={{ marginBottom: "16px" }}>
            <p style={{ margin: "0 0 12px 0" }}>{cameraError}</p>
            <button type="button" onClick={startCamera}>
              Retry Camera Access
            </button>
          </div>
        ) : (
          <div
            className="video-viewport"
            style={{ height: "320px", marginBottom: "16px" }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-feed"
            />

            {/* Hidden canvas for snapshot */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Viewfinder Target Reticle */}
            {cameraActive && (
              <div className="reticle-overlay">
                <div
                  className="reticle-box"
                  style={{ width: "190px", height: "210px" }}
                >
                  <div className="corner top-left" />
                  <div className="corner top-right" />
                  <div className="corner bottom-left" />
                  <div className="corner bottom-right" />
                  {loading && <div className="scanning-beam" />}
                </div>
                <p className="reticle-hint">
                  {loading
                    ? "Registering face embedding..."
                    : "Look directly at the camera"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Success Message Banner */}
        {successMessage && (
          <div
            className="scan-result-card success"
            style={{ marginTop: "0", marginBottom: "16px" }}
          >
            <div className="result-header" style={{ marginBottom: 0 }}>
              <span className="result-icon">✅</span>
              <div>
                <h4 style={{ color: "#15803d" }}>Face Registered Successfully</h4>
                <p className="result-sub">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message Banner */}
        {errorMessage && (
          <div
            className="scan-result-card error"
            style={{ marginTop: "0", marginBottom: "16px" }}
          >
            <div className="result-header" style={{ marginBottom: 0 }}>
              <span className="result-icon">❌</span>
              <div>
                <h4 style={{ color: "#dc2626" }}>Registration Failed</h4>
                <p className="result-sub">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            marginTop: "16px",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            style={{
              background: "#e2e8f0",
              color: "#334155",
              fontWeight: "600",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCaptureAndRegister}
            disabled={!cameraActive || loading || !!successMessage}
            className="btn-mark"
            style={{
              minWidth: "160px",
            }}
          >
            {loading ? "Registering..." : "📸 Capture & Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
