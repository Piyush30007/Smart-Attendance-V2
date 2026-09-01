"""
CLI script for capturing/registering a new student's face.
Port your existing register_student.py logic here; have it call
app.services.face_service for detection/embedding instead of duplicating it,
and write directly to PostgreSQL via app.database.database.SessionLocal
instead of a separate SQLite connection.
"""
import sys
import cv2
from app.database.database import SessionLocal
from app.repositories.student_repository import StudentRepository

from ai.detection.detector import FaceDetector
from ai.recognition.embedding import FaceEmbedder
from ai.recognition.storage import save_embeddings
from ai.utils.face_model import create_face_model


def register_student_face(student_id: int):
    db = SessionLocal()
    camera = None
    try:
        # 1. Find the student
        student = StudentRepository.get_by_id(db, student_id)
        if not student:
            print("No student found")
            return
        if not student.is_active:
            print("Student is not active")
            return

        # 2. Create one shared insightface model
        print("Loading face model....")
        model = create_face_model()
        detector = FaceDetector(model)
        embedder = FaceEmbedder(model)

        # 3. Open the camera
        camera = cv2.VideoCapture(0)
        if not camera.isOpened():
            print("Can't open camera")
            return

        print("Camera is started")
        print("Look Directly at the camera!")
        print("Press R to Register")
        print("Press Q to Exit")
        while True:
            ret, frame = camera.read()

            if not ret:
                print("Could Not read camera frame...")
                break

            faces = detector.detect_faces(frame)

            if len(faces) == 1:
                face = faces[0]

                # extract face box from the frame
                x1, y1, x2, y2 = face['bbox']

                # crop the face from the frame
                score = face['score']

                # draw face rectangle
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)

                # add status text
                cv2.putText(frame, f"Score : {score:.2f}", (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            elif len(faces) == 0:
                cv2.putText(frame, "No Face Detected", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

            else:
                cv2.putText(frame, f"{len(faces)} Faces Detected , Only one face allowed", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

            # Show window and listen for keys on every frame
            cv2.imshow("Student Face Registration", frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord('q'):
                print("Registration cancelled by user")
                break

            if key == ord('r'):
                if len(faces) != 1:
                    print("Registration requires exactly one face")
                    continue

                embedding = embedder.get_embedding(frame)

                if embedding is None:
                    print("Could not generate embedding")
                    continue

                # 5. Generate file path and save file
                encoding_path = save_embeddings(student_id, embedding)

                # Save path in database
                student.encoding_path = str(encoding_path)
                db.commit()

                db.refresh(student)

                print("Face Registration Successful...")
                print("Student: ", student.name)
                print("Embedding Path : ", student.encoding_path)
                break

    except Exception:
        db.rollback()
        raise

    finally:
        if camera is not None and camera.isOpened():
            camera.release()
        cv2.destroyAllWindows()
        db.close()


def main():

    if len(sys.argv) != 2:
        print(
            "Usage: python -m "
            "ai.registration.register_student <student_id>"
        )
        return

    try:
        student_id = int(sys.argv[1])
    except ValueError:
        print("Student ID must be an integer.")
        return

    register_student_face(student_id)


if __name__ == "__main__":
    main()               
                        
        
        