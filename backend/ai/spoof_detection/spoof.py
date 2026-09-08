"""Anti-spoofing helpers for liveness validation."""

import cv2
import time 
import numpy as np
from deepface import DeepFace


def is_liveness_pass(frame):
    """Check whether the frame contains a real/live face.

    Args:
        frame: BGR opencv image

    Returns:
        (True, score, None)  -> live face
        (False, score, None) -> spoof / invalid
        (False, 0.0, error)  -> processing error
    """
    if frame is None:
        return False, 0.0, "Frame is None"

    if not isinstance(frame, np.ndarray) or frame.size == 0:
        return False, 0.0, "Invalid frame"
    # Temporary debugging information
    print(
        f"[Liveness] frame shape={frame.shape}, "
        f"dtype={frame.dtype}, "
        f"min={frame.min()}, "
        f"max={frame.max()}"
    )

    try:
        t0 = time.perf_counter()
        results = DeepFace.extract_faces(
            img_path=frame,
            detector_backend="opencv",
            enforce_detection=True,
            align=True,
            anti_spoofing=True,
        )
        deepface_time = (time.perf_counter()-t0)*1000 
        print(f"DeepFace time = {deepface_time} ms")
        print(f"[Liveness] results count = {len(results)}")
        print(f"[Liveness] results = {results}")
        if not results:
            return False, 0.0, "No Face Detected"
        if len(results)!=1:
            return False,0.0,"Multi face detected "
        face = results[0]
        is_real = bool(face.get("is_real", False))
        score = float(face.get("antispoof_score", 0.0))

        return is_real, score, None
    except Exception as e:
        return False, 0.0, str(e)