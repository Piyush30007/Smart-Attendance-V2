export default function AttendanceScanner({
  videoRef,
  canvasRef,
  cameraActive,
  cameraError,
  loading,
  autoScan,
  onToggleAutoScan,
  onCapture,
  onStartCamera,
  onStopCamera,
}) {
  return (
    <div className="attendance-scanner-card">
      <div className="scanner-header-bar">
        <div className="scanner-title-group">
          <div className="scanner-icon-badge" aria-hidden="true">
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
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div>
            <h3 className="scanner-title">Live Biometric Terminal</h3>
            <p className="scanner-subtitle">
              Face detection &amp; anti-spoofing verification
            </p>
          </div>
        </div>

        <div className="camera-live-badge">
          <span
            className={`live-pulse-indicator ${cameraActive ? "active" : "inactive"}`}
            aria-hidden="true"
          />
          <span className="live-badge-label">
            {cameraActive ? "Camera Live" : "Camera Standby"}
          </span>
        </div>
      </div>

      {/* Camera Viewport or Error */}
      {cameraError ? (
        <div className="camera-error-container" role="alert">
          <div className="camera-error-icon" aria-hidden="true">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56" />
            </svg>
          </div>
          <h4 className="camera-error-title">Webcam Access Required</h4>
          <p className="camera-error-text">{cameraError}</p>
          <button
            type="button"
            className="btn-retry-webcam"
            onClick={onStartCamera}
          >
            Retry Camera Access
          </button>
        </div>
      ) : (
        <div className="scanner-video-wrapper">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="scanner-video-feed"
          />

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Viewfinder Target Reticle */}
          {cameraActive && (
            <div className="scanner-reticle-overlay" aria-hidden="true">
              <div className="scanner-reticle-box">
                <div className="reticle-corner top-left" />
                <div className="reticle-corner top-right" />
                <div className="reticle-corner bottom-left" />
                <div className="reticle-corner bottom-right" />
                {loading && <div className="scanning-laser-beam" />}
              </div>

              <div className="scanner-guideline-pill">
                {loading ? (
                  <span className="scanning-text">
                    <span className="btn-spinner inline" />
                    Verifying face &amp; liveness...
                  </span>
                ) : autoScan ? (
                  <span className="scanning-text auto-pulse">
                    Auto-scan active • Stand in front of camera
                  </span>
                ) : (
                  <span>Position your face inside the frame</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera Controls Bar */}
      <div className="scanner-controls-bar">
        <button
          type="button"
          onClick={onCapture}
          disabled={!cameraActive || loading}
          className="btn-scan-action mark"
        >
          {loading ? (
            <span className="btn-loading-content">
              <span className="btn-spinner" aria-hidden="true" />
              <span>Verifying Face...</span>
            </span>
          ) : (
            <>
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
              <span>Mark Attendance</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleAutoScan}
          disabled={!cameraActive || loading}
          className={`btn-scan-action autoscan ${autoScan ? "active" : ""}`}
          title={autoScan ? "Stop continuous scanning" : "Start continuous scanning every 3.5s"}
        >
          {autoScan ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              <span>Stop Auto-Scan</span>
            </>
          ) : (
            <>
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
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>Auto-Scan</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={cameraActive ? onStopCamera : onStartCamera}
          className="btn-scan-action toggle"
          disabled={loading}
        >
          {cameraActive ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34" />
              </svg>
              <span>Camera Off</span>
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
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
              <span>Camera On</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
