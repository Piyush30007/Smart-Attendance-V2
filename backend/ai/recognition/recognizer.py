"""Recognition orchestration helpers."""
from pathlib import Path
import numpy as np 
from ai.recognition.matcher import FaceMatcher
from ai.recognition.storage import load_embeddings

class FaceRecognizer:

    def __init__(self, threshold: float = 0.60):
        self.matcher = FaceMatcher()
        self.threshold = threshold

        # student_id -> normalized face embedding (512,)
        self.embeddings: dict[int, np.ndarray] = {}

        # All registered embeddings stacked as one matrix: shape (N, 512)
        self.embedding_matrix: np.ndarray | None = None 

        # Matrix row index -> student_id mapping
        self.student_ids: list[int] = []

        # Tracks last loaded registered keys to prevent reloading from disk on every frame
        self._last_registered_keys: set[int] | None = None

    def load_registered_embeddings(self, registered_embeddings: dict[int, str]):
        """
        Load all registered embeddings from disk into RAM.
        
        Args:
            registered_embeddings: Dict {student_id: "path/to/student_embedding.npy"}
        """
        self.embeddings = {}
        for student_id, path in registered_embeddings.items():
            if not Path(path).exists():
                continue

            stored_embedding = load_embeddings(path)
            if stored_embedding is None:
                continue
            
            stored_embedding = np.asarray(stored_embedding, dtype=np.float32).reshape(-1)

            # Normalize the stored embedding
            norm = np.linalg.norm(stored_embedding)
            if norm <= 1e-12:
                continue
            stored_embedding = stored_embedding / norm 
            self.embeddings[student_id] = stored_embedding

        # Build matrix after loading all embeddings
        self._rebuild_matrix()
        self._last_registered_keys = set(registered_embeddings.keys())

    def _rebuild_matrix(self):
        """
        Rebuild the embedding matrix and student_ids index from the in-memory cache.
        """
        if not self.embeddings:
            self.embedding_matrix = None 
            self.student_ids = []
            return

        self.student_ids = list(self.embeddings.keys())
        self.embedding_matrix = np.vstack([
            self.embeddings[student_id]
            for student_id in self.student_ids
        ]).astype(np.float32)
    
    def update_embedding(self, student_id: int, path: str):
        """
        Add or update one student's embedding in the RAM cache.
        Used immediately after face registration.
        """
        if not Path(path).exists():
            return

        stored_embedding = load_embeddings(path)
        if stored_embedding is None:
            return 
        
        stored_embedding = np.asarray(stored_embedding, dtype=np.float32).reshape(-1)

        norm = np.linalg.norm(stored_embedding)
        if norm <= 1e-12:
            return
        stored_embedding = stored_embedding / norm 
        
        # Update RAM cache & rebuild matrix
        self.embeddings[student_id] = stored_embedding
        if self._last_registered_keys is not None:
            self._last_registered_keys.add(student_id)
        self._rebuild_matrix()
    
    def remove_embedding(self, student_id: int):
        """
        Remove a student's embedding from the RAM cache.
        Used when a student is deleted or their face registration is removed.
        """
        if student_id in self.embeddings:
            self.embeddings.pop(student_id, None)
            if self._last_registered_keys is not None:
                self._last_registered_keys.discard(student_id)
            self._rebuild_matrix()

    def recognize(self, embedding: np.ndarray, registered_embeddings: dict[int, str] | None = None):
        """
        Match a live face embedding against registered students in RAM.

        Args:
            embedding: 512-dimensional live face embedding
            registered_embeddings: Dictionary {student_id: "path/to/student_embedding.npy"}

        Returns:
            Dict {"student_id": int, "similarity_score": float} or None
        """
        if embedding is None:
            return None

        # ---------------------------------------------------------
        # RAM Cache Initialization & Sync
        # ---------------------------------------------------------
        if registered_embeddings is not None:
            registered_keys = set(registered_embeddings.keys())
            if self.embedding_matrix is None or self._last_registered_keys != registered_keys:
                self.load_registered_embeddings(registered_embeddings)

        # No registered faces in RAM
        if self.embedding_matrix is None or len(self.embedding_matrix) == 0:
            return None 

        # Prepare and normalize live embedding
        embedding = np.asarray(embedding, dtype=np.float32).reshape(-1)
        norm = np.linalg.norm(embedding)
        if norm <= 1e-12:
            return None 
        embedding = embedding / norm 

        # ---------------------------------------------------------
        # Vectorized cosine similarity (Matrix Multiplication)
        # embedding_matrix: (N, 512)
        # live embedding:   (512,)
        # result:           (N,)
        # ---------------------------------------------------------
        similarities = self.embedding_matrix @ embedding 

        # Find the highest similarity
        best_index = int(np.argmax(similarities))
        best_similarity = float(similarities[best_index])

        # Threshold check
        if best_similarity < self.threshold:
            return None

        best_student_id = self.student_ids[best_index]

        return {
            "student_id": best_student_id,
            "similarity_score": best_similarity
        }
