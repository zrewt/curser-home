// src/api/index.ts or similar

import { Question, Difficulty } from '../types';

// Hardcoded deployed backend URL
const API_BASE_URL = 'https://backend-triv.onrender.com/api';

// Use local backend if running locally
const LOCAL_API_BASE_URL = 'http://localhost:3001/api';
const isLocal = window.location.hostname === 'localhost';
const BASE_URL = isLocal ? LOCAL_API_BASE_URL : API_BASE_URL;

type Sport = 'basketball' | 'football' | 'baseball' | 'hockey' | 'soccer' | 'all';

export const api = {
  async getQuestions(count: number = 5, difficulty: Difficulty = 'medium', sport: Sport = 'all'): Promise<Question[]> {
    try {
      // Add timestamp to prevent caching and ensure fresh random questions
      const timestamp = new Date().getTime();
      const response = await fetch(
        `${API_BASE_URL}/questions?count=${count}&difficulty=${difficulty}&sport=${sport}&_t=${timestamp}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },
  async getDailyQuiz(): Promise<Question[]> {
    try {
      const response = await fetch(`${BASE_URL}/daily-quiz`);
      if (!response.ok) {
        throw new Error('Failed to fetch daily quiz');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily quiz:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        alert('Network error: Could not reach the backend.\nCheck if the backend server is running and CORS is enabled.');
      }
      throw error;
    }
  },
};
