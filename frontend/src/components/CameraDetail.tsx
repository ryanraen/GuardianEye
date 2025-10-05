import React, { useState } from 'react'
import { Camera } from '../App'
import PoseDetector from './PoseDetector'
import './CameraDetail.css'

interface CameraDetailProps {
  camera: Camera
  onBack: () => void
}

const CameraDetail: React.FC<CameraDetailProps> = ({ camera, onBack }) => {
  const [showMesh, setShowMesh] = useState(true)
  
  // Mock AI summary data
  const aiSummary = {
    currentActivity: 'Person walking from kitchen to living room',
    riskLevel: 'Low',
    peopleCount: 1,
    objectsDetected: ['chair', 'table', 'lamp'],
    lastUpdate: new Date().toLocaleTimeString()
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return '#44ff44'
      case 'medium': return '#ffaa00'
      case 'high': return '#ff8800'
      case 'critical': return '#ff4444'
      default: return '#888'
    }
  }

  // Render the video feed based on camera ID
  const renderVideoFeed = () => {
    // Show the placeholder video with pose detection for Living Room camera
    if (camera.id === 'cam1') {
      return (
        <PoseDetector
          videoSrc="/placeholder-video.mp4"
          showMesh={showMesh}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px'
          }}
        />
      )
    }

    // Show placeholder for other cameras
    return (
      <div className="live-feed-placeholder">
        <div className="feed-placeholder-content">
          <div className="feed-icon">📹</div>
          <p>Live Feed</p>
          <p className="camera-location">{camera.location}</p>
          <p className="placeholder-note">
            Camera feed placeholder - video stream would appear here
          </p>
        </div>
      </div>
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

        <div className="ai-summary-section">
          <h2 className="section-title">AI ANALYSIS</h2>
          <div className="ai-summary-content">
            <div className="summary-item">
              <span className="summary-label">Current Activity:</span>
              <span className="summary-value">{aiSummary.currentActivity}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Risk Level:</span>
              <span 
                className="summary-value risk-level"
                style={{ color: getRiskColor(aiSummary.riskLevel) }}
              >
                {aiSummary.riskLevel.toUpperCase()}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">People Detected:</span>
              <span className="summary-value">{aiSummary.peopleCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Objects:</span>
              <span className="summary-value">{aiSummary.objectsDetected.join(', ')}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Last Update:</span>
              <span className="summary-value">{aiSummary.lastUpdate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CameraDetail