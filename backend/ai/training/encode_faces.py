"""
Batch/incremental encoding script. Port your existing encode_faces.py here.
Writes embeddings as .npy files under models_store/encodings/<student_code>.npy
(or, once pgvector is added, directly as a vector column) instead of a
single shared face_encodings.pkl.
"""
