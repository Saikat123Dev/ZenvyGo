import Constants from 'expo-constants';

// API Configuration
// The API URL is loaded from environment variables
// For development:
//   - Android emulator: use http://10.0.2.2:3000/api/v1
//   - iOS simulator: use http://localhost:3000/api/v1
//   - Physical device: use your machine's LAN IP (e.g., http://192.168.1.100:3000/api/v1)
// For production: use your deployed backend URL
export const API_URL =  'https://eb85-2402-3a80-4710-f9e6-b557-3352-c20d-36f1.ngrok-free.app/api/v1';

export const config = {
  apiUrl: API_URL,
};
