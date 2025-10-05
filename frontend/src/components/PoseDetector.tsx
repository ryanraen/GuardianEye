import React, { useRef, useEffect, useState } from 'react'
import { api, DetectionResponse } from '../services/api'

interface PoseDetectorProps {
  videoSrc: string | null // null means use webcam
  className?: string
  style?: React.CSSProperties
  showMesh?: boolean
  location?: string
  onDetection?: (result: DetectionResponse, videoClip?: Blob) => void
  onVideoCache?: (videoBlob: Blob) => void // Callback to provide cached video
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
  onDetection,
  onVideoCache
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [poseDetector, setPoseDetector] = useState<any>(null)
  const lastDetectionTime = useRef<number>(0)
  const isAnalyzing = useRef<boolean>(false)
  
  // Video caching for 5-second clips
  const videoCache = useRef<Blob[]>([])
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])
  const cacheStartTime = useRef<number>(0)
  const mimeType = useRef<string>('video/webm')

  // Initialize webcam if videoSrc is null
  useEffect(() => {
    if (videoSrc !== null || !videoRef.current) return

    const initializeWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user' // front-facing camera
          }
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          // Start video recording for caching
          startVideoRecording(stream)
        }
      } catch (error) {
        console.error('❌ Error accessing webcam:', error)
        // Fallback to placeholder video if webcam fails
        if (videoRef.current) {
          videoRef.current.src = '/placeholder-video.mp4'
        }
      }
    }

    initializeWebcam()

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
      stopVideoRecording()
    }
  }, [videoSrc])

  // Video recording functions for caching
  const startVideoRecording = (stream: MediaStream) => {
    try {
      // Clear any existing chunks
      recordedChunks.current = []
      
      // Try different MIME types for better browser compatibility
      const supportedTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8', 
        'video/webm',
        'video/mp4;codecs=h264',
        'video/mp4'
      ]
      
      let selectedMimeType = 'video/webm'
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type
          break
        }
      }
      
      mimeType.current = selectedMimeType
      console.log('📹 Using MIME type:', selectedMimeType)
      
      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType
      })
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data)
          console.log('📹 Video chunk recorded:', event.data.size, 'bytes, total chunks:', recordedChunks.current.length)
        }
      }
      
      recorder.onstop = () => {
        console.log('📹 MediaRecorder stopped, total chunks:', recordedChunks.current.length)
      }
      
      recorder.start(1000) // Record in 1 second chunks for better stability
      mediaRecorder.current = recorder
      cacheStartTime.current = Date.now()
      console.log('📹 Video recording started')
    } catch (error) {
      console.error('Error starting video recording:', error)
    }
  }

  const stopVideoRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop()
      mediaRecorder.current = null
    }
  }

  const captureCurrentFrame = async (video: HTMLVideoElement): Promise<Blob | null> => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || video.clientWidth
      canvas.height = video.videoHeight || video.clientHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('Could not get canvas context')
        return null
      }
      
      // Draw the current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to blob
      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('📹 Frame blob created:', blob.size, 'bytes, type:', blob.type)
            resolve(blob)
          } else {
            console.error('Failed to create frame blob')
            resolve(null)
          }
        }, 'image/png')
      })
    } catch (error) {
      console.error('Error capturing frame:', error)
      return null
    }
  }

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
        console.error('❌ Error initializing MediaPipe:', error)
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
    if (now - lastDetectionTime.current < 1000 || isAnalyzing.current) return
    
    try {
      isAnalyzing.current = true
      lastDetectionTime.current = now
      console.log('🔍 Performing AI detection analysis...')
      
      const result = await api.captureVideoFrame(video, location)
      console.log('📊 AI Detection result:', result)
      
      if (result.detections.length > 0 && result.detections[0].incident != "None") {
        console.log('🚨 AI Detection Alert:', result.detections)
        
        // Capture a single frame instead of trying to record video
        try {
          const frameBlob = await captureCurrentFrame(video)
          console.log('📹 Frame captured:', frameBlob)
          
          // Pass both result and frame to onDetection
          onDetection?.(result, frameBlob || undefined)
          
          // Also call onVideoCache if provided (for frame)
          if (frameBlob && onVideoCache) {
            onVideoCache(frameBlob)
          }
        } catch (error) {
          console.error('Error capturing frame:', error)
          onDetection?.(result, undefined)
        }
      } else {
        console.log('✅ No safety concerns detected')
      }
    } catch (error) {
      console.error('❌ AI Detection failed:', error)
    } finally {
      isAnalyzing.current = false
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
          console.error('❌ Error processing frame:', error)
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
        loop={videoSrc !== null} // Only loop if it's a video file
        muted
        playsInline
        src={videoSrc || undefined} // Only set src if it's not null (webcam uses srcObject)
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
