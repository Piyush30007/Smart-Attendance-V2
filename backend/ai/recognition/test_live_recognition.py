import cv2

from app.database.database import SessionLocal
from app.services.student_service import StudentService

from ai.detection.detector import FaceDetector
from ai.recognition.embedding import FaceEmbedder
from ai.recognition.recognizer import FaceRecognizer
from ai.utils.face_model import create_face_model


def main():
    db = SessionLocal()
    camera = None

    try:
        print("Loading Registered Face embeddings...")
        registered_embeddings = StudentService.get_registered_face_embeddings(db)

        if not registered_embeddings:
            print("No registered faces found.")
            return
        print(f"Found {len(registered_embeddings)} registered face embeddings")

        # Cache student names for display
        students = StudentService.list_students(db)
        student_names = {s.id: s.name for s in students}

        # One shared insightface model
        model = create_face_model()
        detector = FaceDetector(model)
        embedder = FaceEmbedder(model)

        recognizer = FaceRecognizer(threshold=0.6)

        camera = cv2.VideoCapture(0)
        if not camera.isOpened():
            print("Could not open camera")
            return 

        print("Camera is started")
        print("Looking Directly at the camera!")
        print("Press Q to exit")

        while True:
            ret, frame = camera.read()
            if not ret:
                print("Could not read frame")
                break

            faces = detector.detect_faces(frame)
            if len(faces) == 1:
                face = faces[0]
                x1, y1, x2, y2 = face['bbox']
                score = face['score']

                # Draw face rectangle
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)

                # Add status text
                cv2.putText(frame, f"Score : {score:.2f}", (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

                # Get Embedding and recognize
                embedding = embedder.get_embedding(frame)

                if embedding is not None:
                    result = recognizer.recognize(embedding, registered_embeddings)

                    if result:
                        student_id = result["student_id"]
                        similarity = result["similarity_score"]
                        student_name = student_names.get(student_id, "Unknown Student")

                        print(f"Matched: {student_name} (ID: {student_id}) Similarity Score: {similarity:.4f}")
                        cv2.putText(frame, f"{student_name} ({similarity:.2f})", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                    else:
                        print("No match found")
                        cv2.putText(frame, "No Match Found", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            elif len(faces) == 0:
                cv2.putText(frame, "No Face Detected", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            else:
                cv2.putText(frame, f"{len(faces)} Faces Detected, Only one face allowed", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

            cv2.imshow("Live Face Recognition", frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"):
                print("Exiting")
                break

    finally:
        if camera is not None and camera.isOpened():
            camera.release()
        cv2.destroyAllWindows()
        db.close()


if __name__ == "__main__":
    main()
