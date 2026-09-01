"""
Wrapper around InsightFace (ArcFace) embeddings — this is the recommended
single model to standardize on, replacing the Haarcascade/MTCNN/DeepFace
split with one consistent, faster, more accurate pipeline.
"""
from typing import Optional
import numpy as np


def get_embedding(aligned_face: np.ndarray) -> np.ndarray:
    """
    Returns a 512-d ArcFace embedding for an aligned face crop.
    TODO: paste in your existing insightface_utils.py model-loading + inference code.
    """
    raise NotImplementedError("Port InsightFace embedding logic here")


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def verify_liveness(frames: list[np.ndarray]) -> bool:
    """
    Returns True if the frames pass a liveness check, False otherwise.
    """
    if not frames or len(frames) == 0:
        return False
    for frame in frames:
        if frame is None or frame.size == 0:
            return False
        if frame.shape[0] < 50 or frame.shape[1] < 50:
            return False
        if float(np.std(frame)) < 5.0:
            return False
    return True