export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  user?: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  message?: string;
  validation?: string[];
}

export interface LoginResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
  needsVerification?: boolean;
  verificationMessage?: string;
}

export async function handleLogin(
  credentials: LoginCredentials
): Promise<LoginResult> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    let data: LoginResponse | null = null;
    try {
      data = await response.json();
    } catch {
      // Ignore JSON parsing errors
    }

    if (response.ok && data?.accessToken) {
      // Store authentication data
      await storeAuthData(data);
      return { success: true, redirectTo: '/dashboard' };
    }

    // Handle different error types
    if (response.status === 400) {
      return {
        success: false,
        error: data?.validation?.[0] || data?.message || 'Validation error'
      };
    }

    if (response.status === 401) {
      const errorMessage = data?.message || 'Invalid credentials';

      // Check if it's an email verification error
      if (errorMessage.includes('verify your email')) {
        return {
          success: false,
          needsVerification: true,
          verificationMessage: errorMessage
        };
      }

      return { success: false, error: errorMessage };
    }

    return {
      success: false,
      error: data?.message || 'Login failed. Please try again.'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.'
    };
  }
}

async function storeAuthData(data: LoginResponse): Promise<void> {
  try {
    // Set cookie with proper expiration and security settings
    if (data.accessToken) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
      document.cookie = `accessToken=${data.accessToken}; Path=/; SameSite=Lax; Expires=${expiryDate.toUTCString()}`;
    }

    // Store in localStorage
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  } catch (error) {
    // Ignore storage errors - auth will still work via cookies
    // Error logging removed for production
  }
}
