const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Property Types
export interface Property {
  id: number;
  title: string;
  location: string;
  starting_price: number;
  evaluation_price: number;
  ai_predicted_price?: number;
  area: number;
  floor: string;
  built_date: string;
  usage_type: string;
  status: string;
  time_left: string;
  risk_level: 'low' | 'medium' | 'high';
  difficulty_rating: number;
  loan_max_loan?: number;
  loan_down_payment?: number;
  loan_monthly_payment?: number;
  tags: string[];
  images: string[];
  property_type: 'commercial' | 'residential';
  profit_potential: number;
  description?: string;
  court?: string;
  case_number?: string;
}

export interface Analysis {
  id: number;
  property_id: number;
  ai_predicted_price: number;
  risk_level: string;
  risk_factors: string[];
  investment_rating: number;
  recommendations: string[];
  market_analysis: string;
  loan_analysis: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
}

// API Functions
export const api = {
  // Properties
  async getProperties(params?: {
    page?: number;
    limit?: number;
    status?: string;
    property_type?: string;
    risk_level?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
  }): Promise<Property[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const response = await fetch(`${API_BASE}/properties?${queryParams}`);
    const result: ApiResponse<Property[]> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  async getProperty(id: number): Promise<Property> {
    const response = await fetch(`${API_BASE}/properties/${id}`);
    const result: ApiResponse<Property> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async searchProperties(q: string): Promise<Property[]> {
    const response = await fetch(`${API_BASE}/properties/search?q=${encodeURIComponent(q)}`);
    const result: ApiResponse<Property[]> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  // Analyses
  async createAnalysis(propertyId: number): Promise<Analysis> {
    const response = await fetch(`${API_BASE}/analyses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    });
    const result: ApiResponse<Analysis> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async getAnalysis(propertyId: number): Promise<Analysis> {
    const response = await fetch(`${API_BASE}/analyses/property/${propertyId}`);
    const result: ApiResponse<Analysis> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  async getAnalysisHistory(): Promise<Analysis[]> {
    const response = await fetch(`${API_BASE}/analyses/history`);
    const result: ApiResponse<Analysis[]> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  // Users
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async register(username: string, email: string, password: string) {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async getUserInfo(): Promise<User> {
    const response = await fetch(`${API_BASE}/users/me`);
    const result: ApiResponse<User> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  // Favorites
  async getFavorites(): Promise<Property[]> {
    const response = await fetch(`${API_BASE}/users/favorites`);
    const result: ApiResponse<Property[]> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  async addFavorite(propertyId: number) {
    const response = await fetch(`${API_BASE}/users/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
  },

  async removeFavorite(propertyId: number) {
    const response = await fetch(`${API_BASE}/users/favorites/${propertyId}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
  },

  // History
  async getHistory(): Promise<Property[]> {
    const response = await fetch(`${API_BASE}/users/history`);
    const result: ApiResponse<Property[]> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },
};
