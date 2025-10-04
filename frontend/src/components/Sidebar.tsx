import React from 'react'
import { Event } from '../App'
import './Sidebar.css'

interface SidebarProps {
  events: Event[]
  selectedEvent: Event | null
  onEventSelect: (event: Event) => void
}

const Sidebar: React.FC<SidebarProps> = ({ events, selectedEvent, onEventSelect }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff4444'
      case 'high': return '#ff8800'
      case 'medium': return '#ffaa00'
      case 'low': return '#44ff44'
      default: return '#888'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'hazard': return '⚠️'
      case 'fall': return '🚨'
      case 'medical': return '🏥'
      case 'security': return '🔒'
      default: return '📋'
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h2 className="section-title">EVENTS LOG</h2>
        <div className="events-list">
          {events.map((event) => (
            <div
              key={event.id}
              className={`event-item ${selectedEvent?.id === event.id ? 'selected' : ''}`}
              onClick={() => onEventSelect(event)}
            >
              <div className="event-header">
                <span className="event-icon">{getEventIcon(event.type)}</span>
                <span 
                  className="severity-indicator"
                  style={{ backgroundColor: getSeverityColor(event.severity) }}
                ></span>
              </div>
              <div className="event-details">
                <div className="event-type">{event.type.toUpperCase()}</div>
                <div className="event-location">{event.location}</div>
                <div className="event-time">{event.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h2 className="section-title">SUMMARY</h2>
        <div className="summary-content">
          {selectedEvent ? (
            <div className="event-summary">
              <div className="summary-header">
                <span className="summary-icon">{getEventIcon(selectedEvent.type)}</span>
                <span className="summary-type">{selectedEvent.type.toUpperCase()} EVENT</span>
              </div>
              <div className="summary-details">
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Severity:</strong> 
                  <span 
                    className="severity-text"
                    style={{ color: getSeverityColor(selectedEvent.severity) }}
                  > {selectedEvent.severity.toUpperCase()}</span>
                </p>
                <p><strong>Time:</strong> {selectedEvent.timestamp}</p>
                <p><strong>Description:</strong></p>
                <p className="description">{selectedEvent.description}</p>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Select an event from the log to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar