/**
 * Service API pour l'authentification
 * Gère la connexion, déconnexion et gestion du profil
 */

import api, { setTokens, clearTokens } from '@/lib/api';
import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  ChangePasswordRequest 
} from '@/types/api';

export const authService = {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/accounts/login/', credentials);
    setTokens({ access: response.data.access, refresh: response.data.refresh });
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  /**
   * Déconnexion
   */
  logout(): void {
    clearTokens();
  },

  /**
   * Récupérer le profil utilisateur
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/accounts/profile/');
    return response.data;
  },

  /**
   * Mettre à jour le profil
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/accounts/profile/', data);
    return response.data;
  },

  /**
   * Changer le mot de passe
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.post('/accounts/change-password/', data);
  },

  /**
   * Rafraîchir le token
   */
  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const response = await api.post<{ access: string }>('/accounts/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};

export default authService;
