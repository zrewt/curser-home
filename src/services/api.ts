// src/api/index.ts or similar

import { Question } from '../types';

// Hardcoded deployed backend URL
const API_BASE_URL = 'https://backend-triv.onrender.com/api';

export const api = {
  async getDifficulties(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/difficulties`);
      if (!response.ok) {
        throw new Error('Failed to fetch difficulties');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching difficulties:', error);
      throw error;
    }
  },

  async getQuestions(count: number = 5, difficulty?: string): Promise<Question[]> {
    try {
      // Add timestamp to prevent caching and ensure fresh random questions
      const timestamp = new Date().getTime();
      const url = new URL(`${API_BASE_URL}/questions`);
      url.searchParams.append('count', count.toString());
      url.searchParams.append('_t', timestamp.toString());
      if (difficulty) {
        url.searchParams.append('difficulty', difficulty);
      }
      
      const response = await fetch(url.toString());
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
