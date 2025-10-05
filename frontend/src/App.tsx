import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CameraGrid from './components/CameraGrid';
import CameraIndicator from './components/CameraIndicator';
import RealTimeAnalyzer from './components/RealTimeAnalyzer';

export interface Event {
  id: string;
  type: 'hazard' | 'fall' | 'medical' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  location: string;
  description: string;
  cameraId: string;
}

export interface Camera {
  id: string;
  location: string;
  status: 'active' | 'offline' | 'error';
  lastUpdate: string;
}

const App: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  // Mock data - will be replaced with API calls
  const [events] = useState<Event[]>([
    {
      id: '1',
      type: 'fall',
      severity: 'critical',
      timestamp: '2025-01-27 14:30:15',
      location: 'Living Room',
      description: 'Elderly resident fall detected - immediate medical attention required',
      cameraId: 'cam1'
    },
    {
      id: '2',
      type: 'medical',
      severity: 'high',
      timestamp: '2025-01-27 14:25:42',
      location: 'Kitchen',
      description: 'Unusual movement pattern - potential medical emergency',
      cameraId: 'cam2'
    },
    {
      id: '3',
      type: 'hazard',
      severity: 'medium',
      timestamp: '2025-01-27 14:20:33',
      location: 'Bathroom',
      description: 'Slippery surface detected - fall risk assessment needed',
      cameraId: 'cam3'
    }
  ]);

  const [cameras] = useState<Camera[]>([
    { id: 'cam1', location: 'Living Room', status: 'active', lastUpdate: '2025-01-27 14:30:15' },
    { id: 'cam2', location: 'Kitchen', status: 'active', lastUpdate: '2025-01-27 14:25:42' },
    { id: 'cam3', location: 'Bathroom', status: 'active', lastUpdate: '2025-01-27 14:20:33' },
    { id: 'cam4', location: 'Bedroom', status: 'active', lastUpdate: '2025-01-27 14:18:21' },
    { id: 'cam5', location: 'Hallway', status: 'offline', lastUpdate: '2025-01-27 13:45:12' },
    { id: 'cam6', location: 'Garden', status: 'active', lastUpdate: '2025-01-27 14:29:08' },
    { id: 'cam7', location: 'Dining Room', status: 'active', lastUpdate: '2025-01-27 14:28:15' },
    { id: 'cam8', location: 'Study Room', status: 'active', lastUpdate: '2025-01-27 14:27:42' },
    { id: 'cam9', location: 'Laundry Room', status: 'active', lastUpdate: '2025-01-27 14:26:33' },
    { id: 'cam10', location: 'Garage', status: 'active', lastUpdate: '2025-01-27 14:25:21' },
    { id: 'cam11', location: 'Front Door', status: 'active', lastUpdate: '2025-01-27 14:24:12' },
    { id: 'cam12', location: 'Back Door', status: 'offline', lastUpdate: '2025-01-27 13:50:08' }
  ]);

  const handleCameraDoubleClick = (camera: Camera) => {
    setSelectedCamera(camera);
  };

  const handleBackToDashboard = () => {
    setSelectedCamera(null);
  };

  // If a camera is selected, show the Real-Time Analyzer
  if (selectedCamera) {
    return (
      <RealTimeAnalyzer 
        camera={selectedCamera} 
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="app">
      <Header />
      <div className="main-content">
        <Sidebar 
          events={events} 
          selectedEvent={selectedEvent} 
          onEventSelect={setSelectedEvent}
        />
        <div className="content-area">
          <div className="safety-banner">
            <div className="banner-content">
              <span className="banner-icon">🛡️</span>
              <span className="banner-text">GuardianEye is actively monitoring for falls, medical emergencies, and safety hazards</span>
            </div>
          </div>
          <CameraGrid 
            cameras={cameras} 
            onCameraDoubleClick={handleCameraDoubleClick}
          />
          <CameraIndicator cameraCount={cameras.filter(c => c.status === 'active').length} />
        </div>
      </div>
    </div>
  );
};

export default App;