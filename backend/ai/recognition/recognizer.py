"""Recognition orchestration helpers."""
from pathlib import Path
import numpy as np 
from ai.recognition.matcher import FaceMatcher
from ai.recognition.storage import load_embeddings

class FaceRecognizer:

    def __init__(self , threshold:float =0.60):
        
        self.matcher = FaceMatcher()
        self.threshold = threshold

    def recognize(self , embedding : np.ndarray , registered_embeddings:dict[int , str]):
        """
        Match A Live face embedding against registered  students 

        Args :
        embedding : 512 - dimensional live face embedding 
        registerd_embeddings :
        Dictionart {
        student_id : "path/to/student_embedding.npy 
        }
        Returns {
        "student_id " : int ,
        "similarity_score" : float
        }
        or None if no match pass threshold 
        """
        if embedding is None:
            return None
        
        best_student_id = None 
        best_similarity  = -1.0

        for student_id , path in registered_embeddings.items() :
            if not Path(path).exists():
                continue
            
            stored_embedding = load_embeddings(path)

            if stored_embedding is None:
                continue

            similarity = self.matcher.cosine_similarity(embedding , stored_embedding)

            if similarity > best_similarity :
                best_similarity = similarity
                best_student_id = student_id
        
        if best_student_id is not None and  best_similarity >= self.threshold:
            return {
                "student_id": best_student_id,
                "similarity_score": float(best_similarity)
            }
        
        return None
