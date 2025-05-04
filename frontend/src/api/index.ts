import axios from 'axios';

// Create a base API instance with common configuration
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
