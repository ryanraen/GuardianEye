import React from 'react'
import './CameraIndicator.css'

interface CameraIndicatorProps {
  cameraCount: number
}

const CameraIndicator: React.FC<CameraIndicatorProps> = ({ cameraCount }) => {
  return (
    <div className="camera-indicator">
      <div className="indicator-content">
        <span className="indicator-icon">📹</span>
        <span className="indicator-text">#{cameraCount} CAMS</span>
      </div>
    </div>
  )
}

export default CameraIndicator