# GuardianEye
## AI-Powered Home Safety and Incident Detection System
### Overview
GuardianEye is an intelligent home safety monitoring system that uses real-time computer vision and AI reasoning to detect potential risks, emergencies, or unusual behaviors from live camera feeds.
When the system detects a dangerous situation (such as a fall, smoke, or hazardous motion), it allows the security monitortrigger notifications — for example, sending SMS alerts via Twilio — to keep users informed and safe.
GuardianEye integrates cutting-edge AI tools, cloud infrastructure, and a modern web interface to provide a seamless safety monitoring experience.
### Features
#### Real-Time AI Vision
* Captures live video frames from a webcam using MediaPipe.
* Performs intelligent visual analysis via Google Gemini AI using the Strands framework.
* Detects ambiguous or dangerous situations (e.g., falls, unsafe movements, water spills).
#### Intelligent Incident Analysis
The backend runs a Gemini 2.5 Flash model prompt-engineered to identify safety incidents in the following format:
```JSON
[
  {
    "incident": "Fall detected",
    "emergency_level": "high",
    "summary": "A person appears to have fallen near the kitchen area.",
    "suggestion": "Check on the individual immediately and call emergency services if necessary."
  }
]
```
#### Real-Time Alerts
* Integrates Twilio SMS API to send immediate text alerts to caregivers or homeowners when an emergency is detected.
* GuardianEye Alert: Possible fall detected in the living room. Please check immediately.
#### Modular Architecture
* Frontend (React + TypeScript): clean interface for live camera view and status dashboard.
* Backend (FastAPI + Python): handles AI inference and Twilio notifications.
* AI Service Layer: leverages Google Gemini through Strands SDK for scalable, interpretable reasoning.
### Setup Guide
1. Clone the Repository
```bash
$ git clone https://github.com/ryanraen/GuardianEye.git
$ cd GuardianEye
```
2. Backend Setup
```bash
$ cd backend
$ python -m venv venv
$ source venv/bin/activate
$ pip install -r requirements.txt
```
3. Create a .env file in the backend directory:
```.env
GEMINI_API_KEY=your_google_genai_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_MESSAGING_SERVICE_SID=your_twilio_service_sid
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```
4. Run the backend:
```bash
python routes/app.py
```
5. Frontend Setup
```bash
cd frontend
npm install
npm start
```
### Tech Stack
#### Layer	Technology
* Frontend:	React, TypeScript, MediaPipe, TailwindCSS
* Backend:	FastAPI, Python, Strands SDK, Google Gemini
#### Notifications	
* Twilio API
#### AI Model
* Gemini 2.5 Flash
#### Runtime
* Frontend: Node.js
* Backend: Uvicorn
