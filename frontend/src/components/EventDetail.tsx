import React, { useState } from 'react'
import { Event } from '../App'
import './EventDetail.css'

interface EventDetailProps {
  event: Event
  onBack: () => void
  onDismiss: () => void
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onBack, onDismiss }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  
  // Enhanced event data with more specific incident types and AI analysis
  const enhancedEvent = {
    ...event,
    incidentType: getIncidentType(event.type),
    aiSummary: getAISummary(event),
    suggestions: getSuggestions(event)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return '#44ff44'
      case 'medium': return '#ffaa00'
      case 'high': return '#ff8800'
      case 'critical': return '#ff4444'
      default: return '#888'
    }
  }


  function getIncidentType(eventType: string): string {
    switch (eventType) {
      case 'hazard':
        return 'Water Spill Detected'
      case 'fall':
        return 'Person Fall Incident'
      case 'medical':
        return 'Medical Emergency'
      case 'security':
        return 'Unauthorized Access'
      default:
        return 'Unknown Incident'
    }
  }

  function getAISummary(event: Event): string {
    switch (event.type) {
      case 'hazard':
        return 'AI analysis detected a significant water spill on the kitchen floor. The spill appears to be approximately 2-3 feet in diameter and is spreading toward the dining area. Risk assessment indicates high potential for slip-and-fall accidents. The liquid appears clear and odorless, suggesting it may be water from a leak or spilled beverage.'
      case 'fall':
        return 'Motion sensors and computer vision have detected a person falling in the living room area. The individual appears to be an adult who lost balance and fell backward. Immediate assessment shows no visible signs of consciousness or movement. The fall occurred near furniture which may have caused additional injury. Emergency response protocols have been automatically triggered.'
      case 'medical':
        return 'Unusual movement patterns detected suggesting a potential medical emergency. The individual appears to be experiencing distress, showing signs of difficulty breathing and unsteady movement. The person has been stationary for extended periods and is displaying erratic behavior patterns consistent with medical distress or confusion.'
      case 'security':
        return 'Perimeter breach detected at the main entrance. An unidentified individual has entered the premises without authorization. The person appears to be wearing dark clothing and is moving cautiously through the area. Security protocols indicate this is not a recognized resident or authorized personnel. The individual is currently in the hallway moving toward the living quarters.'
      default:
        return 'AI analysis is currently processing this incident. Detailed analysis will be available shortly.'
    }
  }

  function getSuggestions(event: Event): string[] {
    switch (event.type) {
      case 'hazard':
        return [
          'Clean up the spill immediately to avoid slip-and-fall injuries',
          'Place warning signs around the affected area',
          'Check for the source of the water leak',
          'Document the incident for insurance purposes'
        ]
      case 'fall':
        return [
          'Contact emergency services immediately (911)',
          'Do not move the person unless in immediate danger',
          'Check for responsiveness and breathing',
          'Gather medical information if person is conscious'
        ]
      case 'medical':
        return [
          'Approach the person calmly and assess their condition',
          'Call emergency medical services if needed',
          'Stay with the person until help arrives',
          'Document symptoms and behavior for medical personnel'
        ]
      case 'security':
        return [
          'Contact local law enforcement immediately',
          'Do not approach the unauthorized individual',
          'Ensure all residents are safe and accounted for',
          'Activate additional security measures if available'
        ]
      default:
        return [
          'Assess the situation carefully',
          'Contact appropriate authorities if needed',
          'Document the incident for follow-up'
        ]
    }
  }

  const handlePlayVideo = () => {
    setIsVideoPlaying(true)
    // In a real app, this would play the actual cached video clip
    console.log('Playing cached video clip for event:', event.id)
  }

  return (
    <div className="event-detail">
      <div className="event-detail-header">
        <button className="back-button" onClick={onBack}>
          ← BACK TO ALERTS
        </button>
        <h1 className="event-title">ALERT DETAIL</h1>
        <div className="event-severity">
          <span 
            className="severity-indicator"
            style={{ backgroundColor: getSeverityColor(event.severity) }}
          ></span>
          <span className="severity-text">{event.severity.toUpperCase()}</span>
        </div>
      </div>

      <div className="event-detail-content">
        <div className="video-section">
          <div className="video-container">
            {isVideoPlaying ? (
              <div className="video-player">
                <div className="video-placeholder">
                  <div className="video-content">
                    <div className="video-icon">🎥</div>
                    <p>Playing cached clip...</p>
                    <p className="event-location">{event.location}</p>
                    <p className="video-note">5-second clip from {event.timestamp}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="video-thumbnail" onClick={handlePlayVideo}>
                <div className="thumbnail-content">
                  <div className="play-button">▶️</div>
                  <div className="video-icon">🎥</div>
                  <p>Click to play cached clip</p>
                  <p className="event-location">{event.location}</p>
                  <p className="video-note">5-second clip from {event.timestamp}</p>
                </div>
              </div>
            )}
          </div>
          
                  <div className="video-actions">
                    <button className="action-button dismiss" onClick={onDismiss}>
                      ✖️ DISMISS
                    </button>
            <button className="action-button notify">
              📢 NOTIFY
            </button>
            <button className="action-button emergency">
              🚨 CONTACT EMERGENCY
            </button>
          </div>
        </div>

        <div className="event-info-section">
          <h2 className="section-title">ALERT INFORMATION</h2>
          <div className="event-info-content">
            <div className="event-header-info">
              <div className="event-type-info">
                <span className="event-type-text">{enhancedEvent.incidentType}</span>
              </div>
              <div className="event-time-info">
                <span className="time-label">Detected:</span>
                <span className="time-value">{event.timestamp}</span>
              </div>
            </div>

            <div className="event-details-grid">
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{event.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Severity:</span>
                  <span 
                    className="detail-value severity-value"
                    style={{ color: getSeverityColor(event.severity) }}
                  >
                    {event.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="ai-summary-section">
              <span className="detail-label">AI Analysis:</span>
              <div className="ai-summary-content">
                {enhancedEvent.aiSummary}
              </div>
            </div>

            <div className="suggestions-section">
              <span className="detail-label">Recommended Actions:</span>
              <div className="suggestions-content">
                {enhancedEvent.suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    <span className="suggestion-number">{index + 1}.</span>
                    <span className="suggestion-text">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail
