// 用户认证 API 封装

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

// Token 管理
const TOKEN_KEY = 'ai_fapai_token';
const USER_KEY = 'ai_fapai_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};
export const setStoredUser = (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem(USER_KEY);

// 检查是否已登录
export const isAuthenticated = () => {
  const token = getToken();
  const user = getStoredUser();
  return !!(token && user);
};

// 检查是否是管理员
export const isAdmin = () => {
  const user = getStoredUser();
  return user?.role === 'admin';
};

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

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  points?: number;
  created_at?: string;
}

export interface Property {
  id: number;
  title: string;
  location: string;
  starting_price: number;
  evaluation_price: number;
  ai_predicted_price?: number;
  current_price?: number;
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
  created_at?: string;
  updated_at?: string;
}

export interface Analysis {
  id: number;
  property_id: number;
  user_id?: number;
  ai_predicted_price: number;
  risk_level: string;
  risk_factors: string[];
  investment_rating: number;
  recommendations: string[];
  market_analysis: string;
  loan_analysis: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

// API Functions
export const api = {
  // ==================== 认证 ====================
  
  // 注册
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

  // 登录
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    
    // 保存 token 和用户信息
    if (result.data?.token) {
      setToken(result.data.token);
      setStoredUser(result.data.user);
    }
    return result.data;
  },

  // 登出
  async logout() {
    removeToken();
    removeStoredUser();
  },

  // 获取当前用户信息
  async getUserInfo(): Promise<User> {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/users/me`, { headers });
    const result: ApiResponse<User> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data!;
  },

  // 更新用户信息
  async updateUser(data: { username?: string; avatar?: string; phone?: string }) {
    const token = getToken();
    const response = await fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    // 更新本地存储
    if (data.username || data.avatar || data.phone) {
      const currentUser = getStoredUser();
      if (currentUser) {
        setStoredUser({ ...currentUser, ...data });
      }
    }
    return result;
  },

  // 密码找回 - 发送验证码
  async sendResetCode(email: string) {
    const response = await fetch(`${API_BASE}/users/reset-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  // 验证验证码并重置密码
  async resetPassword(email: string, code: string, newPassword: string) {
    const response = await fetch(`${API_BASE}/users/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  // ==================== 房产 ====================
  
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

  // ==================== AI分析 ====================
  
  async createAnalysis(propertyId: number): Promise<Analysis> {
    const token = getToken();
    const response = await fetch(`${API_BASE}/analyses`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/analyses/history`, { headers });
    const result: ApiResponse<Analysis[]> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  // ==================== 收藏 & 历史 ====================
  
  async getFavorites(): Promise<Property[]> {
    const token = getToken();
    const response = await fetch(`${API_BASE}/users/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result: ApiResponse<Property[]> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  async addFavorite(propertyId: number) {
    const token = getToken();
    const response = await fetch(`${API_BASE}/users/favorites`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ propertyId }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
  },

  async removeFavorite(propertyId: number) {
    const token = getToken();
    const response = await fetch(`${API_BASE}/users/favorites/${propertyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
  },

  async getHistory(): Promise<Property[]> {
    const token = getToken();
    const response = await fetch(`${API_BASE}/users/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result: ApiResponse<Property[]> = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  // ==================== 积分 & 充值 ====================
  
  async getPoints(): Promise<{ points: number; orders: any[] }> {
    const token = getToken();
    const response = await fetch(`${API_BASE}/users/points`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async createRechargeOrder(amount: number, points: number) {
    const token = getToken();
    const response = await fetch(`${API_BASE}/users/recharge`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount, points }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  // ==================== 管理后台 ====================
  
  async adminGetUsers(): Promise<User[]> {
    const token = getToken();
    const response = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  async adminUpdateUser(id: number, data: { username?: string; role?: string; points?: number; phone?: string }) {
    const token = getToken();
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
  },

  async adminDeleteUser(id: number) {
    const token = getToken();
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
  },

  async adminGetProperties(): Promise<Property[]> {
    const token = getToken();
    const response = await fetch(`${API_BASE}/admin/properties`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data || [];
  },

  async adminCreateProperty(data: Partial<Property>) {
    const token = getToken();
    const response = await fetch(`${API_BASE}/admin/properties`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async adminUpdateProperty(id: number, data: Partial<Property>) {
    const token = getToken();
    const response = await fetch(`${API_BASE}/admin/properties/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
  },

  async adminDeleteProperty(id: number) {
    const token = getToken();
    const response = await fetch(`${API_BASE}/admin/properties/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
  },

  async adminGetStats() {
    const token = getToken();
    const response = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },
};
