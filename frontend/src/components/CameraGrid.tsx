import React from 'react'
import { Camera } from '../App'
import CameraTile from './CameraTile'
import './CameraGrid.css'

interface CameraGridProps {
  cameras: Camera[]
  onCameraSelect: (camera: Camera) => void
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras, onCameraSelect }) => {
  return (
    <div className="camera-grid">
      {cameras.map((camera) => (
        <CameraTile 
          key={camera.id} 
          camera={camera} 
          onClick={() => onCameraSelect(camera)}
        />
      ))}
    </div>
  )
}

export default CameraGrid