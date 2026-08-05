"""
Optional secondary verifier / fallback using DeepFace, and home of the
liveness-detection helpers (blink, head movement, anti-spoofing).
"""
import numpy as np


def verify_liveness(frames: list[np.ndarray]) -> bool:
    """
    Runs a liveness check across a short burst of frames.
    Suggested approach:
      1. Blink detection via eye-aspect-ratio (EAR) across frames
      2. Head-movement / challenge-response (ask user to turn left/right)
      3. DeepFace anti-spoofing model as a final check
    TODO: implement using the plan discussed — this is the single biggest
    upgrade from "face lookup" to "real biometric attendance system".
    """
    raise NotImplementedError("Implement blink/head-movement/anti-spoofing liveness check")
