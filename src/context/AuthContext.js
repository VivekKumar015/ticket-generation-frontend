import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedProject = localStorage.getItem('currentProject');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedProject) {
      setCurrentProject(JSON.parse(savedProject));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    await registerUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentProject');
    setToken(null);
    setUser(null);
    setCurrentProject(null);
  };

  const switchProject = (project) => {
    setCurrentProject(project);
    if (project) {
      localStorage.setItem('currentProject', JSON.stringify(project));
    } else {
      localStorage.removeItem('currentProject');
    }
  };

  const isAdmin = () => user?.role === 'ROLE_SUPER_ADMIN';
  const isEmployee = () => user?.role === 'ROLE_SUPPORT_EMPLOYEE';
  const isUser = () => user?.role === 'ROLE_USER';

  return (
    <AuthContext.Provider value={{
      user, token, loading, currentProject,
      login, logout, register, switchProject,
      isAdmin, isEmployee, isUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);