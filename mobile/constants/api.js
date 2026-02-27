// Use environment variable or localhost fallback
// For physical device: change to your computer's IP like http://192.168.1.x:5001/api
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001/api";
