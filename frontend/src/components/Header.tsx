import React from 'react'
import './Header.css'

const Header: React.FC = () => {
  const getCurrentDateTime = () => {
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    }) + '.' + now.getMilliseconds().toString().padStart(3, '0')
    const date = now.toLocaleDateString('en-CA') // YYYY-MM-DD format
    return { time, date }
  }

  const { time, date } = getCurrentDateTime()

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <h1 className="logo">GuardianEye</h1>
          <div className="tagline">AI Vision Agent for Elderly Safety</div>
        </div>
        <nav className="navigation">
          <a href="#" className="nav-link">🏠 Home</a>
          <a href="#" className="nav-link active">👁️ Monitor</a>
          <a href="#" className="nav-link">📊 Analytics</a>
          <a href="#" className="nav-link">⚙️ Settings</a>
        </nav>
        <div className="user-section">
          <span className="user-greeting">Monitoring: Senior Care Facility</span>
          <div className="datetime-section">
            <span className="time">{time}</span>
            <span className="date">{date}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header