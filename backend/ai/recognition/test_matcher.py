import numpy as np

from ai.recognition.matcher import FaceMatcher


def main():

    matcher = FaceMatcher()

    a = np.random.rand(512).astype(np.float32)

    # Same vector
    b = a.copy()

    # Completely different random vector
    c = np.random.rand(512).astype(np.float32)

    same_score = matcher.cosine_similarity(a, b)
    different_score = matcher.cosine_similarity(a, c)

    print("Same embedding similarity:", same_score)
    print("Different embedding similarity:", different_score)


if __name__ == "__main__":
    main()