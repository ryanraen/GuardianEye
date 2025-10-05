import React, { useRef, useEffect, useState } from 'react'
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

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      setIsStreaming(true);
      setError(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
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
    if (camera.status === 'active' && camera.id === 'cam1') {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [camera.status, camera.id]);

  // Live camera feed rendering
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

    if (camera.status === 'error' || error) {
      return (
        <div className="camera-feed error">
          <div className="error-overlay">
            <div className="error-icon">⚠️</div>
            <div className="error-text">CONNECTION ERROR</div>
          </div>
        </div>
      )
    }

    // Show video with pose detection for Living Room camera (cam1), pattern for others
    if (camera.id === 'cam1') {
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

    // Active camera - mock video feed
    return (
      <div className="camera-feed active">
        <div className="mock-video">
          <div className="video-overlay">
          </div>
        </div>
      )
    }

    // Show video with pose detection for Living Room camera (cam1), pattern for others
    if (camera.id === 'cam1') {
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

    // Mock video feed for other cameras
    return (
      <div className="camera-feed active">
        <div className="mock-video">
          <div className="video-overlay">
          </div>
        </div>
      </div>
    )
  }

  const handleDoubleClick = () => {
    if (onDoubleClick && camera.status === 'active') {
      onDoubleClick(camera);
    }
  };

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
        {camera.status === 'active' && (
          <div className="double-click-hint">
            Double-click to analyze
          </div>
        )}
      </div>
    </div>
  )
}

export default CameraTile