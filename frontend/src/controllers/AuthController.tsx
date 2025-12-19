import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';
import type { Usuario } from '../models/types';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registro: (email: string, password: string, nombre: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');

    if (token && usuarioStr) {
      setUsuario(JSON.parse(usuarioStr));
      verificarToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verificarToken = async () => {
    try {
      const response = await authApi.perfil();
      setUsuario(response.data);
      localStorage.setItem('usuario', JSON.stringify(response.data));
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    setUsuario(response.data.usuario);
  };

  const registro = async (email: string, password: string, nombre: string) => {
    const response = await authApi.registro(email, password, nombre);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    setUsuario(response.data.usuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}








