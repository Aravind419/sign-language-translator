import cv2
import os
import time

SIGNS = [
    "Hello", "Goodbye", "Yes", "No", "Please", "Thank_You", "Sorry", "Help", "More", 
    "All_Done", "Eat", "Drink", "Water", "Milk", "Sleep", "Toilet", "Play", "Stop", 
    "Go", "Come", "Mother", "Father", "Baby", "Friend", "Home", "School", "Work", 
    "Book", "Cat", "Dog", "Hot", "Cold", "Happy", "Sad", "Angry", "ILoveYou", 
    "Peace", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", 
    "Ten", "Good", "Bad", "Nice"
]
DATASET_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "asl_dataset")

def capture_dataset():
    if not os.path.exists(DATASET_DIR):
        os.makedirs(DATASET_DIR)
        
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    frames_per_class = 100

    print("====================================")
    print("Welcome to ASL Dataset Capturer!")
    print(f"We will capture 100 images for each of the {len(SIGNS)} signs.")
    print("Get your hand in position, then press 's' to start capturing.")
    print("Press 'q' at any time to quit.")
    print("====================================\n")

    for sign in SIGNS:
        sign_dir = os.path.join(DATASET_DIR, sign)
        if not os.path.exists(sign_dir):
            os.makedirs(sign_dir)
            
        print(f"--> Get ready to capture '{sign}'.")
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Flip horizontally for a mirror effect makes it easier for the user
            frame = cv2.flip(frame, 1)
            display_frame = frame.copy()
            cv2.putText(display_frame, f"Sign: {sign.replace('_', ' ')}", (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(display_frame, "Press 's' to start capturing", (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            cv2.putText(display_frame, "Press 'skip' (k) to skip, 'q' to quit", (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            cv2.imshow('Dataset Capture', display_frame)
            
            key = cv2.waitKey(1)
            if key & 0xFF == ord('s'):
                break
            elif key & 0xFF == ord('k'):
                print(f"Skipping {sign}...")
                break
            elif key & 0xFF == ord('q'):
                print("Exiting capture loop...")
                cap.release()
                cv2.destroyAllWindows()
                return

        if key & 0xFF == ord('k'):
            continue

        print(f"Capturing {frames_per_class} images for '{sign}'...")
        count = 0
        while count < frames_per_class:
            ret, frame = cap.read()
            if not ret:
                break
                
            frame = cv2.flip(frame, 1)
            display_frame = frame.copy()
            
            # Draw progress bar
            progress = int((count / frames_per_class) * 400)
            cv2.rectangle(display_frame, (10, 10), (10 + progress, 30), (0, 255, 0), -1)
            cv2.rectangle(display_frame, (10, 10), (410, 30), (255, 255, 255), 2)
            
            cv2.putText(display_frame, f"Capturing '{sign.replace('_', ' ')}': {count}/{frames_per_class}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            cv2.imshow('Dataset Capture', display_frame)
            
            filename = os.path.join(sign_dir, f"{int(time.time()*1000)}_{count}.jpg")
            # Save the ORIGINAL non-flipped frame IF you want the model to see from camera's true perspective
            # But mediapipe doesn't care much since it detects landmarks.
            cv2.imwrite(filename, frame)
            count += 1
            
            cv2.waitKey(50)  # ~50ms delay -> ~5 seconds per sign
            
    cap.release()
    cv2.destroyAllWindows()
    print("====================================")
    print("Dataset capture complete!")
    print("You can now run 'python train_asl.py' to train your model.")

if __name__ == "__main__":
    capture_dataset()
