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
        "Could not access webcam. Please ensure camera permissions are granted in your browser settings."
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
      setErrorMessage("Camera feed is warming up. Please hold still for a moment.");
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert captured frame to Base64 JPEG string
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await studentService.registerFace(id, imageBase64);
      const msg = response?.data?.message || "Biometric face profile registered successfully!";
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
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-face-title"
    >
      <div className="face-modal-card">
        {/* Modal Header */}
        <div className="face-modal-header">
          <div className="face-modal-info">
            <div className="face-icon-badge" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h2 id="register-face-title" className="face-modal-title">
                Register Student Face ID
              </h2>
              <p className="face-modal-subtitle">
                Student: <strong>{name}</strong>{" "}
                {studentCode && <span className="student-code-tag">{studentCode}</span>}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="form-close-btn"
            title="Close modal"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Camera Live Status Bar */}
        <div className="camera-status-bar">
          <div className="camera-live-indicator">
            <span
              className={`live-status-dot ${cameraActive ? "active" : "inactive"}`}
              aria-hidden="true"
            />
            <span className="live-status-label">
              {cameraActive ? "Live Video Feed" : "Camera Disconnected"}
            </span>
          </div>

          {cameraActive && !loading && (
            <span className="camera-guideline-hint">
              Align face within the frame
            </span>
          )}
        </div>

        {/* Camera Viewport or Error */}
        {cameraError ? (
          <div className="camera-error-banner" role="alert">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{cameraError}</p>
            <button
              type="button"
              className="btn-retry-camera"
              onClick={startCamera}
            >
              Retry Camera Access
            </button>
          </div>
        ) : (
          <div className="responsive-video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="responsive-video-feed"
            />

            {/* Hidden canvas for snapshot rasterization */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Target Reticle Overlay */}
            {cameraActive && (
              <div className="reticle-overlay" aria-hidden="true">
                <div className="responsive-reticle-box">
                  <div className="corner top-left" />
                  <div className="corner top-right" />
                  <div className="corner bottom-left" />
                  <div className="corner bottom-right" />
                  {loading && <div className="scanning-beam" />}
                </div>
                <p className="reticle-hint">
                  {loading
                    ? "Extracting facial embedding vectors..."
                    : "Look directly into the camera"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Success Message Banner */}
        {successMessage && (
          <div className="auth-alert success" role="status">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message Banner */}
        {errorMessage && (
          <div className="auth-alert error" role="alert">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="face-modal-actions">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="btn-modal-cancel"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCaptureAndRegister}
            disabled={!cameraActive || loading || Boolean(successMessage)}
            className="btn-capture-face"
          >
            {loading ? (
              <span className="btn-loading-content">
                <span className="btn-spinner" aria-hidden="true"></span>
                <span>Registering Face ID...</span>
              </span>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Capture &amp; Register</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
