print("TEST FILE STARTED")
import cv2
from ai.detection.detector import FaceDetector
from ai.recognition.embedding import FaceEmbedder
import numpy as np 
from ai.utils.face_model import create_face_model


def main():

    print("Creating face detector.....")
    model = create_face_model() 

    detector = FaceDetector(model) 

    print("Creating face embedder.....")
    embedder = FaceEmbedder(model)     
    camera = cv2.VideoCapture(0)
    
    if not camera.isOpened():
        print("Error: Could not open Camera")
        return 

    print("Camera Started . Press Q to exit...")
    while True:
        ret , frame = camera.read()
        if not ret:
            print("Error: Could not Read Frame")
            break

        #step1 : detect faces using SCRFD
        faces = detector.detect_faces(frame)

        for face in faces:
            x1, y1, x2, y2 = face["bbox"]
            score = face["score"]

            cv2.rectangle(frame , (x1 , y1),(x2 , y2),(255,0,0),2)
            cv2.putText(frame , f"Face {score:.2f}" , (x1 , y1 - 10) , cv2.FONT_HERSHEY_SIMPLEX , 0.6 , (255,0,0),2)

        #step2 : Generate ArcFace embedding
        embedding = embedder.get_embedding(frame)
        
        if embedding is not None:
            print("embedding Shape: ", embedding.shape , "Norm :" , np.linalg.norm(embedding))

            cv2.putText(frame , "Embedding Generated : ", (20,40) , cv2.FONT_HERSHEY_SIMPLEX , 0.8, (0,255,0),2)
        else: 
            cv2.putText(frame , "No Embedding Generated" , (20 , 40) , cv2.FONT_HERSHEY_SIMPLEX , 0.8, (0,0,255),2) 
        cv2.imshow("Face Detection Test" , frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    camera.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
            