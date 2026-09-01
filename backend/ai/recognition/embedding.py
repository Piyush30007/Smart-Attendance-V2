"""Embedding generation helpers."""
import numpy as np 
from insightface.app import FaceAnalysis 
from ai.utils.face_model import create_face_model

class FaceEmbedder:

    def __init__(self, app=None):
        self.app = app if app is not None else create_face_model() 
    
    def get_embedding(self , frame: np.ndarray):
        """ Generate an ArcFace embedding from a BGR OpenCV frame
        Returns : 
                numpy array of shape (512 ,) , or None if no face is detected
        """
        faces = self.app.get(frame)
        if not faces :
            return None
        
        #select the largest face
        face = max(faces , key=lambda f:(f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1]))

        embedding = face.embedding

        #l2 normalize 
        embedding = embedding / np.linalg.norm(embedding)

        return embedding 

