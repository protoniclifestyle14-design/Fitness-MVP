// API utility for connecting to the Protonic Fitness backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: number;
    email: string;
    email_verified: boolean;
  };
  profile?: {
    name?: string;
    bio?: string;
    avatar_url?: string;
  };
  stats?: {
    total_workouts: number;
    total_minutes: number;
  };
  access_token: string;
  refresh_token: string;
}

// Helper to store tokens
export const storeTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
};

// Helper to get access token
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

// Helper to clear tokens (logout)
export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

// Register new user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const result = await response.json();

  // Store tokens
  if (result.access_token && result.refresh_token) {
    storeTokens(result.access_token, result.refresh_token);
  }

  return result;
};

// Login user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const result = await response.json();

  // Store tokens
  if (result.access_token && result.refresh_token) {
    storeTokens(result.access_token, result.refresh_token);
  }

  return result;
};

// Get current user
export const getCurrentUser = async () => {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get user');
  }

  return response.json();
};

// Logout
export const logout = async () => {
  const refreshToken = typeof window !== 'undefined'
    ? localStorage.getItem('refresh_token')
    : null;

  if (refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  clearTokens();
};

// Health check
export const healthCheck = async () => {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
};
