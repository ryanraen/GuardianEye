import React from 'react'
import { Camera } from '../App'
import CameraTile from './CameraTile'
import './CameraGrid.css'

interface CameraGridProps {
  cameras: Camera[]
  onCameraDoubleClick?: (camera: Camera) => void
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras, onCameraDoubleClick }) => {
  return (
    <div className="camera-grid">
      {cameras.map((camera) => (
        <CameraTile 
          key={camera.id} 
          camera={camera} 
          onDoubleClick={onCameraDoubleClick}
        />
      ))}
    </div>
  )
}

export default CameraGrid