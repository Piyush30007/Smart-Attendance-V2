"""Similarity matching helpers."""
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity   
class FaceMatcher:
    
    @staticmethod
    def cosine_similarity(embedding1 : np.ndarray , embedding2 : np.ndarray) ->float :
        """Compute cosine similarity between two embeddings."""
        embedding1 = np.asarray(embedding1).reshape(1 , -1)
        embedding2 = np.asarray(embedding2).reshape(1 , -1)

        sim = cosine_similarity(embedding1,embedding2)
        return float(sim[0][0])
   
        