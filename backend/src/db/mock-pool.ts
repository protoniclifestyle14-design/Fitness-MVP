// Mock database pool for demo purposes (no real database required)

interface QueryResult {
  rows: any[];
  rowCount: number;
}

class MockPool {
  private users: any[] = [];
  private userProfiles: any[] = [];
  private userStats: any[] = [];
  private refreshTokens: any[] = [];
  private resetTokens: any[] = [];
  private currentUserId = 1;

  async query(text: string, params?: any[]): Promise<QueryResult> {
    // Mock different queries based on the SQL text

    // Check if user exists
    if (text.includes('SELECT 1 FROM users WHERE email')) {
      const email = params?.[0];
      const user = this.users.find(u => u.email === email);
      return { rows: user ? [{ '?column?': 1 }] : [], rowCount: user ? 1 : 0 };
    }

    // Register new user
    if (text.includes('INSERT INTO users')) {
      const [email, password_hash] = params || [];
      const newUser = {
        id: this.currentUserId++,
        email,
        password_hash,
        is_active: true,
        email_verified: false,
        created_at: new Date(),
      };
      this.users.push(newUser);
      return { rows: [{ id: newUser.id, email: newUser.email, email_verified: newUser.email_verified }], rowCount: 1 };
    }

    // Insert user profile
    if (text.includes('INSERT INTO user_profiles')) {
      const [user_id, name] = params || [];
      this.userProfiles.push({ user_id, name });
      return { rows: [], rowCount: 1 };
    }

    // Insert user stats
    if (text.includes('INSERT INTO user_stats')) {
      const [user_id] = params || [];
      this.userStats.push({ user_id, total_workouts: 0, total_minutes: 0 });
      return { rows: [], rowCount: 1 };
    }

    // Login - get user by email
    if (text.includes('SELECT id, email, password_hash, email_verified, is_active FROM users')) {
      const email = params?.[0];
      const user = this.users.find(u => u.email === email);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }

    // Get user profile
    if (text.includes('SELECT name, bio, avatar_url FROM user_profiles')) {
      const user_id = params?.[0];
      const profile = this.userProfiles.find(p => p.user_id === user_id);
      return { rows: profile ? [profile] : [{ name: null, bio: null, avatar_url: null }], rowCount: 1 };
    }

    // Get user stats
    if (text.includes('SELECT total_workouts, total_minutes FROM user_stats')) {
      const user_id = params?.[0];
      const stats = this.userStats.find(s => s.user_id === user_id) || { total_workouts: 0, total_minutes: 0 };
      return { rows: [stats], rowCount: 1 };
    }

    // Store refresh token
    if (text.includes('INSERT INTO refresh_tokens')) {
      const [user_id, token_hash, expires_at] = params || [];
      this.refreshTokens.push({ user_id, token_hash, expires_at, revoked: false });
      return { rows: [], rowCount: 1 };
    }

    // Validate refresh token
    if (text.includes('SELECT user_id FROM refresh_tokens')) {
      const token_hash = params?.[0];
      const token = this.refreshTokens.find(t => t.token_hash === token_hash && !t.revoked);
      return { rows: token ? [{ user_id: token.user_id }] : [], rowCount: token ? 1 : 0 };
    }

    // Revoke refresh token
    if (text.includes('UPDATE refresh_tokens SET revoked')) {
      const token_hash = params?.[0];
      const token = this.refreshTokens.find(t => t.token_hash === token_hash);
      if (token) token.revoked = true;
      return { rows: [], rowCount: token ? 1 : 0 };
    }

    // Store password reset token
    if (text.includes('INSERT INTO password_reset_tokens')) {
      const [user_id, token_hash, expires_at] = params || [];
      this.resetTokens.push({ user_id, token_hash, expires_at, used: false });
      return { rows: [], rowCount: 1 };
    }

    // Validate reset token
    if (text.includes('SELECT user_id FROM password_reset_tokens')) {
      const token_hash = params?.[0];
      const token = this.resetTokens.find(t => t.token_hash === token_hash && !t.used);
      return { rows: token ? [{ user_id: token.user_id }] : [], rowCount: token ? 1 : 0 };
    }

    // Mark reset token as used
    if (text.includes('UPDATE password_reset_tokens SET used')) {
      const token_hash = params?.[0];
      const token = this.resetTokens.find(t => t.token_hash === token_hash);
      if (token) token.used = true;
      return { rows: [], rowCount: token ? 1 : 0 };
    }

    // Update password
    if (text.includes('UPDATE users SET password_hash')) {
      const [password_hash, user_id] = params || [];
      const user = this.users.find(u => u.id === user_id);
      if (user) user.password_hash = password_hash;
      return { rows: [], rowCount: user ? 1 : 0 };
    }

    // Get user by ID (for /auth/me)
    if (text.includes('SELECT id, email, email_verified, is_active, created_at FROM users WHERE id')) {
      const user_id = params?.[0];
      const user = this.users.find(u => u.id === user_id);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }

    // Default empty response
    console.log('Unhandled query:', text.substring(0, 100));
    return { rows: [], rowCount: 0 };
  }

  on(event: string, handler: Function) {
    // Mock event handler - do nothing
  }
}

export default new MockPool();
