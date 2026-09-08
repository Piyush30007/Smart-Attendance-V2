from insightface.app import FaceAnalysis
import onnxruntime as ort

print("ONNX providers:", ort.get_available_providers())

def create_face_model():
    app = FaceAnalysis(
        name="buffalo_s", #scrfd is bundled  inside the buffalo_s model so we don't need to provide separate det name  
        providers=["CPUExecutionProvider"], #load model on CPU
        allowed_modules=["detection", "recognition"], #detection load SCRFD
    )

    app.prepare(
        ctx_id=0,
        det_size=(320, 320) #input size of the SCRFD detector 
    )

    return app