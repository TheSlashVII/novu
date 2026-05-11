from deepface import DeepFace

def verify_face_match(student_id_path: str, selfie_path: str) -> dict:
    try:
        result = DeepFace.verify(
            img1_path=student_id_path,
            img2_path=selfie_path,
            enforce_detection=False
        )
        
        return {
            'match': result['verified'],
            'distance': result['distance'],
            'confidence': round((1 - result['distance']) * 100, 2)
        }
    except Exception as e:
        return {
            'match': False,
            'error': str(e)
        }