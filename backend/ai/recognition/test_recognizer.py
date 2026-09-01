import numpy as np

from ai.recognition.recognizer import FaceRecognizer
from ai.recognition.storage import save_embeddings


def main():

    # Create a fake registered student embedding
    student_embedding = np.random.rand(512).astype(np.float32)

    student_embedding = (
        student_embedding /
        np.linalg.norm(student_embedding)
    )

    path = save_embeddings(
        1,
        student_embedding
    )

    recognizer = FaceRecognizer(
        threshold=0.60
    )

    registered_embeddings = {
        1: path
    }

    # Use the same embedding as the live face
    result = recognizer.recognize(
        student_embedding,
        registered_embeddings
    )

    print("Recognition result:")
    print(result)


if __name__ == "__main__":
    main()