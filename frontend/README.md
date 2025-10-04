# GuardianEye - Computer Vision Hazard Tracking

A React TypeScript frontend for tracking dangerous hazards through cameras in houses to prevent elderly individuals from injuring themselves.

## Features

- **Real-time Camera Monitoring**: Grid-based camera tiles showing live feeds from different locations
- **Event Log**: Left sidebar displaying chronological list of detected events
- **Event Summary**: Detailed view of selected events with severity indicators
- **Camera Status Indicators**: Real-time status of all connected cameras
- **Dark Theme**: Professional monitoring interface inspired by command center designs

## Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Top header with logo and timestamp
│   ├── Sidebar.tsx         # Left sidebar with events log and summary
│   ├── CameraGrid.tsx      # Grid container for camera tiles
│   ├── CameraTile.tsx      # Individual camera tile component
│   └── CameraIndicator.tsx # Bottom-right camera count indicator
├── App.tsx                 # Main application component
└── index.tsx              # Application entry point
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Design Features

- **Monospace Typography**: Technical, command-center aesthetic
- **Color-coded Severity**: Green (healthy), Red (critical), Orange (high), Yellow (medium)
- **Responsive Grid**: Auto-fitting camera tiles that adapt to screen size
- **Event Timeline**: Chronological event logging with visual indicators
- **Real-time Updates**: Timestamp displays and status indicators

## Backend Integration

This frontend is designed to work with a Flask/Python backend that provides:
- Camera feed endpoints
- Event detection APIs
- Real-time WebSocket connections
- Camera status monitoring

The mock data in `App.tsx` should be replaced with actual API calls once the backend is ready.

## Technologies Used

- React 18
- TypeScript
- CSS3 with Flexbox and Grid
- Monospace font styling for technical aesthetic
