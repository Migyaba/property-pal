/**
 * Context d'authentification
 * Gère la connexion JWT avec le backend Django
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services';
import { getAccessToken, clearTokens } from '@/lib/api';
import type { User as ApiUser } from '@/types/api';

// Types adaptés pour le frontend
export type UserRole = 'admin' | 'agent' | 'tenant';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convertit un utilisateur API vers le format frontend
 */
const mapApiUserToUser = (apiUser: ApiUser): User => ({
  id: String(apiUser.id),
  email: apiUser.email,
  firstName: apiUser.first_name,
  lastName: apiUser.last_name,
  role: apiUser.role,
  phone: apiUser.phone,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Récupère l'utilisateur depuis le localStorage ou l'API
   */
  const loadUser = useCallback(async () => {
    const token = getAccessToken();
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Essayer de charger depuis le localStorage d'abord
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Si c'est déjà au format frontend (a firstName)
        if (parsed.firstName) {
          setUser(parsed);
        } else {
          // C'est au format API, convertir
          setUser(mapApiUserToUser(parsed));
        }
        setIsLoading(false);
        return;
      } catch {
        // Ignorer les erreurs de parsing
      }
    }

    // Sinon, charger depuis l'API
    try {
      const apiUser = await authService.getProfile();
      const mappedUser = mapApiUserToUser(apiUser);
      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
    } catch {
      // Token invalide, nettoyer
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * Connexion utilisateur
   */
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      const mappedUser = mapApiUserToUser(response.user);
      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      throw new Error(err.response?.data?.detail || 'Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Déconnexion
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  /**
   * Rafraîchir les données utilisateur
   */
  const refreshUser = async () => {
    try {
      const apiUser = await authService.getProfile();
      const mappedUser = mapApiUserToUser(apiUser);
      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
    } catch {
      // Ignorer les erreurs
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      isAuthenticated: !!user,
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
