"""
Owns the face-detection -> alignment -> embedding pipeline.
This is the ONLY layer that talks to app/utils/*. Routes and other
services never call the detector/model utils directly.
"""
import numpy as np
from ai.utils import mtcnn, insightface
from app.core.logging import get_logger

logger = get_logger(__name__)


def get_face_embedding(frame: np.ndarray) -> np.ndarray | None:
    boxes = mtcnn_utils.detect_faces(frame)
    if not boxes:
        logger.info("No face detected in frame")
        return None

    aligned = mtcnn_utils.align_face(frame, boxes[0])
    embedding = insightface_utils.get_embedding(aligned)
    return embedding
