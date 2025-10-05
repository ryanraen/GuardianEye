import React from 'react'
import './CameraIndicator.css'

interface CameraIndicatorProps {
  offlineCameraCount: number;
  totalCameraCount: number;
}

const CameraIndicator: React.FC<CameraIndicatorProps> = ({ offlineCameraCount, totalCameraCount }) => {
  return (
    <div className="camera-indicator">
      <div className="indicator-content">
        <span className="indicator-icon">📹</span>
        <span className="indicator-text">{offlineCameraCount}/{totalCameraCount} Cams Online</span>
      </div>
    </div>
  )
}

export default CameraIndicator