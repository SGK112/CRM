const BACKEND_URL = 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  workspaceId: string;
  isEmailVerified: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  message: string;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          this.user = JSON.parse(savedUser);
        } catch (e) {
          // Invalid user data
        }
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    
    // Store token and user
    this.token = data.accessToken;
    this.user = data.user;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    workspaceName: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    
    // Store token and user
    this.token = data.accessToken;
    this.user = data.user;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  logout(): void {
    this.token = null;
    this.user = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Auto-login with demo credentials for development
  async demoLogin(): Promise<void> {
    try {
      // Try to login with demo credentials
      await this.login('test@example.com', 'password123');
    } catch (error) {
      // If demo user doesn't exist, create it
      try {
        await this.register({
          firstName: 'Demo',
          lastName: 'User',
          email: 'test@example.com',
          password: 'password123',
          workspaceName: 'Demo Workspace'
        });
      } catch (registerError) {
        // Silent fail for demo mode
      }
    }
  }
}

export const authService = AuthService.getInstance();