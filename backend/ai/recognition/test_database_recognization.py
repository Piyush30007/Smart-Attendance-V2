from app.database.database import SessionLocal
from app.services.student_service import StudentService
from ai.recognition.recognizer import FaceRecognizer

def main():
    db = SessionLocal()
    try:
        registered_embeddings = StudentService.get_registered_face_embeddings(db)
        print("Registered Face Embeddings : ")
        print(registered_embeddings)

        if not registered_embeddings:
            print("No face embeddings found.")
            return 

        recognizer = FaceRecognizer()

        print(f"Found {len(registered_embeddings)}" "registered face embeddings")

        for student_id , path in registered_embeddings.items():
            print(f"Student ID : {student_id}")
            print(f"Face Embedding Path : {path}")

            print("Database-> encoding_path test success")

            
            
    finally:
        db.close()

if __name__ == "__main__":
    main()