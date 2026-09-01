""" Appliation level face processing service 
Responsibilities 

- Face Detection
- Face Embedding generation 
- face recognition 
- Face Registration

No HTTP logic 
NO camera access 
"""
import base64
import cv2 
import numpy as np 
from sqlalchemy.orm import Session

from ai.detection.detector import FaceDetector
from ai.recognition.embedding import FaceEmbedder
from ai.recognition.recognizer import FaceRecognizer

from ai.utils.face_model import create_face_model
from app.repositories.student_repository import StudentRepository
from app.services.student_service import StudentService
from ai.recognition.storage import save_embeddings
from ai.spoof_detection.spoof import is_liveness_pass
# Create once when the application is started
_face_model = create_face_model()
detector = FaceDetector(app=_face_model)
embedder = FaceEmbedder(app=_face_model)
recognizer = FaceRecognizer(threshold=0.60)

def get_face_embedding(frame : np.ndarray)-> np.ndarray | None:
    """
    Generate a 512 D embedding from a frame 
    """
    faces = detector.detect_faces(frame)
    if len(faces) != 1:
        return None 

    face_obj = faces[0].get("face")
    if face_obj is not None and getattr(face_obj, "embedding", None) is not None:
        raw_embedding = face_obj.embedding
        norm = np.linalg.norm(raw_embedding)
        return raw_embedding / norm if norm > 0 else raw_embedding

    return embedder.get_embedding(frame)


def recognize_face(db : Session , frame : np.ndarray):
    """
    Detect and  Recognize student from the frame
    Return :{
    "student" : Student ,
    "similarity_score: : float
    }
    or None if no student is recognized 
    """
    embedding = get_face_embedding(frame)
    if embedding is None:
        return None

    registered_embeddings = StudentService.get_registered_face_embeddings(db)
    if not registered_embeddings:
        return None

    result = recognizer.recognize(embedding, registered_embeddings)
    
    if  result is None :
        return None 

    student = StudentRepository.get_by_id(db , result["student_id"])

    if student is None :
        return None 
    return {
        "student" : student,
        "similarity_score" : result["similarity_score"],
    }


import time

def register_face(db : Session  , student_id : int , image_base64 : str):
    """
    Register a face for a existing student 
    Flow :
    Base64 image
    -> OpenCV frame 
    -> detect exactly one face 
    ->generate embedding 
    ->save embedding 
    ->update encoding_path 
    """
    t0 = time.time()
    print(f"[TRACE] REGISTER FACE REQUEST RECEIVED for student_id={student_id}")

    #1 find student 
    student = StudentRepository.get_by_id(db , student_id)
    if student is None:
        raise ValueError(f"Student with {student_id} not found")

    #2 check student status 
    if not student.is_active:
        raise ValueError("Cannot register face for inactive student")

    #3 remove data uri prefix 
    if "," in image_base64:
         image_base64 = image_base64.split(",", 1)[1]

    #4 decode base64 
    try :
        image_bytes = base64.b64decode(image_base64)
    except Exception as e:
        raise ValueError(f"Invalid base64 string : {str(e)}")
    
    #5 convert to OpenCV format (numpy array) 
    nparr = np.frombuffer(image_bytes , np.uint8)
    frame = cv2.imdecode(nparr , cv2.IMREAD_COLOR)

    if frame is None:
        raise ValueError("Failed to decode image")
    
    print(f"[TRACE] IMAGE DECODED ({time.time() - t0:.2f}s elapsed, frame shape: {frame.shape})")

    #anti spoofing 
    is_live , score , error = is_liveness_pass(frame)
    if error:
        raise ValueError(f"Liveness check failed: {error}")
    if not is_live:
        raise ValueError("Spoof detected. Please use a live face, not a photo or phone screen.")
    
    #6 detect faces 
    t_det = time.time()
    faces = detector.detect_faces(frame)
    print(f"[TRACE] FACE DETECTION COMPLETE ({time.time() - t_det:.2f}s for detection, found {len(faces)} faces)")
    
    if len(faces) == 0 :
        raise ValueError("No face detected in the image.")

    if len(faces) > 1 :
        raise ValueError("Multiple faces detected in the image.")

    #7 generate embedding 
    t_emb = time.time()
    face_obj = faces[0].get("face")
    if face_obj is not None and getattr(face_obj, "embedding", None) is not None:
        raw_embedding = face_obj.embedding
        norm = np.linalg.norm(raw_embedding)
        embedding = raw_embedding / norm if norm > 0 else raw_embedding
    else:
        embedding = embedder.get_embedding(frame)
    print(f"[TRACE] EMBEDDING GENERATED ({time.time() - t_emb:.2f}s for embedding)")

    if embedding is None:
        raise ValueError("Failed to generate embedding") 
    
    #8 Save embedding to disk  
    t_save = time.time()
    encoding_path = save_embeddings(student_id , embedding)
    print(f"[TRACE] EMBEDDING SAVED ({time.time() - t_save:.2f}s to save, path: {encoding_path})")

    #save path in database 
    t_db = time.time()
    student = StudentRepository.update_encoding_path(db , student , str(encoding_path))
    print(f"[TRACE] DATABASE UPDATED ({time.time() - t_db:.2f}s to update DB)")

    print(f"[TRACE] REGISTER FACE COMPLETED in {time.time() - t0:.2f}s total")

    return {
        "student" : student,
        "encoding_path": str(encoding_path)
    }