// API service layer for GuardianEye backend integration

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface DetectionRequest {
  base64_image: string;
  location: string;
  time: string; // ISO string format
}

export interface DetectionResult {
  incident: string;
  emergency_level: 'high' | 'medium' | 'low' | 'None';
  summary: string;
  suggestion: string;
}

export interface DetectionResponse {
  detections: DetectionResult[];
  danger: boolean;
}

export interface Camera {
  id: string;
  location: string;
  status: 'active' | 'offline' | 'error';
  lastUpdate: string;
}

export interface Event {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  location: string;
  description: string;
  cameraId: string;
  // AI detection fields (optional for backward compatibility)
  aiSummary?: string;
  aiSuggestion?: string;
  // Video clip for AI-generated events
  videoClipUrl?: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    throw new ApiError(response.status, `API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

export const api = {
  // AI Detection
  async processImage(imageData: string, location: string): Promise<DetectionResponse> {
    const request: DetectionRequest = {
      base64_image: imageData,
      location,
      time: new Date().toISOString()
    };
    
    return apiRequest<DetectionResponse>('/detection/process', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Camera Management
  async getCameras(): Promise<Camera[]> {
    return apiRequest<Camera[]>('/cameras');
  },

  // Event Management
  async getEvents(): Promise<Event[]> {
    return apiRequest<Event[]>('/events');
  },

  // Health Check
  async healthCheck(): Promise<HealthStatus> {
    return apiRequest<HealthStatus>('/health');
  },

  // Utility function to convert image file to base64
  async imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Utility function to capture frame from video element
  async captureVideoFrame(video: HTMLVideoElement, location: string): Promise<DetectionResponse> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    return this.processImage(base64Image, location);
  }
};

export default api;
