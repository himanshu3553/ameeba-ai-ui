import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, tokenService, userService } from '../services/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenService.getToken();
      if (token) {
        try {
          // Verify token by fetching user details
          const response = await authAPI.getUserDetails(token);
          if (response.success) {
            setUser(response.data);
            userService.setUser(response.data);
          } else {
            // Token invalid, clear it
            tokenService.removeToken();
            userService.removeUser();
            setUser(null);
          }
        } catch (error) {
          // Token invalid or expired
          tokenService.removeToken();
          userService.removeUser();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for logout events (from API interceptor)
    const handleLogout = () => {
      setUser(null);
      userService.removeUser();
      navigate('/login');
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [navigate]);

  const signup = async (formData) => {
    try {
      const response = await authAPI.signup(formData);
      if (response.success) {
        const { token, user: userData } = response.data;
        tokenService.setToken(token);
        userService.setUser(userData);
        setUser(userData);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Signup failed' };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Signup failed' };
    }
  };

  const login = async (formData) => {
    try {
      const response = await authAPI.login(formData);
      if (response.success) {
        const { token, user: userData } = response.data;
        tokenService.setToken(token);
        userService.setUser(userData);
        setUser(userData);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const logout = () => {
    tokenService.removeToken();
    userService.removeUser();
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

