import React from 'react'
import { Event } from '../App'
import './Sidebar.css'

interface SidebarProps {
  events: Event[]
  onEventClick: (alert: Event) => void
  cameras: { status: string }[]
}

const Sidebar: React.FC<SidebarProps> = ({ events, onEventClick, cameras }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff4444'
      case 'high': return '#ff8800'
      case 'medium': return '#ffaa00'
      case 'low': return '#44ff44'
      default: return '#888'
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h2 className="section-title">SAFETY ALERTS</h2>
        <div className="events-list">
          {events.map((event) => (
            <div
              key={event.id}
              className="event-item"
              onClick={() => onEventClick(event)}
              title="Click to view alert detail"
            >
              <div className="event-header">
                <span 
                  className="severity-indicator"
                  style={{ backgroundColor: getSeverityColor(event.severity) }}
                ></span>
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

      <div className="cameras-status-section">
        <span className="cameras-status-text">
          {cameras.filter(c => c.status === 'active').length}/{cameras.length} CAMERAS ONLINE
        </span>
      </div>
    </div>
  )
}

export default Sidebar