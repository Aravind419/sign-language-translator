import os
import tensorflow as tf
# Requires TensorFlow 2.x
assert tf.__version__.startswith('2')
from mediapipe_model_maker import gesture_recognizer

# ==========================================
# CUSTOM ASL MODEL TRAINING SCRIPT
# ==========================================

# 1. Prepare your dataset
# Ensure your dataset is in the 'asl_dataset' directory.
# The folder structure MUST be:
# asl_dataset/
# ├── A/ (images of sign A)
# ├── B/ (images of sign B)
# ├── Hello/ (images of sign Hello)
# └── ...
DATASET_PATH = "asl_dataset"

if not os.path.exists(DATASET_PATH):
    print(f"Error: Dataset not found at {DATASET_PATH}.")
    print("Please download an ASL image dataset (e.g., from Kaggle) and place it in the 'asl_dataset' directory.")
    print("Each sign should be in its own subfolder named after the sign.")
    exit(1)

print("Loading dataset and extracting hand landmarks. This may take a while depending on dataset size...")
data = gesture_recognizer.Dataset.from_folder(
    dirname=DATASET_PATH,
    hparams=gesture_recognizer.HandDataPreprocessingParams()
)

# 2. Split the dataset (80% training, 10% validation, 10% testing)
train_data, rest_data = data.split(0.8)
validation_data, test_data = rest_data.split(0.5)

# 3. Set Hyperparameters and Train the Model
print("Training the Custom ASL Gesture Recognizer...")
# You can tweak learning rate, batch size, and epochs here
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EXPORT_DIR = os.path.join(SCRIPT_DIR, '..', '..', 'src', 'assets', 'models')
hparams = gesture_recognizer.HParams(export_dir=EXPORT_DIR, epochs=10)
options = gesture_recognizer.GestureRecognizerOptions(hparams=hparams)

# Train the model!
model = gesture_recognizer.GestureRecognizer.create(
    train_data=train_data,
    validation_data=validation_data,
    options=options
)

# 4. Evaluate the model performance
print("Evaluating the model on the test dataset...")
loss, acc = model.evaluate(test_data, batch_size=1)
print(f"Test loss:{loss}, Test accuracy:{acc}")

# 5. Export the custom .task file
print(f"Exporting the model to '{EXPORT_DIR}/gesture_recognizer.task'...")
model.export_model()
print("\nSuccess! Your custom AI model is ready and injected into the Angular app.")
print("Next steps:")
print("1. Restart your Angular server if it was already running.")
print("2. Navigate to the Sign Detection page and test your custom signs!")
