import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CameraGrid from './components/CameraGrid';
import CameraDetail from './components/CameraDetail';
import EventDetail from './components/EventDetail';
import { api, Event, Camera } from './services/api';

// Re-export types for components
export type { Event, Camera };

const App: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [viewingEventDetail, setViewingEventDetail] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for API data
  const [events, setEvents] = useState<Event[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load cameras and events in parallel
        const [camerasData, eventsData] = await Promise.all([
          api.getCameras(),
          api.getEvents()
        ]);
        
        setCameras(camerasData);
        setEvents(eventsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        
        // Fallback to mock data if API fails
        setCameras([
          { id: 'cam1', location: 'Living Room', status: 'active', lastUpdate: '2025-01-27 14:30:15' },
          { id: 'cam2', location: 'Kitchen', status: 'active', lastUpdate: '2025-01-27 14:25:42' },
          { id: 'cam3', location: 'Bedroom', status: 'active', lastUpdate: '2025-01-27 14:20:33' },
          { id: 'cam4', location: 'Bathroom', status: 'active', lastUpdate: '2025-01-27 14:18:21' },
          { id: 'cam5', location: 'Hallway', status: 'offline', lastUpdate: '2025-01-27 13:45:12' },
        ]);
        
        setEvents([
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
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  // Show loading state
  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading GuardianEye...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="app">
        <Header />
        <div className="error-container">
          <div className="error-message">
            <h2>⚠️ Connection Error</h2>
            <p>{error}</p>
            <p className="error-note">Running in offline mode with sample data.</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

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