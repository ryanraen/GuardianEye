import React from 'react'
import { Camera } from '../App'
import PoseDetector from './PoseDetector'
import './CameraTile.css'

interface CameraTileProps {
  camera: Camera
  onClick: () => void
}

const CameraTile: React.FC<CameraTileProps> = ({ camera, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#44ff44'
      case 'offline': return '#ff4444'
      case 'error': return '#ff8800'
      default: return '#888'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'ONLINE'
      case 'offline': return 'OFFLINE'
      case 'error': return 'ERROR'
      default: return 'UNKNOWN'
    }
  }

  // Mock camera feed - in real app this would be a video stream
  const renderCameraFeed = () => {
    if (camera.status === 'offline') {
      return (
        <div className="camera-feed offline">
          <div className="offline-overlay">
            <div className="offline-icon">📹</div>
            <div className="offline-text">CAMERA OFFLINE</div>
          </div>
        </div>
      )
    }

    if (camera.status === 'error') {
      return (
        <div className="camera-feed error">
          <div className="error-overlay">
            <div className="error-icon">⚠️</div>
            <div className="error-text">CONNECTION ERROR</div>
          </div>
        </div>
      )
    }

    // Show webcam with pose detection for Living Room camera (cam1 - top-left)
    if (camera.id === 'cam1') {
      return (
        <div className="camera-feed active">
          <PoseDetector
            videoSrc={null} // null means use webcam
            style={{
              width: '100%',
              height: '100%'
            }}
          />
          <div className="video-overlay">
          </div>
        </div>
      )
    }

    // Show video with pose detection for all other cameras
    return (
      <div className="camera-feed active">
        <PoseDetector
          videoSrc="/placeholder-video.mp4"
          style={{
            width: '100%',
            height: '100%'
          }}
        />
        <div className="video-overlay">
        </div>
      </div>
    )
  }

  return (
    <div className="camera-tile" onClick={onClick}>
      <div className="camera-header">
        <div>
          <h3 className="camera-title">{camera.location}</h3>
          <div className="camera-location">Senior Care Home: Room {camera.id.slice(-1)}</div>
        </div>
        <div className="camera-status">
          <span 
            className="status-dot"
            style={{ backgroundColor: getStatusColor(camera.status) }}
          ></span>
          <span className="status-text">{getStatusText(camera.status)}</span>
        </div>
      </div>
      <div className="camera-body">
        {renderCameraFeed()}
      </div>
    </div>
  )
}

export default CameraTile