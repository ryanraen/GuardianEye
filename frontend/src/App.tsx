import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CameraGrid from './components/CameraGrid';
import CameraDetail from './components/CameraDetail';
import EventDetail from './components/EventDetail';

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
  const [viewingEventDetail, setViewingEventDetail] = useState<Event | null>(null);

  // Mock data - will be replaced with API calls
  const [events, setEvents] = useState<Event[]>([
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
    { id: 'cam6', location: 'Garden', status: 'active', lastUpdate: '2025-01-27 14:29:08' },
    { id: 'cam7', location: 'Dining Room', status: 'active', lastUpdate: '2025-01-27 14:28:45' },
    { id: 'cam8', location: 'Study Room', status: 'active', lastUpdate: '2025-01-27 14:27:32' },
    { id: 'cam9', location: 'Laundry Room', status: 'active', lastUpdate: '2025-01-27 14:26:18' },
    { id: 'cam10', location: 'Garage', status: 'offline', lastUpdate: '2025-01-27 14:25:55' },
    { id: 'cam11', location: 'Front Door', status: 'active', lastUpdate: '2025-01-27 14:24:12' },
    { id: 'cam12', location: 'Back Door', status: 'error', lastUpdate: '2025-01-27 14:23:48' },
    { id: 'cam13', location: 'Basement', status: 'active', lastUpdate: '2025-01-27 14:22:35' },
    { id: 'cam14', location: 'Attic', status: 'active', lastUpdate: '2025-01-27 14:21:22' },
    { id: 'cam15', location: 'Storage Room', status: 'offline', lastUpdate: '2025-01-27 14:20:09' },
    { id: 'cam16', location: 'Utility Room', status: 'active', lastUpdate: '2025-01-27 14:19:56' }
  ]);

  const handleCameraSelect = (camera: Camera) => {
    setSelectedCamera(camera);
  };

  const handleBackToGrid = () => {
    setSelectedCamera(null);
  };

  const handleAlertSelect = (event: Event) => {
    setViewingEventDetail(event);
  };

  const handleBackToAlerts = () => {
    setViewingEventDetail(null);
  };

  const handleDismissAlert = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    setViewingEventDetail(null);
  };

  if (viewingEventDetail) {
    return (
        <EventDetail 
          event={viewingEventDetail} 
          onBack={handleBackToAlerts}
          onDismiss={() => handleDismissAlert(viewingEventDetail.id)}
        />
    );
  }

  if (selectedCamera) {
    return (
      <CameraDetail 
        camera={selectedCamera} 
        onBack={handleBackToGrid}
      />
    );
  }

  return (
    <div className="app">
      <Header />
      <div className="main-content">
        <Sidebar 
          events={events} 
          onEventClick={handleAlertSelect}
          cameras={cameras}
        />
        <div className="content-area">
          <CameraGrid 
            cameras={cameras} 
            onCameraSelect={handleCameraSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default App;