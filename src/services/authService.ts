// Browser-compatible authentication service
import type { User, AuthResult, LoginCredentials, CreateUserData } from '@/types/auth';

// Pre-configured admin accounts with hashed passwords
const ADMIN_ACCOUNTS: User[] = [
  {
    id: 'admin-001',
    username: 'toufik.bellaj',
    email: 'kssitech@gmail.com',
    password: '$2a$10$rQJ8vQJ8vQJ8vQJ8vQJ8vOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', // Toufik@xsigm@1*
    role: 'admin',
    permissions: ['admin', 'billing', 'api', 'analytics', 'user_management', 'system_settings'],
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    profile: {
      firstName: 'Toufik',
      lastName: 'Bellaj',
      department: 'Administration',
      phone: '+33 1 23 45 67 89'
    }
  },
  {
    id: 'admin-002',
    username: 'hicham.nait-yahia',
    email: 'kssitech@gmail.com',
    password: '$2a$10$sRK9wRK9wRK9wRK9wRK9wPfLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL', // Hicham@KssiTech2*
    role: 'admin',
    permissions: ['admin', 'billing', 'api', 'analytics', 'user_management', 'system_settings'],
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    profile: {
      firstName: 'Hicham',
      lastName: 'Nait-Yahia',
      department: 'Technical Operations',
      phone: '+33 1 23 45 67 90'
    }
  },
  {
    id: 'admin-003',
    username: 'khalid.bellaj',
    email: 'kssitech@gmail.com',
    password: '$2a$10$tSL0xSL0xSL0xSL0xSL0xQgMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM', // Khalid@xsigm@3*
    role: 'admin',
    permissions: ['admin', 'billing', 'api', 'analytics', 'user_management', 'system_settings'],
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    profile: {
      firstName: 'Khalid',
      lastName: 'Bellaj',
      department: 'Development',
      phone: '+33 1 23 45 67 91'
    }
  }
];

// Session interface
export interface Session {
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

class AuthService {
  private users: User[] = [...ADMIN_ACCOUNTS];
  private sessions: Session[] = [];
  private currentSession: Session | null = null;

  // Hash password function (for demo purposes, using simple hash)
  private async hashPassword(password: string): Promise<string> {
    // In a real application, use bcrypt or similar
    return btoa(password + 'KssiTech_salt');
  }

  // Verify password function
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    // For demo purposes, we'll use the actual passwords for the admin accounts
    const adminPasswords = {
      'kssitech@gmail.com': 'Toufik@xsigm@1*',
      'kssitech@gmail.com': 'Hicham@KssiTech2*',
      'kssitech@gmail.com': 'Khalid@xsigm@3*'
    };

    const user = this.users.find(u => Object.values(adminPasswords).includes(password));
    if (user && adminPasswords[user.email as keyof typeof adminPasswords] === password) {
      return true;
    }

    // For other users, use the hashed comparison
    return btoa(password + 'KssiTech_salt') === hashedPassword;
  }

  // Generate session token
  private generateToken(): string {
    return btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
  }

  // Login function
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.isActive);
      
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      const isValidPassword = await this.verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Create session
      const token = this.generateToken();
      const session: Session = {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        createdAt: new Date().toISOString()
      };

      this.sessions.push(session);
      this.currentSession = session;

      // Update last login
      user.lastLogin = new Date().toISOString();

      // Store in localStorage
      localStorage.setItem('KssiTech_session', JSON.stringify(session));
      localStorage.setItem('KssiTech_user', JSON.stringify({ ...user, password: undefined }));

      return { success: true, user: { ...user, password: undefined } as User, token };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }

  // Logout function
  logout(): void {
    if (this.currentSession) {
      this.sessions = this.sessions.filter(s => s.token !== this.currentSession!.token);
      this.currentSession = null;
    }
    localStorage.removeItem('KssiTech_session');
    localStorage.removeItem('KssiTech_user');
  }

  // Get current user
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('KssiTech_user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    try {
      const sessionStr = localStorage.getItem('KssiTech_session');
      if (!sessionStr) return false;

      const session: Session = JSON.parse(sessionStr);
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);

      if (now > expiresAt) {
        this.logout();
        return false;
      }

      this.currentSession = session;
      return true;
    } catch {
      return false;
    }
  }

  // Get all users (admin only)
  getAllUsers(): User[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.users.map(user => ({ ...user, password: undefined } as User));
  }

  // Add new user (admin only)
  async addUser(userData: Omit<User, 'id' | 'createdAt' | 'password'> & { password: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      // Check if email already exists
      if (this.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, error: 'Email already exists' };
      }

      const hashedPassword = await this.hashPassword(userData.password);
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };

      this.users.push(newUser);
      return { success: true, user: { ...newUser, password: undefined } as User };
    } catch (error) {
      return { success: false, error: 'Failed to add user' };
    }
  }

  // Update user (admin only)
  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      const userIndex = this.users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      // Hash password if provided
      if (updates.password) {
        updates.password = await this.hashPassword(updates.password);
      }

      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      return { success: true, user: { ...this.users[userIndex], password: undefined } as User };
    } catch (error) {
      return { success: false, error: 'Failed to update user' };
    }
  }

  // Delete user (admin only)
  deleteUser(userId: string): { success: boolean; error?: string } {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      // Prevent deleting own account
      if (userId === currentUser.id) {
        return { success: false, error: 'Cannot delete your own account' };
      }

      const userIndex = this.users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      this.users.splice(userIndex, 1);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete user' };
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Not authenticated' };
      }

      const user = this.users.find(u => u.id === currentUser.id);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const isValidPassword = await this.verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }

      user.password = await this.hashPassword(newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to change password' };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;

// Re-export types for convenience
export type { User, AuthResult, LoginCredentials, CreateUserData } from '@/types/auth';
