import React, { useRef, useEffect, useState } from 'react'
import { api, DetectionResponse } from '../services/api'

interface PoseDetectorProps {
  videoSrc: string
  className?: string
  style?: React.CSSProperties
  showMesh?: boolean
  location?: string
  onDetection?: (result: DetectionResponse) => void
}

interface PoseLandmark {
  x: number
  y: number
  z?: number
  visibility?: number
}

const PoseDetector: React.FC<PoseDetectorProps> = ({ 
  videoSrc, 
  className, 
  style, 
  showMesh = true, 
  location = 'Unknown Location',
  onDetection 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [poseDetector, setPoseDetector] = useState<any>(null)
  const [lastDetectionTime, setLastDetectionTime] = useState<number>(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Initialize MediaPipe Pose Detection
  useEffect(() => {
    const initializePoseDetection = async () => {
      try {
        // Import MediaPipe Tasks Vision
        const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
        
        // Create pose landmarker
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        )
        
        const landmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        })

        setPoseDetector(landmarker)
        setIsLoaded(true)
      } catch (error) {
        console.error('Error initializing MediaPipe:', error)
        setIsLoaded(true) // Still show video even if MediaPipe fails
      }
    }

    initializePoseDetection()
  }, [])

  // Process video frames and draw pose landmarks
  const processFrame = useRef<(timestamp: number) => void>()
  const animationId = useRef<number>()
  
  // AI Detection function
  const performAIDetection = async (video: HTMLVideoElement) => {
    const now = Date.now()
    // Only analyze every 5 seconds to avoid overwhelming the API
    if (now - lastDetectionTime < 5000 || isAnalyzing) return
    
    try {
      setIsAnalyzing(true)
      setLastDetectionTime(now)
      
      const result = await api.captureVideoFrame(video, location)
      
      if (result.danger && result.detections.length > 0) {
        console.log('🚨 AI Detection Alert:', result.detections)
        onDetection?.(result)
      }
    } catch (error) {
      console.error('AI Detection failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  useEffect(() => {
    if (!isLoaded || !poseDetector || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match video
    const updateCanvasSize = () => {
      canvas.width = video.videoWidth || video.clientWidth
      canvas.height = video.videoHeight || video.clientHeight
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Cancel any existing animation
    if (animationId.current) {
      cancelAnimationFrame(animationId.current)
    }

    processFrame.current = (timestamp: number) => {
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        try {
          // Always clear canvas first
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          
          // Only detect poses if mesh is enabled
          if (showMesh) {
            const results = poseDetector.detectForVideo(video, timestamp)
            
            // Draw pose landmarks if detected
            if (results.landmarks && results.landmarks.length > 0) {
              drawPoseLandmarks(ctx, results.landmarks[0], canvas.width, canvas.height)
            }
          }
          
          // Perform AI detection for safety analysis
          performAIDetection(video)
        } catch (error) {
          console.error('Error processing frame:', error)
        }
      }
      
      animationId.current = requestAnimationFrame(processFrame.current!)
    }

    // Start processing frames
    animationId.current = requestAnimationFrame(processFrame.current)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
        animationId.current = undefined
      }
    }
  }, [isLoaded, poseDetector, showMesh])

  // Clear canvas when showMesh changes
  useEffect(() => {
    if (canvasRef.current && !showMesh) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }, [showMesh])

  // Draw pose landmarks on canvas
  const drawPoseLandmarks = (ctx: CanvasRenderingContext2D, landmarks: PoseLandmark[], width: number, height: number) => {
    // Pose landmark connections (simplified skeleton)
    const connections = [
      // Head
      [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
      // Torso
      [9, 10], [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      // Arms
      [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      // Legs
      [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28],
      [27, 29], [28, 30], [29, 31], [30, 32]
    ]

    // Draw connections
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    
    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx]
      const end = landmarks[endIdx]
      
      if (start && end && start.visibility && end.visibility && 
          start.visibility > 0.5 && end.visibility > 0.5) {
        ctx.beginPath()
        ctx.moveTo(start.x * width, start.y * height)
        ctx.lineTo(end.x * width, end.y * height)
        ctx.stroke()
      }
    })

    // Draw landmarks
    ctx.fillStyle = '#ff0000'
    landmarks.forEach((landmark, index) => {
      if (landmark.visibility && landmark.visibility > 0.5) {
        ctx.beginPath()
        ctx.arc(landmark.x * width, landmark.y * height, 3, 0, 2 * Math.PI)
        ctx.fill()
      }
    })
  }

  return (
    <div style={{ position: 'relative', ...style }} className={className}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        src={videoSrc}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '8px',
          backgroundColor: '#000'
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          borderRadius: '8px'
        }}
      />
    </div>
  )
}

export default PoseDetector
