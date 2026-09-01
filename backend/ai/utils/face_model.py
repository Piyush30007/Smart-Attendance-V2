from insightface.app import FaceAnalysis

def create_face_model():
    app = FaceAnalysis(name ="buffalo_l" , providers = ["CPUExecutionProvider"])
    app.prepare(ctx_id=0, det_size=(640,640))
    return app 
    
    
    
    