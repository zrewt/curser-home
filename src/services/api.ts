// src/api/index.ts or similar

import { Question } from '../types';

// Hardcoded deployed backend URL
const API_BASE_URL = 'https://backend-triv.onrender.com/api';

export const api = {
  async getQuestions(count: number = 5): Promise<Question[]> {
    try {
      // Add timestamp to prevent caching and ensure fresh random questions
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/questions?count=${count}&_t=${timestamp}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }
};
