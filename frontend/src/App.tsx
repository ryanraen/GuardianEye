import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CameraGrid from './components/CameraGrid';
import CameraIndicator from './components/CameraIndicator';

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

  // Mock data - will be replaced with API calls
  const [events] = useState<Event[]>([
    {
      id: '1',
      type: 'hazard',
      severity: 'high',
      timestamp: '2025-01-27 14:30:15',
      location: 'Living Room',
      description: 'Slippery surface detected - potential fall risk',
      cameraId: 'cam1'
    },
    {
      id: '2',
      type: 'fall',
      severity: 'critical',
      timestamp: '2025-01-27 14:25:42',
      location: 'Kitchen',
      description: 'Fall detected - immediate attention required',
      cameraId: 'cam2'
    },
    {
      id: '3',
      type: 'medical',
      severity: 'medium',
      timestamp: '2025-01-27 14:20:33',
      location: 'Bedroom',
      description: 'Unusual movement pattern detected',
      cameraId: 'cam3'
    }
  ]);

  const [cameras] = useState<Camera[]>([
    { id: 'cam1', location: 'Living Room', status: 'active', lastUpdate: '2025-01-27 14:30:15' },
    { id: 'cam2', location: 'Kitchen', status: 'active', lastUpdate: '2025-01-27 14:25:42' },
    { id: 'cam3', location: 'Bedroom', status: 'active', lastUpdate: '2025-01-27 14:20:33' },
    { id: 'cam4', location: 'Bathroom', status: 'active', lastUpdate: '2025-01-27 14:18:21' },
    { id: 'cam5', location: 'Hallway', status: 'offline', lastUpdate: '2025-01-27 13:45:12' },
    { id: 'cam6', location: 'Garden', status: 'active', lastUpdate: '2025-01-27 14:29:08' }
  ]);

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
          <CameraGrid cameras={cameras} />
          <CameraIndicator cameraCount={cameras.filter(c => c.status === 'active').length} />
        </div>
      </div>
    </div>
  );
};

export default App;