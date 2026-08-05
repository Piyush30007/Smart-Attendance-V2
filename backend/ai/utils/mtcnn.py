"""
Thin wrapper around MTCNN face detection.
Port the actual detection logic from your existing mtcnn_utils.py here —
this file just defines the interface the rest of the app depends on,
so face_service.py never has to know which detector is behind it.
"""
from typing import List, Tuple
import numpy as np


def detect_faces(frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """
    Returns a list of bounding boxes (x, y, w, h) for detected faces in `frame`.
    TODO: paste in your existing MTCNN detection + eye-keypoint alignment logic.
    """
    raise NotImplementedError("Port MTCNN detection logic from the original mtcnn_utils.py")


def align_face(frame: np.ndarray, box: Tuple[int, int, int, int]) -> np.ndarray:
    """Aligns a cropped face using eye keypoints before encoding."""
    raise NotImplementedError("Port alignment logic from the original mtcnn_utils.py")
