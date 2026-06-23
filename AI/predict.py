import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image

model = tf.keras.models.load_model(
    "models/plant_disease_model.keras"
)

with open("labels.txt", "r") as f:
    class_names = [line.strip() for line in f.readlines()]

img_path = input("Enter image path: ")

img = image.load_img(img_path, target_size=(224,224))
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0)
img_array = img_array / 255.0

prediction = model.predict(img_array)

print("\nRaw Predictions:")
for i, prob in enumerate(prediction[0]):
    print(f"{class_names[i]} : {prob*100:.2f}%")

predicted_class = class_names[np.argmax(prediction)]
confidence = np.max(prediction) * 100

print("\nDisease:", predicted_class)
print("Confidence:", round(confidence, 2), "%")