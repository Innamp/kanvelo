import { ROLES } from '../constants';

const API_BASE = 'api.php';
const STORAGE_KEY = 'novaboard_users_list';
const ACTIVE_USER_KEY = 'novaboard_active_user';

export const DEFAULT_USERS = [
  {
    id: 'usr-1',
    name: 'John Doe',
    email: 'john.doe@novaboard.io',
    role: ROLES.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'
  },
  {
    id: 'usr-2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@novaboard.io',
    role: ROLES.CONTRIBUTOR,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop'
  },
  {
    id: 'usr-3',
    name: 'Alex Rivera',
    email: 'alex.r@novaboard.io',
    role: ROLES.CONTRIBUTOR,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop'
  },
  {
    id: 'usr-4',
    name: 'Guest Viewer',
    email: 'guest.viewer@novaboard.io',
    role: ROLES.VIEWER,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop'
  }
];

class UserService {
  constructor() {
    this.isApiAvailable = null;
  }

  async checkApiAvailability() {
    if (this.isApiAvailable !== null) return this.isApiAvailable;
    try {
      const res = await fetch(`${API_BASE}?action=get_users`, { method: 'GET' });
      this.isApiAvailable = res.ok;
    } catch {
      this.isApiAvailable = false;
    }
    return this.isApiAvailable;
  }

  async getUsers() {
    const apiAvailable = await this.checkApiAvailability();

    if (apiAvailable) {
      try {
        const res = await fetch(`${API_BASE}?action=get_users`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.users && data.users.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.users));
            return data.users;
          }
        }
      } catch (err) {
        console.warn('User API error, falling back to cache', err);
      }
    }

    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached users', e);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }

  async saveUser(user) {
    const apiAvailable = await this.checkApiAvailability();

    if (apiAvailable) {
      try {
        const res = await fetch(`${API_BASE}?action=save_user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        if (res.ok) {
          const data = await res.json();
          return data.user;
        }
      } catch (err) {
        console.error('Failed to save user via API', err);
      }
    }

    // Local fallback
    const users = await this.getUsers();
    let updated;
    if (user.id) {
      updated = users.map(u => (u.id === user.id ? { ...u, ...user } : u));
    } else {
      const newUser = {
        ...user,
        id: 'usr-' + Date.now()
      };
      updated = [...users, newUser];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return user;
  }

  async deleteUser(userId) {
    const apiAvailable = await this.checkApiAvailability();

    if (apiAvailable) {
      try {
        const res = await fetch(`${API_BASE}?action=delete_user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to delete user');
        }
        return true;
      } catch (err) {
        console.error('Failed to delete user via API', err);
        throw err;
      }
    }

    const users = await this.getUsers();
    const updated = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  }

  getActiveUser() {
    const cached = localStorage.getItem(ACTIVE_USER_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USERS[0]; // John Doe (Admin) by default
  }

  setActiveUser(user) {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  }
}

export const userService = new UserService();
