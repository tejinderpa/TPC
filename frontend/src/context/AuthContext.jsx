import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const ROLES = {
  STUDENT: 'STUDENT',
  COMPANY: 'COMPANY',
  TPO: 'TPO',
  ALUMNI: 'ALUMNI'
};

// Define route access with more granular control
export const ROUTE_ACCESS = {
  '/': {
    roles: [ROLES.STUDENT, ROLES.COMPANY, ROLES.TPO, ROLES.ALUMNI],
    redirectTo: (role) => {
      switch (role) {
        case ROLES.STUDENT: return '/jobs/list';
        case ROLES.COMPANY: return '/students/list';
        case ROLES.TPO: return '/dashboard';
        case ROLES.ALUMNI: return '/alumni/list';
        default: return '/';
      }
    }
  },
  '/jobs/list': {
    roles: [ROLES.STUDENT, ROLES.TPO],
    requiredPermissions: ['view:jobs']
  },
  '/jobs/post': {
    roles: [ROLES.COMPANY, ROLES.TPO],
    requiredPermissions: ['create:jobs']
  },
  '/students/list': {
    roles: [ROLES.COMPANY, ROLES.TPO],
    requiredPermissions: ['view:students']
  },
  '/companies/list': {
    roles: [ROLES.TPO],
    requiredPermissions: ['view:companies']
  },
  '/alumni/list': {
    roles: [ROLES.TPO, ROLES.STUDENT],
    requiredPermissions: ['view:alumni']
  },
  '/profile': {
    roles: [ROLES.STUDENT, ROLES.COMPANY, ROLES.TPO, ROLES.ALUMNI],
    requiredPermissions: ['view:profile']
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // On mount, check if we have a valid session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // In a real app, verify the token with your backend
          const savedUser = JSON.parse(localStorage.getItem('user'));
          if (savedUser) {
            setUser(savedUser);
          }
        }
      } catch (err) {
        setError(err.message);
        logout(); // Clear any invalid auth state
      } finally {
        // If there's no authenticated user, provide a sensible default in dev mode
        if (!localStorage.getItem('auth_token') && !localStorage.getItem('user') && process.env.NODE_ENV !== 'production') {
          const devUser = {
            id: 1,
            name: 'Dev TPO',
            email: 'dev.tpo@example.com',
            role: ROLES.TPO,
            permissions: getRolePermissions(ROLES.TPO)
          };
          setUser(devUser);
          localStorage.setItem('user', JSON.stringify(devUser));
          localStorage.setItem('auth_token', 'dev-mock-token');
        }
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      // For demo, we're using hardcoded users
      const mockToken = 'mock-jwt-token';
      const userData = {
        id: Date.now(),
        name: `Test ${credentials.role.toLowerCase()}`,
        email: `test@${credentials.role.toLowerCase()}.com`,
        role: credentials.role,
        permissions: getRolePermissions(credentials.role)
      };

      // Store auth data
      storage.setAuth({
        token: mockToken,
        user: userData
      });
      
      setUser(userData);

      // Return the appropriate redirect path
      const redirectPath = ROUTE_ACCESS['/'].redirectTo(credentials.role);
      return redirectPath;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const hasPermission = (path) => {
    if (!user || !user.role) return false;
    
    // Find the matching route configuration
    const route = Object.entries(ROUTE_ACCESS).find(([pattern]) => {
      const regexPattern = new RegExp('^' + pattern.replace(/:\w+/g, '[^/]+') + '/?$');
      return regexPattern.test(path);
    });

    if (!route) return false;

    const [, config] = route;
    
    // Check role access
    if (!config.roles.includes(user.role)) {
      return false;
    }

    // Check permissions if required
    if (config.requiredPermissions) {
      return config.requiredPermissions.every(permission => 
        user.permissions.includes(permission)
      );
    }

    return true;
  };

  // Helper function to get role-specific permissions
  const getRolePermissions = (role) => {
    switch (role) {
      case ROLES.STUDENT:
        return ['view:jobs', 'view:profile', 'view:alumni'];
      case ROLES.COMPANY:
        return ['view:students', 'create:jobs', 'view:profile'];
      case ROLES.TPO:
        return ['view:all', 'create:all', 'edit:all', 'delete:all'];
      case ROLES.ALUMNI:
        return ['view:jobs', 'view:profile', 'create:opportunities'];
      default:
        return [];
    }
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user,
    loading,
    error
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}