from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from PIL import Image
from io import BytesIO

app = Flask(__name__)
CORS(app)

model = tf.keras.models.load_model(
    "models/plant_disease_model.keras"
)

with open("labels.txt", "r") as f:
    class_names = [line.strip() for line in f.readlines()]


@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({
            "error": "No image uploaded"
        }), 400

    file = request.files["image"]

    # Read image using PIL
    img = Image.open(BytesIO(file.read()))
    img = img.resize((224, 224))

    img_array = np.array(img)

    if len(img_array.shape) == 2:
        img_array = np.stack(
            (img_array,) * 3,
            axis=-1
        )

    img_array = img_array / 255.0
    img_array = np.expand_dims(
        img_array,
        axis=0
    )

    prediction = model.predict(img_array)

    class_index = np.argmax(prediction)

    disease = class_names[class_index]

    confidence = float(
        np.max(prediction) * 100
    )

    return jsonify({
        "disease": disease,
        "confidence": round(confidence, 2)
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )