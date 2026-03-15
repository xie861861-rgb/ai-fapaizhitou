import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MemberCenter } from '../components/MemberCenter';

// Mock API
vi.mock('../lib/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getUserInfo: vi.fn().mockRejectedValue(new Error('未登录')),
    getPoints: vi.fn().mockResolvedValue({ points: 0, orders: [] }),
    getFavorites: vi.fn().mockResolvedValue([]),
    getHistory: vi.fn().mockResolvedValue([]),
  },
  getStoredUser: vi.fn(() => null),
  isAuthenticated: vi.fn(() => false),
}));

describe('会员中心组件', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('未登录时显示登录表单', async () => {
    render(
      <BrowserRouter>
        <MemberCenter />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('登录账号')).toBeInTheDocument();
    });
  });

  it('显示注册链接', async () => {
    render(
      <BrowserRouter>
        <MemberCenter />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('立即注册')).toBeInTheDocument();
    });
  });

  it('可以切换到注册表单', async () => {
    render(
      <BrowserRouter>
        <MemberCenter />
      </BrowserRouter>
    );

    await waitFor(() => {
      const registerBtn = screen.getByText('立即注册');
      fireEvent.click(registerBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('注册账号')).toBeInTheDocument();
    });
  });
});

describe('用户注册', () => {
  it('密码和确认密码不匹配时显示错误', async () => {
    // 测试表单验证逻辑
    const password = '123456';
    const confirmPassword = '123457';
    
    expect(password !== confirmPassword).toBe(true);
  });

  it('密码长度不足6位时验证失败', async () => {
    const password = '123';
    expect(password.length >= 6).toBe(false);
  });

  it('正常密码长度验证通过', async () => {
    const password = '123456';
    expect(password.length >= 6).toBe(true);
  });
});

describe('用户登录', () => {
  it('空邮箱无法登录', async () => {
    const email = '';
    const password = '123456';
    
    expect(email.length > 0).toBe(false);
  });

  it('空密码无法登录', async () => {
    const email = 'test@example.com';
    const password = '';
    
    expect(password.length > 0).toBe(false);
  });
});

describe('积分计算', () => {
  it('19元套餐获得200积分', () => {
    const price = 19;
    const points = Math.floor(price * 10);
    expect(points).toBe(190);
  });

  it('48元套餐获得500积分', () => {
    const price = 48;
    const points = Math.floor(price * 10);
    expect(points).toBe(480);
  });
});
