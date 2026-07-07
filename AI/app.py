from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
from io import BytesIO
import sys

app = Flask(__name__)
CORS(app)

# ── Load model ONCE at startup ──────────────────────────────────────────────
model = None
try:
    model = tf.keras.models.load_model("models/plant_disease_model.keras")
    print("[Flask] Model loaded successfully.", flush=True)
    print(f"[Flask] Model input shape: {model.input_shape}", flush=True)
except Exception as e:
    print(f"[Flask] ERROR loading model: {e}", file=sys.stderr, flush=True)

# ── Load labels ONCE at startup ──────────────────────────────────────────────
class_names = []
try:
    with open("labels.txt", "r") as f:
        class_names = [line.strip() for line in f.readlines() if line.strip()]
    print(f"[Flask] Labels loaded ({len(class_names)}): {class_names}", flush=True)
except Exception as e:
    print(f"[Flask] ERROR loading labels: {e}", file=sys.stderr, flush=True)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "labels_loaded": len(class_names),
        "labels": class_names
    })


@app.route("/predict", methods=["POST"])
def predict():

    if model is None:
        return jsonify({"success": False, "message": "Disease model not loaded."}), 500

    if not class_names:
        return jsonify({"success": False, "error": "Labels file failed to load."}), 500

    if "image" not in request.files:
        return jsonify({"success": False, "error": "No image uploaded"}), 400

    file = request.files["image"]
    print(f"[Flask] Image received: filename={file.filename}, content_type={file.content_type}", flush=True)

    try:
        raw_bytes = file.read()
        print(f"[Flask] Raw image bytes: {len(raw_bytes)}", flush=True)

        # Open and convert to RGB (handles RGBA, grayscale, palette modes)
        img = Image.open(BytesIO(raw_bytes)).convert("RGB")
        print(f"[Flask] Original image size: {img.size}, mode: {img.mode}", flush=True)

        img = img.resize((224, 224))
        print(f"[Flask] Resized image size: {img.size}", flush=True)

        img_array = np.array(img, dtype=np.float32)
        print(f"[Flask] Array shape before expand: {img_array.shape}", flush=True)
        print(f"[Flask] Pixel range: min={img_array.min():.2f}, max={img_array.max():.2f}", flush=True)

        # Normalize to [0, 1]
        img_array = img_array / 255.0

        # Add batch dimension → (1, 224, 224, 3)
        img_array = np.expand_dims(img_array, axis=0)
        print(f"[Flask] Tensor shape sent to model: {img_array.shape}", flush=True)
        print(f"[Flask] Normalized pixel range: min={img_array.min():.4f}, max={img_array.max():.4f}", flush=True)

        # Run prediction
        prediction = model.predict(img_array, verbose=0)
        print(f"[Flask] Raw prediction array: {prediction.tolist()}", flush=True)

        class_index = int(np.argmax(prediction))
        confidence = float(np.max(prediction) * 100)
        disease = class_names[class_index]

        print(f"[Flask] Predicted class index: {class_index}", flush=True)
        print(f"[Flask] Disease: {disease}", flush=True)
        print(f"[Flask] Confidence: {round(confidence, 2)}%", flush=True)

        return jsonify({
            "disease": disease,
            "confidence": round(confidence, 2)
        })

    except Exception as e:
        print(f"[Flask] Prediction error: {e}", file=sys.stderr, flush=True)
        return jsonify({"success": False, "error": f"Prediction failed: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=False  # debug=True reloads and double-loads model; keep False
    )