# Custom Sign Language AI Trainer

This tool uses [MediaPipe Model Maker](https://developers.google.com/mediapipe/solutions/customization/gesture_recognizer) to train a lightweight Neural Network on your custom sign language gestures using Transfer Learning.

## How to train your own ASL model
1. **Prepare Python Environment**:
   ```bash
   cd tools/train-asl
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

2. **Download an Image Dataset**:
   Download a dataset of hands performing signs (like the [ASL Alphabet Dataset on Kaggle](https://www.kaggle.com/datasets/grassknoted/asl-alphabet)). 
   Extract it so the images exist within `tools/train-asl/asl_dataset/<sign_name>/image.jpg`.

3. **Run the Trainer**:
   ```bash
   python train_asl.py
   ```
   > *Note: This process extracts 3D coordinates from the images first, then trains the classifier. It is highly recommended to run this on a machine with a dedicated GPU or on Google Colab if the dataset is large.*

4. **Integrate into the Web App**:
   The script exports a `.task` file into the `exported_model/` directory.
   - Copy `exported_model/gesture_recognizer.task` to `src/assets/models/custom_gesture.task`
   - In `sign-detection.component.ts`, change the `modelAssetPath` URL to point to your new `.task` file.
   - Update the `signMapping` dictionary to translate your new literal class names to their display meanings.
