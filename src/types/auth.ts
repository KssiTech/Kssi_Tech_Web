// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // This will be hashed
  role: 'admin' | 'user';
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  profile: {
    firstName: string;
    lastName: string;
    department?: string;
    phone?: string;
  };
}

// Authentication result interface
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
}

// User creation interface
export interface CreateUserData {
  username: string;
  email: string;
  role: 'admin' | 'user';
  permissions: string[];
  isActive: boolean;
  profile: {
    firstName: string;
    lastName: string;
    department?: string;
    phone?: string;
  };
  password: string;
}
