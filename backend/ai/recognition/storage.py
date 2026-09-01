from pathlib import Path
import numpy as np 

BASE_DIR = Path(__file__).resolve().parents[2]
ENCODING_DIR = BASE_DIR/"data"/"face_encodings"
ENCODING_DIR.mkdir(parents=True , exist_ok=True)

def save_embeddings(student_id : int , embedding: np.ndarray) -> Path :
    """Save a embedding vector to disk with student-specific filename.
    Returns:
    Path object representing the saved file location
    """
    file_path = ENCODING_DIR/f"{student_id}.npy"
    np.save(file_path , embedding)
    return str(file_path) 

def load_embeddings(path: str ) -> np.ndarray :
    """Load embedding for a student ID, return None if not found"""
    
    return np.load(path) 