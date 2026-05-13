# backend/novu/userAPI/face_recognition_utils.py

import cv2
import numpy as np
from deepface import DeepFace
import tempfile
import os


def extraer_cara_mas_grande(imagen_bgr):
    """
    Given a BGR OpenCV array, detects all faces and returns
    the cropped region of the largest face.
    Returns None if no face is detected.
    """
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    gris = cv2.cvtColor(imagen_bgr, cv2.COLOR_BGR2GRAY)
    caras = face_cascade.detectMultiScale(gris, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))

    if len(caras) == 0:
        return None

    # Keep the largest face (biggest area)
    cara_grande = max(caras, key=lambda c: c[2] * c[3])
    x, y, w, h = cara_grande
    return imagen_bgr[y:y+h, x:x+w]


def verificar_caras(photo_student_id_file, photo_id_selfie_file):
    """
    Receives two Django InMemoryUploadedFile objects:
      - photo_student_id_file: photo of the student ID card
      - photo_id_selfie_file:  selfie of the user holding the ID card next to their face

    Returns a dict with:
      - verified (bool): True if both faces match
      - distance (float): distance between embeddings (lower = more similar)
      - error (str | None): error message if something goes wrong
    """
    tmp_cara_carnet = None
    tmp_cara_selfie = None

    try:
        # --- Read images from uploaded files ---
        carnet_bytes = np.frombuffer(photo_student_id_file.read(), np.uint8)
        selfie_bytes = np.frombuffer(photo_id_selfie_file.read(), np.uint8)

        img_carnet = cv2.imdecode(carnet_bytes, cv2.IMREAD_COLOR)
        img_selfie = cv2.imdecode(selfie_bytes, cv2.IMREAD_COLOR)

        if img_carnet is None or img_selfie is None:
            return {"verified": False, "distance": None, "error": "Could not read one of the uploaded images."}

        # --- For the ID card: let DeepFace detect the face itself ---
        # The photo on the ID card is small, so we pass the full image
        # and let DeepFace find the face with its own detector
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
            tmp_cara_carnet = f.name
            cv2.imwrite(tmp_cara_carnet, img_carnet)

        # --- For the selfie: extract the largest face (the user, not the card) ---
        cara_selfie = extraer_cara_mas_grande(img_selfie)
        if cara_selfie is None:
            return {"verified": False, "distance": None, "error": "No face detected in the selfie."}

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
            tmp_cara_selfie = f.name
            cv2.imwrite(tmp_cara_selfie, cara_selfie)

        # --- Face verification with DeepFace ---
        resultado = DeepFace.verify(
            img1_path=tmp_cara_carnet,
            img2_path=tmp_cara_selfie,
            model_name="Facenet512",
            detector_backend="retinaface",  # better detector for small faces
            enforce_detection=False,
            threshold=0.68,
        )

        return {
            "verified": resultado["verified"],
            "distance": resultado["distance"],
            "error": None,
        }

    except Exception as e:
        return {"verified": False, "distance": None, "error": str(e)}

    finally:
        for path in [tmp_cara_carnet, tmp_cara_selfie]:
            if path and os.path.exists(path):
                os.remove(path)