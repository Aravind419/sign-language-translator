import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonBackButton
} from '@ionic/angular/standalone';
// @ts-ignore
import { FilesetResolver, GestureRecognizer, DrawingUtils } from '@mediapipe/tasks-vision';
import { addIcons } from 'ionicons';
import { volumeHigh } from 'ionicons/icons';

@Component({
  selector: 'app-sign-detection',
  templateUrl: './sign-detection.component.html',
  styleUrls: ['./sign-detection.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonBackButton
  ]
})
export class SignDetectionComponent implements OnInit, OnDestroy {
  @ViewChild('webcamVideo', { static: true }) webcamVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('outputCanvas', { static: true }) outputCanvas!: ElementRef<HTMLCanvasElement>;
  
  gestureRecognizer!: GestureRecognizer;
  runningMode: 'IMAGE' | 'VIDEO' = 'VIDEO';
  webcamRunning: boolean = false;
  lastVideoTime = -1;
  animationFrameId = 0;

  detectedSign = '';
  detectedMeaning = 'Waiting for sign...';
  
  readonly signMapping: Record<string, string> = {
    // Default model fallback mappings
    'Thumb_Up': 'Good / Yes',
    'Thumb_Down': 'Bad / No',
    'Open_Palm': 'Hello',
    'Closed_Fist': 'Sorry',
    'Victory': 'Peace',
    'Pointing_Up': 'One',
    // Custom ASL 50 Signs
    'Hello': 'Hello',
    'Goodbye': 'Goodbye',
    'Yes': 'Yes',
    'No': 'No',
    'Please': 'Please',
    'Thank_You': 'Thank You',
    'Sorry': 'Sorry',
    'Help': 'Help',
    'More': 'More',
    'All_Done': 'All Done',
    'Eat': 'Eat',
    'Drink': 'Drink',
    'Water': 'Water',
    'Milk': 'Milk',
    'Sleep': 'Sleep',
    'Toilet': 'Toilet',
    'Play': 'Play',
    'Stop': 'Stop',
    'Go': 'Go',
    'Come': 'Come',
    'Mother': 'Mother',
    'Father': 'Father',
    'Baby': 'Baby',
    'Friend': 'Friend',
    'Home': 'Home',
    'School': 'School',
    'Work': 'Work',
    'Book': 'Book',
    'Cat': 'Cat',
    'Dog': 'Dog',
    'Hot': 'Hot',
    'Cold': 'Cold',
    'Happy': 'Happy',
    'Sad': 'Sad',
    'Angry': 'Angry',
    'ILoveYou': 'I love you',
    'Peace': 'Peace',
    'One': 'One',
    'Two': 'Two',
    'Three': 'Three',
    'Four': 'Four',
    'Five': 'Five',
    'Six': 'Six',
    'Seven': 'Seven',
    'Eight': 'Eight',
    'Nine': 'Nine',
    'Ten': 'Ten',
    'Good': 'Good',
    'Bad': 'Bad',
    'Nice': 'Nice'
  };

  speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  lastSpokenMeaning = '';

  constructor() {
    addIcons({ volumeHigh });
  }

  async ngOnInit() {
    if (typeof window === 'undefined') return;
    await this.initializeGestureRecognizer();
    this.enableCam();
  }

  ngOnDestroy() {
    if (typeof window === 'undefined') return;
    this.webcamRunning = false;
    if (this.animationFrameId) {
        // @ts-ignore
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.webcamVideo?.nativeElement?.srcObject) {
      const stream = this.webcamVideo.nativeElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }

  async initializeGestureRecognizer() {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.x/wasm'
    );
    this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'assets/models/gesture_recognizer.task',
        delegate: 'GPU'
      },
      runningMode: this.runningMode,
      numHands: 2 // Detect both hands simultaneously
    });
  }

  enableCam() {
    if (!this.gestureRecognizer) {
      return;
    }

    this.webcamRunning = true;
    const constraints = { video: true };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      this.webcamVideo.nativeElement.srcObject = stream;
      this.webcamVideo.nativeElement.addEventListener('loadeddata', () => this.predictWebcam());
    }).catch(err => {
      console.error('Camera access denied or error:', err);
      this.detectedMeaning = 'Camera access required';
    });
  }

  predictWebcam() {
    if (!this.webcamRunning) return;
    const video = this.webcamVideo.nativeElement;
    const canvas = this.outputCanvas.nativeElement;
    const canvasCtx = canvas.getContext('2d');
    
    // Ensure canvas dimensions match video for drawing
    if (video.videoWidth && canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    if (this.runningMode === 'IMAGE') {
      this.runningMode = 'VIDEO';
      this.gestureRecognizer.setOptions({ runningMode: 'VIDEO' });
    }
    let startTimeMs = performance.now();
    if (video.currentTime !== this.lastVideoTime && canvasCtx) {
      this.lastVideoTime = video.currentTime;
      const results = this.gestureRecognizer.recognizeForVideo(video, startTimeMs);
      
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      const drawingUtils = new DrawingUtils(canvasCtx);
      
      if (results.landmarks) {
        let bestScore = 0;
        let bestMeaning = '';
        let detectedClasses: string[] = [];
        
        for (let i = 0; i < results.landmarks.length; i++) {
          const landmarks = results.landmarks[i];
          drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5
          });
          drawingUtils.drawLandmarks(landmarks, {
            color: "#FF0000",
            lineWidth: 2
          });
          
          // Draw prediction text over each hand
          if (results.gestures && results.gestures[i] && results.gestures[i].length > 0) {
            const categoryName = results.gestures[i][0].categoryName;
            const score = results.gestures[i][0].score;
            if (score > 0.6 && categoryName !== 'None') {
              const meaning = this.signMapping[categoryName] || categoryName.replace(/_/g, ' ');
              detectedClasses.push(meaning);
              
              // Find index finger tip or standard position to anchor text
              const anchor = landmarks[8] || landmarks[0];
              canvasCtx.fillStyle = '#00FFFF';
              canvasCtx.font = 'bold 24px Arial';
              canvasCtx.fillText(
                `${meaning} (${(score * 100).toFixed(0)}%)`, 
                anchor.x * canvas.width - 20, 
                anchor.y * canvas.height - 20
              );
              
              if (score > bestScore) {
                bestScore = score;
                bestMeaning = meaning;
                this.detectedSign = categoryName;
              }
            }
          }
        }
        
        if (bestScore > 0.6 && bestMeaning) {
          // Join the detected signs from both hands
          const combinedMeaning = Array.from(new Set(detectedClasses)).join(' & ');
          this.detectedMeaning = combinedMeaning;
          
          if (this.lastSpokenMeaning !== combinedMeaning) {
            this.speakAloud(combinedMeaning);
            this.lastSpokenMeaning = combinedMeaning;
          }
        }
      }
      canvasCtx.restore();
    }

    if (this.webcamRunning) {
        // @ts-ignore
      this.animationFrameId = window.requestAnimationFrame(() => this.predictWebcam());
    }
  }

  speakAloud(text?: string) {
    if (!this.speechSynthesis) return;
    const textToSpeak = text || this.detectedMeaning;
    if (textToSpeak && textToSpeak !== 'Waiting for sign...' && textToSpeak !== 'Camera access required') {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      this.speechSynthesis.speak(utterance);
    }
  }
}
