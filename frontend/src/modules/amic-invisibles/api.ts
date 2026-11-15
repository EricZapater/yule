import { apiClient } from '../../api/client';
import {
  User,
  Edition,
  WishlistItem,
  AssignmentResponse,
  MemberAdminView,
  Incompatibility,
  ViabilityCheckResponse,
} from './types';

export const yuleApi = {
  // Auth
  register: (name: string, email: string) =>
    apiClient.post<{ token: string; user: User }>('/auth/register', { name, email }),

  requestMagicLink: (email: string) =>
    apiClient.post<{ message: string }>('/auth/magic-link', { email }),

  verifyMagicLink: (token: string) =>
    apiClient.post<{ token: string; user: User }>('/auth/verify', { token }),

  getMe: () => apiClient.get<User>('/auth/me'),

  // Edition
  getCurrentEdition: () => apiClient.get<Edition>('/editions/current'),
  updateCurrentEdition: (data: { name?: string; budget_limit?: number }) =>
    apiClient.put<Edition>('/editions/current', data),

  // Wishlist
  getMyWishlist: () => apiClient.get<WishlistItem[]>('/wishlist'),
  addWishlistItem: (data: {
    title: string;
    price_estimated?: number | null;
    url?: string | null;
    image_url?: string | null;
    notes?: string | null;
  }) => apiClient.post<WishlistItem>('/wishlist', data),
  updateWishlistItem: (
    itemId: string,
    data: {
      title: string;
      price_estimated?: number | null;
      url?: string | null;
      image_url?: string | null;
      notes?: string | null;
    }
  ) => apiClient.put<WishlistItem>(`/wishlist/${itemId}`, data),
  deleteWishlistItem: (itemId: string) =>
    apiClient.delete(`/wishlist/${itemId}`),
  copyPreviousWishlist: () =>
    apiClient.post<{ copied: number; message: string }>('/wishlist/copy-previous'),

  // Upload photo
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ url: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Assignment (Sorteig secret)
  getMyAssignment: () => apiClient.get<AssignmentResponse>('/assignment'),
  markItemPurchased: (itemId: string, isPurchased: boolean) =>
    apiClient.post(`/assignment/items/${itemId}/mark-purchased`, {
      is_purchased: isPurchased,
    }),

  // Admin Members
  listMembers: () => apiClient.get<MemberAdminView[]>('/members'),
  createMember: (name: string, email: string) =>
    apiClient.post<MemberAdminView>('/members', { name, email }),
  updateMember: (
    id: string,
    data: { name?: string; email?: string; is_active?: boolean }
  ) => apiClient.put(`/members/${id}`, data),

  // Admin Incompatibilities
  listIncompatibilities: () =>
    apiClient.get<Incompatibility[]>('/incompatibilities'),
  createIncompatibility: (data: {
    person1_id: string;
    person2_id: string;
    is_mutual: boolean;
    notes?: string;
  }) => apiClient.post<Incompatibility>('/incompatibilities', data),
  deleteIncompatibility: (id: string) =>
    apiClient.delete(`/incompatibilities/${id}`),
  checkViability: () =>
    apiClient.get<ViabilityCheckResponse>('/incompatibilities/check-viability'),

  // Execute Draw
  executeDraw: () => apiClient.post('/draw'),
};
