export default function RecognitionResult({
  scanResult,
  errorMessage,
  loading,
  cameraActive,
}) {
  // 1. Loading State
  if (loading) {
    return (
      <div className="recognition-result-card processing">
        <div className="res-header">
          <div className="res-icon-circle processing">
            <span className="btn-spinner" aria-hidden="true" />
          </div>
          <div>
            <h4 className="res-title">Verifying Face &amp; Liveness...</h4>
            <p className="res-sub">Extracting facial landmarks and anti-spoofing vectors</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State (Spoof, No face, Multiple faces, Not recognized, Server error)
  if (errorMessage) {
    const isSpoof = errorMessage.toLowerCase().includes("spoof");
    const isNoFace = errorMessage.toLowerCase().includes("no face");
    const isMultipleFaces = errorMessage.toLowerCase().includes("multiple faces");
    const isNotRecognized =
      errorMessage.toLowerCase().includes("not recognized") ||
      errorMessage.toLowerCase().includes("not registered");

    let title = "Recognition Failed";
    let hint = "Verify that the student is registered with a valid Face ID.";

    if (isSpoof) {
      title = "Liveness Check Failed (Spoof Detected)";
      hint = "Physical presence check failed. Please ensure a real person is directly facing the camera.";
    } else if (isNoFace) {
      title = "No Face Detected";
      hint = "Please look straight into the camera lens with good lighting.";
    } else if (isMultipleFaces) {
      title = "Multiple Faces Detected";
      hint = "Only one person should be in the camera frame when marking attendance.";
    } else if (isNotRecognized) {
      title = "Face Not Recognized";
      hint = "No registered student matched this face. Please ensure you have enrolled your Face ID.";
    } else {
      title = "Attendance Processing Error";
      hint = "An unexpected error occurred. Please check network connectivity and try again.";
    }

    return (
      <div className="recognition-result-card error">
        <div className="res-header">
          <div className="res-icon-circle error">
            <svg
              width="20"
              height="20"
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
          </div>
          <div>
            <h4 className="res-title">{title}</h4>
            <p className="res-sub">{errorMessage}</p>
          </div>
        </div>

        <div className="res-help-hint">{hint}</div>
      </div>
    );
  }

  // 3. Success / Already Marked State
  if (scanResult) {
    const isAlreadyMarked = Boolean(scanResult.already_marked);

    return (
      <div
        className={`recognition-result-card ${
          isAlreadyMarked ? "warning" : "success"
        }`}
      >
        <div className="res-header">
          <div
            className={`res-icon-circle ${
              isAlreadyMarked ? "warning" : "success"
            }`}
          >
            {isAlreadyMarked ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
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
            )}
          </div>
          <div>
            <h4 className="res-title">{scanResult.message}</h4>
            <p className="res-sub">
              {isAlreadyMarked
                ? "Student attendance was already logged for today"
                : "Verified and saved to database"}
            </p>
          </div>
        </div>

        <div className="res-details-grid">
          {scanResult.student_name && (
            <div className="res-detail-item">
              <span className="res-detail-label">Student Name</span>
              <span className="res-detail-val highlight">
                {scanResult.student_name}
              </span>
            </div>
          )}

          {scanResult.student_code && (
            <div className="res-detail-item">
              <span className="res-detail-label">Student Code</span>
              <span className="res-detail-val code">
                {scanResult.student_code}
              </span>
            </div>
          )}

          {scanResult.course && (
            <div className="res-detail-item">
              <span className="res-detail-label">Course</span>
              <span className="res-detail-val">{scanResult.course}</span>
            </div>
          )}

          {scanResult.date && (
            <div className="res-detail-item">
              <span className="res-detail-label">Date</span>
              <span className="res-detail-val">{scanResult.date}</span>
            </div>
          )}

          {scanResult.status && (
            <div className="res-detail-item">
              <span className="res-detail-label">Status</span>
              <span className="res-detail-val">
                <span className="status-pill present">
                  <span className="status-dot present" />
                  {scanResult.status.toUpperCase()}
                </span>
              </span>
            </div>
          )}

          {scanResult.confidence_score !== null &&
            scanResult.confidence_score !== undefined && (
              <div className="res-detail-item">
                <span className="res-detail-label">Verification Score</span>
                <span className="res-detail-val score">
                  Match score: {scanResult.confidence_score}
                </span>
              </div>
            )}
        </div>
      </div>
    );
  }

  // 4. Default Ready State
  return (
    <div className="recognition-result-card standby">
      <div className="res-header">
        <div className="res-icon-circle standby">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div>
          <h4 className="res-title">Terminal Ready</h4>
          <p className="res-sub">
            {cameraActive
              ? "Position your face in the camera and click 'Mark Attendance'"
              : "Turn on the camera to begin face recognition"}
          </p>
        </div>
      </div>
    </div>
  );
}
