import React from 'react'
import { Camera } from '../App'
import CameraTile from './CameraTile'
import './CameraGrid.css'

interface CameraGridProps {
  cameras: Camera[]
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras }) => {
  return (
    <div className="camera-grid">
      {cameras.map((camera) => (
        <CameraTile key={camera.id} camera={camera} />
      ))}
    </div>
  )
}

export default CameraGrid