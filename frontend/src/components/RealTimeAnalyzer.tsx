import React, { useState, useEffect, useRef } from 'react';
import { Camera } from '../App';
import './RealTimeAnalyzer.css';

interface RealTimeAnalyzerProps {
  camera: Camera;
  onBack: () => void;
}

interface AIMoment {
  id: string;
  timestamp: number;
  type: 'safe' | 'dangerous';
  description: string;
  confidence: number;
}

interface AISummary {
  overallStatus: 'safe' | 'dangerous';
  summary: string;
  recommendations: string[];
  keyEvents: AIMoment[];
}

const RealTimeAnalyzer: React.FC<RealTimeAnalyzerProps> = ({ camera, onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [keyMoments, setKeyMoments] = useState<AIMoment[]>([]);
  const [audioTranscript, setAudioTranscript] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock AI analysis data for elderly safety
  const mockAISummary: AISummary = {
    overallStatus: 'dangerous',
    summary: 'Elderly resident appears to have fallen and may be unconscious. Immediate medical attention is required. Fall detection confidence: 98%.',
    recommendations: [
      'Call emergency services immediately (911)',
      'Contact primary caregiver or family member',
      'Check for responsiveness and breathing',
      'Do not move the person unless in immediate danger',
      'Monitor vital signs if possible'
    ],
    keyEvents: [
      {
        id: '1',
        timestamp: 1,
        type: 'dangerous',
        description: 'Person appears to lose balance and fall',
        confidence: 95
      },
      {
        id: '2',
        timestamp: 4,
        type: 'dangerous',
        description: 'No movement detected for 3+ seconds - potential unconsciousness',
        confidence: 98
      },
      {
        id: '3',
        timestamp: 7,
        type: 'safe',
        description: 'Emergency response initiated - caregiver notified',
        confidence: 100
      }
    ]
  };

  const mockAudioTranscript = "Help! I've fallen and I can't get up!";

  const startWebcam = async () => {
    console.log('Starting webcam for camera:', camera.id, 'location:', camera.location);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      console.log('Webcam stream obtained successfully');
      setStream(mediaStream);
      setIsStreaming(true);
      setError(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('Video element updated with stream');
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Camera access denied');
      setIsStreaming(false);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    startWebcam();
    
    return () => {
      stopWebcam();
    };
  }, []);

  useEffect(() => {
    if (isAnalyzing) {
      setAiSummary(mockAISummary);
      setKeyMoments(mockAISummary.keyEvents);
      setAudioTranscript(mockAudioTranscript);
    }
  }, [isAnalyzing]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
  
    const analyzeFrame = async () => {
      console.log('analyzeFrame called - video:', !!videoRef.current, 'canvas:', !!canvasRef.current);
      if (!videoRef.current || !canvasRef.current) return;
  
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];
      console.log('Base64 image captured, length:', base64Image.length);
  
      try {
        console.log('Sending API request to backend...');
        const response = await fetch('http://localhost:8000/detection/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64_image: base64Image,
            location: camera.location,
            time: Date.now()
          }),
        });
  
        const result = await response.json();
        console.log('AI result:', result);
      } catch (err) {
        console.error('Error analyzing frame:', err);
      }
    };
  
    if (isAnalyzing) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
        analyzeFrame();
      }, 1000);
    }
  
    return () => clearInterval(interval);
  }, [isAnalyzing]);
  

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setCurrentTime(0);
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
  };

  const renderVideoOverlay = () => {
    if (!isAnalyzing) return null;

    return (
      <div className="video-overlay">
        {/* AI Detection Overlays */}
        <div className="face-detection" style={{ top: '30%', left: '40%', width: '20%', height: '25%' }}>
          <div className="detection-box">
            <span className="confidence">99%</span>
          </div>
          {/* Facial landmarks */}
          <div className="landmark" style={{ top: '20%', left: '30%' }}></div>
          <div className="landmark" style={{ top: '20%', right: '30%' }}></div>
          <div className="landmark" style={{ top: '50%', left: '50%' }}></div>
          <div className="landmark" style={{ bottom: '20%', left: '25%' }}></div>
          <div className="landmark" style={{ bottom: '20%', right: '25%' }}></div>
        </div>
        
        {/* Body landmarks */}
        <div className="body-landmark" style={{ top: '55%', left: '35%' }} title="right_shoulder"></div>
        <div className="body-landmark" style={{ top: '55%', right: '35%' }} title="left_shoulder"></div>
        <div className="body-landmark" style={{ top: '70%', left: '40%' }} title="right_elbow"></div>
        <div className="body-landmark" style={{ top: '70%', right: '40%' }} title="left_elbow"></div>
      </div>
    );
  };

  const renderTimeline = () => {
    const maxTime = 16;
    const safePeriod = 12.5;
    
    return (
      <div className="timeline-container">
        <div className="timeline">
          <div className="timeline-safe" style={{ width: `${(safePeriod / maxTime) * 100}%` }}></div>
          <div className="timeline-dangerous" style={{ 
            width: `${((maxTime - safePeriod) / maxTime) * 100}%`,
            left: `${(safePeriod / maxTime) * 100}%`
          }}></div>
          
          {/* Time markers */}
          {Array.from({ length: Math.floor(maxTime) + 1 }, (_, i) => (
            <div key={i} className="time-marker" style={{ left: `${(i / maxTime) * 100}%` }}>
              {i}s
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="real-time-analyzer">
      <div className="analyzer-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <h1>Real-Time Analyzer - {camera.location}</h1>
        <div className="camera-status">
          <span className={`status-indicator ${camera.status}`}></span>
          {camera.status.toUpperCase()}
        </div>
      </div>

      <div className="analyzer-content">
        <div className="video-section">
          <div className="video-container">
            {error ? (
              <div className="error-container">
                <div className="error-message">
                  <div className="error-icon">⚠️</div>
                  <div className="error-text">{error}</div>
                  <button 
                    className="retry-button"
                    onClick={startWebcam}
                  >
                    Retry Camera Access
                  </button>
                </div>
              </div>
            ) : (
              <div className="live-video-feed">
                {isStreaming ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="analyzer-video"
                    />
                    <canvas
                      ref={canvasRef}
                      style={{ display: 'none' }}
                      width={1280}
                      height={720}
                    />
                  </>
                ) : (
                  <div className="video-placeholder">
                    <div className="video-content">
                      <div className="person-silhouette">
                        <div className="head"></div>
                        <div className="body"></div>
                        <div className="arms"></div>
                      </div>
                    </div>
                  </div>
                )}
                {renderVideoOverlay()}
              </div>
            )}
            
            <div className="video-controls">
              {!isAnalyzing ? (
                <button className="start-analysis-btn" onClick={startAnalysis}>
                  ◎ Start Analysis
                </button>
              ) : (
                <button className="stop-analysis-btn" onClick={stopAnalysis}>
                  ◎ Stop Analysis
                </button>
              )}
              
              {isAnalyzing && (
                <div className="analysis-status">
                  ◎ Recording and analyzing...
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          {isAnalyzing && renderTimeline()}

          {/* Key Moments */}
          {isAnalyzing && (
            <div className="key-moments-section">
              <div className="section-header">
                <h3>Key Moments</h3>
                <div className="legend">
                  <span className="legend-item safe">◎ Safe</span>
                  <span className="legend-item dangerous">◎ Dangerous</span>
                </div>
              </div>
              
              <div className="key-moments-list">
                {keyMoments.map((moment) => (
                  <div key={moment.id} className={`moment-item ${moment.type}`}>
                    <div className="moment-time">{moment.timestamp.toFixed(1)}s</div>
                    <div className="moment-description">{moment.description}</div>
                    <div className="moment-confidence">{moment.confidence}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio Transcript */}
          {isAnalyzing && (
            <div className="audio-transcript">
              <h3>Audio Transcript</h3>
              <div className="transcript-content">
                "{audioTranscript}"
              </div>
            </div>
          )}
        </div>

        {/* AI Summary Panel */}
        {isAnalyzing && aiSummary && (
          <div className="ai-summary-panel">
            <h3>AI Analysis Summary</h3>
            
            <div className={`overall-status ${aiSummary.overallStatus}`}>
              <span className="status-icon">
                {aiSummary.overallStatus === 'safe' ? '◎' : '⚠️'}
              </span>
              <span className="status-text">
                {aiSummary.overallStatus === 'safe' ? 'SAFE' : 'DANGEROUS'}
              </span>
            </div>

            <div className="summary-content">
              <p>{aiSummary.summary}</p>
            </div>

            <div className="recommendations">
              <h4>Recommendations:</h4>
              <ul>
                {aiSummary.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="ai-assistance">
              <h4>Emergency Response Assistant</h4>
              <div className="assistance-chat">
                <div className="chat-message">
                  <strong>Caregiver:</strong> "What should I do in this fall situation?"
                </div>
                <div className="chat-response">
                  <strong>GuardianEye AI:</strong> "Based on the fall detection analysis, this is a high-priority emergency. The system has automatically contacted emergency services and the primary caregiver. Please: 1) Do not move the resident unless in immediate danger, 2) Check for responsiveness by calling their name, 3) Monitor breathing and pulse, 4) Stay with them until medical help arrives. The AI has detected 98% confidence in fall occurrence with potential unconsciousness."
                </div>
              </div>
              
              <div className="chat-input">
                <input type="text" placeholder="Ask about emergency procedures..." />
                <button>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeAnalyzer;
