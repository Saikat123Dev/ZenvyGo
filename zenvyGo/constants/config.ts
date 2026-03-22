import Constants from 'expo-constants';

// API Configuration
// The API URL is loaded from environment variables
// For development:
//   - Android emulator: use http://10.0.2.2:3000/api/v1
//   - iOS simulator: use http://localhost:3000/api/v1
//   - Physical device: use your machine's LAN IP (e.g., http://192.168.1.100:3000/api/v1)
// For production: use your deployed backend URL
export const API_URL =  'https://zenvygo-production.up.railway.app/api/v1';

export const config = {
  apiUrl: API_URL,
};
