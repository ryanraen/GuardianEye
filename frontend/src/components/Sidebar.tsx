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
      case 'fall': return '🚨'
      case 'medical': return '🏥'
      case 'hazard': return '⚠️'
      case 'security': return '🔒'
      default: return '📋'
    }
  }

  const getEventDescription = (event: Event) => {
    switch (event.type) {
      case 'fall': return 'Fall detected - immediate attention required'
      case 'medical': return 'Medical emergency - assistance needed'
      case 'hazard': return 'Safety hazard detected - potential risk'
      case 'security': return 'Unauthorized access or security concern'
      default: return event.description
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const eventTime = new Date(timestamp)
    const diffSeconds = Math.floor((now.getTime() - eventTime.getTime()) / 1000)
    return `${diffSeconds}s ago`
  }

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h2 className="section-title">SAFETY ALERTS</h2>
        <div className="events-list">
          {events.map((event) => (
            <div
              key={event.id}
              className={`event-item ${selectedEvent?.id === event.id ? 'selected' : ''}`}
              onClick={() => onEventSelect(event)}
            >
              <div className="event-header">
                <span className="event-icon">{getEventIcon(event.type)}</span>
                <span className="event-type">{event.type.toUpperCase()}</span>
              </div>
              <div className="event-description">{getEventDescription(event)}</div>
              <div className="event-location">{event.location}</div>
              <div className="event-time">{getTimeAgo(event.timestamp)}</div>
              <div className="event-actions">
                <button className="action-button dismiss-button">
                  ✓ Acknowledge
                </button>
                <button className="action-button alert-button">
                  🚑 Call Caregiver
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h2 className="section-title">PATIENT SUMMARY</h2>
        <div className="summary-content">
          {selectedEvent ? (
            <div className="event-summary">
              <div className="summary-header">
                <span className="summary-icon">{getEventIcon(selectedEvent.type)}</span>
                <span className="summary-type">{selectedEvent.type.toUpperCase()} ALERT</span>
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
              <p>Select a safety alert to view patient details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar