import React from 'react'
import { Camera } from '../App'
import './CameraTile.css'

interface CameraTileProps {
  camera: Camera
}

const CameraTile: React.FC<CameraTileProps> = ({ camera }) => {
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

    // Active camera - mock video feed
    return (
      <div className="camera-feed active">
        <div className="mock-video">
          <div className="video-overlay">
            <div className="timestamp">{camera.lastUpdate}</div>
            <div className="status-indicator">
              <span 
                className="status-dot"
                style={{ backgroundColor: getStatusColor(camera.status) }}
              ></span>
              {getStatusText(camera.status)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="camera-tile">
      <div className="camera-header">
        <h3 className="camera-title">{camera.location}</h3>
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