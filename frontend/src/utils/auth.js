// Constants for local storage keys
const TOKEN_KEY = 'tpc_auth_token';
const USER_KEY = 'tpc_user';

// Define role constants
export const ROLES = {
  STUDENT: 'STUDENT',
  COMPANY: 'COMPANY',
  TPO: 'TPO',
  ALUMNI: 'ALUMNI'
};

// Define role-based route access
export const ROUTE_ACCESS = {
  '/': [ROLES.STUDENT, ROLES.COMPANY, ROLES.TPO, ROLES.ALUMNI],
  '/jobs/list': [ROLES.STUDENT, ROLES.TPO],
  '/profile': [ROLES.STUDENT, ROLES.COMPANY, ROLES.TPO, ROLES.ALUMNI],
  '/students/list': [ROLES.COMPANY, ROLES.TPO],
  '/companies/list': [ROLES.TPO],
  '/alumni/list': [ROLES.TPO, ROLES.STUDENT],
  '/jobs/post': [ROLES.COMPANY, ROLES.TPO]
};

class AuthService {
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  login(userData, token) {
    this.setUser(userData);
    this.setToken(token);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  hasAccess(path) {
    const user = this.getUser();
    if (!user) return false;

    // Find the matching route pattern
    const route = Object.keys(ROUTE_ACCESS).find(pattern => {
      // Convert route pattern to regex
      const regexPattern = new RegExp('^' + pattern.replace(/:\w+/g, '[^/]+') + '/?$');
      return regexPattern.test(path);
    });

    if (!route) return false;
    return ROUTE_ACCESS[route].includes(user.role);
  }

  getDefaultRoute(role) {
    switch (role) {
      case ROLES.STUDENT:
        return '/jobs/list';
      case ROLES.COMPANY:
        return '/students/list';
      case ROLES.TPO:
        return '/dashboard';
      case ROLES.ALUMNI:
        return '/alumni/list';
      default:
        return '/';
    }
  }
}

export const authService = new AuthService();