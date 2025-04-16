import axios from 'axios';

// Debug environment variables
console.log('Environment variables:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  NODE_ENV: process.env.NODE_ENV
});

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const testApi = async () => {
  try {
    const response = await api.get('/test');
    return response.data;
  } catch (error) {
    console.error('Error testing API:', error);
    throw error;
  }
};

export const connectTelegram = async (username: string, chatId: string) => {
  try {
    const response = await api.post('/connect', { username, chatId });
    return response.data;
  } catch (error) {
    console.error('Error connecting Telegram:', error);
    throw error;
  }
};

export const sendMessage = async (username: string, message: string) => {
  try {
    const response = await api.post('/send', { username, message });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getUserInfo = async (username: string) => {
  try {
    const response = await api.get(`/user/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
}; 