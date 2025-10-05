import React, { useState } from 'react'
import { Camera } from '../App'
import PoseDetector from './PoseDetector'
import './CameraDetail.css'

interface CameraDetailProps {
  camera: Camera
  onBack: () => void
  onAIDetection: (result: any, location: string, videoClip?: Blob) => void
}

const CameraDetail: React.FC<CameraDetailProps> = ({ camera, onBack, onAIDetection }) => {
  const [showMesh, setShowMesh] = useState(true)
  const [aiAlerts, setAiAlerts] = useState<any[]>([])
  
  // Handle AI detection results
  const handleAIDetection = (result: any, videoClip?: Blob) => {
    console.log('AI Detection received:', result)
    console.log('Video clip received:', videoClip)
    
    // Call parent's onAIDetection to create new event and navigate
    onAIDetection(result, camera.location, videoClip)
    
    // Also keep local alerts for display
    setAiAlerts(prev => [...prev, {
      ...result,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now()
    }])
  }


  // Render the video feed based on camera ID
  const renderVideoFeed = () => {
    // Show webcam with pose detection for Simon Fraser Uni camera (cam1 - top-left)
    if (camera.id === 'cam1') {
      return (
        <PoseDetector
          videoSrc={null} // null means use webcam
          showMesh={showMesh}
          location={camera.location}
          onDetection={handleAIDetection}
          onVideoCache={(videoClip) => {
            // Store the video clip for this detection
            console.log('Video clip cached for event:', videoClip)
            // The video clip will be passed to handleAIDetection when detection occurs
          }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px'
          }}
        />
      )
    }

    // Show specific videos with pose detection for different cameras
    const getVideoSrc = () => {
      switch (camera.id) {
        case 'cam2': return '/Room1.mp4'
        case 'cam3': return '/Room2.mp4' 
        case 'cam4': return '/Room3.mp4'
        case 'cam5': return '/Room4.mp4'
        case 'cam6': return '/Garden.mp4'
        default: return '/placeholder-video.mp4'
      }
    }

    return (
      <PoseDetector
        videoSrc={getVideoSrc()}
        showMesh={showMesh}
        location={camera.location}
        onDetection={handleAIDetection}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px'
        }}
      />
    )
  }

  return (
    <div className="camera-detail">
      <div className="camera-detail-header">
        <button className="back-button" onClick={onBack}>
          ← BACK TO GRID
        </button>
        <h1 className="camera-title">{camera.location}</h1>
        <div className="camera-controls">
          <div className="camera-status">
            <span className={`status-indicator ${camera.status}`}></span>
            <span className="status-text">{camera.status.toUpperCase()}</span>
          </div>
          {camera.id === 'cam1' && (
            <button 
              className={`mesh-toggle-button ${showMesh ? 'active' : 'inactive'}`}
              onClick={() => setShowMesh(!showMesh)}
            >
              {showMesh ? '🔗 HIDE MESH' : '🔗 SHOW MESH'}
            </button>
          )}
        </div>
      </div>

      <div className="camera-detail-content">
        <div className="live-feed-section">
          <div className="live-feed-container">
            {renderVideoFeed()}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {camera.id === 'cam1' ? 'Live Feed Active' : 'Feed Placeholder'}
            </div>
          </div>
        </div>

        <div className="detection-feed-section">
          <h2 className="section-title">REAL-TIME DETECTION FEED</h2>
          <div className="detection-feed-content">
            <div className="detection-item">
              <span className="detection-time">2:34 PM</span>
              <span className="detection-type person">Person detected</span>
              <span className="detection-confidence">95% confidence</span>
            </div>
            <div className="detection-item">
              <span className="detection-time">2:31 PM</span>
              <span className="detection-type normal">Normal activity</span>
              <span className="detection-confidence">-</span>
            </div>
            <div className="detection-item">
              <span className="detection-time">2:28 PM</span>
              <span className="detection-type motion">Motion detected</span>
              <span className="detection-confidence">78% confidence</span>
            </div>
            <div className="detection-item">
              <span className="detection-time">2:25 PM</span>
              <span className="detection-type normal">No activity detected</span>
              <span className="detection-confidence">-</span>
            </div>
            <div className="detection-item">
              <span className="detection-time">2:22 PM</span>
              <span className="detection-type person">Person detected</span>
              <span className="detection-confidence">92% confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Detection Alerts - moved outside camera-detail-content */}
      <div style={{ padding: '0 20px 20px 20px' }}>

        {/* AI Detection Alerts */}
        {aiAlerts.length > 0 && (
          <div className="ai-alerts-section">
            <h2 className="section-title">🚨 AI DETECTION ALERTS</h2>
            <div className="alerts-list">
              {aiAlerts.slice(-3).map((alert) => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-header">
                    <span className="alert-time">{alert.timestamp}</span>
                    <span className={`alert-severity ${alert.danger ? 'danger' : 'warning'}`}>
                      {alert.danger ? 'HIGH RISK' : 'CAUTION'}
                    </span>
                  </div>
                  {alert.detections?.map((detection: any, idx: number) => (
                    <div key={idx} className="detection-item">
                      <p><strong>{detection.incident}</strong></p>
                      <p>{detection.summary}</p>
                      <p className="suggestion">{detection.suggestion}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CameraDetail