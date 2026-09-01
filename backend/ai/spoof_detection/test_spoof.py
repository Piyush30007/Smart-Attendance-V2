"""
Mannual webcam test for deepface antispoofing 
Press :
Q->quit 
S->test the current frame 
"""

import cv2
from ai.spoof_detection.spoof import is_liveness_pass

def main():
    camera = cv2.VideoCapture(0)
    if not camera.isOpened():
        print("Error opening camera")
        return 

    while True :
        ret , frame = camera.read()
        if not ret:
            print("Could Not  read camera frame")
            break

        cv2.imshow("LivenessTest" , frame)
        keyy = cv2.waitKey(1) & 0xFF

        if keyy == ord("q"):
            break 
        
        if keyy == ord("s"):
            is_live, score, err = is_liveness_pass(frame)
            if err:
                print(f"Liveness check failed : {err}")
            else:
                if is_live:
                    print(
                        f"Liveness Check : PASS | "
                        f"Score: {score:.4f}"
                    )
                else:
                    print(
                        f"Liveness Check : FAIL | "
                        f"Score: {score:.4f}"
                    )

    camera.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()