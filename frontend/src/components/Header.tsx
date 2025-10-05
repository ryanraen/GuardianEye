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
    })
    const date = now.toLocaleDateString('en-CA') // YYYY-MM-DD format
    return { time, date }
  }


  const { time, date } = getCurrentDateTime()

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <h1 className="logo">GUARDIAN EYE</h1>
          <p className="slogan">AI Vision Agent for Elderly Safety</p>
        </div>
        <div className="datetime-section">
          <span className="time">{time}</span>
          <span className="date">{date}</span>
        </div>
      </div>
    </header>
  )
}

export default Header