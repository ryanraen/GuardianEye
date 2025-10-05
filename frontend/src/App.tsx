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
          { id: 'cam1', location: 'Simon Fraser Uni', status: 'active', lastUpdate: '2025-01-27 14:30:15' },
          { id: 'cam2', location: 'Room 1', status: 'active', lastUpdate: '2025-01-27 14:25:42' },
          { id: 'cam3', location: 'Room 2', status: 'active', lastUpdate: '2025-01-27 14:20:33' },
          { id: 'cam4', location: 'Room 3', status: 'active', lastUpdate: '2025-01-27 14:18:21' },
          { id: 'cam5', location: 'Room 4', status: 'offline', lastUpdate: '2025-01-27 13:45:12' },
          { id: 'cam6', location: 'Garden', status: 'active', lastUpdate: '2025-01-27 14:28:45' },
        ]);
        
        setEvents([
          {
            id: '1',
            type: 'fall',
            severity: 'critical',
            timestamp: '2025-01-27 14:30:15',
            location: 'Simon Fraser Uni',
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

  const handleAIDetection = (detectionResult: any, location: string, videoClip?: Blob) => {
    const detection = detectionResult.detections[0];
    const incidentType = detection?.incident?.toLowerCase() || 'medical';
    
    console.log('🎬 App.tsx - Video clip received:', videoClip)
    console.log('🎬 App.tsx - Video clip size:', videoClip?.size)
    console.log('🎬 App.tsx - Video clip type:', videoClip?.type)
    
    // Create a new event from the AI detection result
    const newEvent: Event = {
      id: `ai-${Date.now()}`, // Unique ID based on timestamp
      type: incidentType,
      severity: detection?.emergency_level || 'high',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      location: location,
      description: detection?.summary || 'AI detected potential safety concern',
      cameraId: 'cam1', // Live camera
      // Include AI analysis data
      aiSummary: detection?.summary || 'AI analysis completed',
      aiSuggestion: detection?.suggestion || 'Please assess the situation and take appropriate action',
      // Store video clip URL if available
      videoClipUrl: videoClip && videoClip.size > 0 ? URL.createObjectURL(videoClip) : undefined
    };
    
    console.log('🎬 App.tsx - Event created with videoClipUrl:', newEvent.videoClipUrl)

    // Add the new event to the events list
    setEvents(prevEvents => [newEvent, ...prevEvents]);
    
    // Navigate directly to the new event detail
    setViewingEventDetail(newEvent);
    
    // Close any open camera view
    setSelectedCamera(null);
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
        onAIDetection={handleAIDetection}
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