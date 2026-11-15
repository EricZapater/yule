import { create } from 'zustand';
import {
  User,
  Edition,
  WishlistItem,
  AssignmentResponse,
  MemberAdminView,
  Incompatibility,
  ViabilityCheckResponse,
} from './types';
import { yuleApi } from './api';

interface YuleState {
  currentUser: User | null;
  currentEdition: Edition | null;
  editions: Edition[];
  myWishlist: WishlistItem[];
  isWishlistLoaded: boolean;
  assignment: AssignmentResponse | null;
  members: MemberAdminView[];
  incompatibilities: Incompatibility[];
  viability: ViabilityCheckResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  register: (name: string, email: string) => Promise<boolean>;
  loginWithToken: (token: string) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  fetchEdition: () => Promise<void>;
  fetchEditions: () => Promise<void>;
  createEdition: (data: {
    year: number;
    name: string;
    budget_limit?: number;
    copy_members?: boolean;
  }) => Promise<boolean>;
  updateEdition: (data: { name?: string; budget_limit?: number }) => Promise<boolean>;
  fetchMyWishlist: () => Promise<void>;
  copyPreviousWishlist: () => Promise<number>;
  addWishlistItem: (data: {
    title: string;
    price_estimated?: number | null;
    url?: string | null;
    image_url?: string | null;
    notes?: string | null;
  }) => Promise<boolean>;
  deleteWishlistItem: (id: string) => Promise<void>;
  fetchAssignment: () => Promise<void>;
  markItemPurchased: (itemId: string, isPurchased: boolean) => Promise<void>;
  fetchAdminData: () => Promise<void>;
  createMember: (name: string, email: string) => Promise<boolean>;
  createIncompatibility: (
    p1: string,
    p2: string,
    isMutual: boolean,
    notes?: string
  ) => Promise<boolean>;
  deleteIncompatibility: (id: string) => Promise<void>;
  executeDraw: () => Promise<boolean>;
  notifyDraw: () => Promise<number>;
}

export const useYuleStore = create<YuleState>((set, get) => ({
  currentUser: JSON.parse(localStorage.getItem('yule_user_profile') || 'null'),
  currentEdition: null,
  editions: [],
  myWishlist: [],
  isWishlistLoaded: false,
  assignment: null,
  members: [],
  incompatibilities: [],
  viability: null,
  isLoading: false,
  error: null,

  register: async (name: string, email: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await yuleApi.register(name, email);
      localStorage.setItem('yule_auth_token', res.data.token);
      localStorage.setItem('yule_user_profile', JSON.stringify(res.data.user));
      set({ currentUser: res.data.user, isLoading: false });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Error registrant el familiar.',
      });
      return false;
    }
  },

  loginWithToken: async (token: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await yuleApi.verifyMagicLink(token);
      localStorage.setItem('yule_auth_token', res.data.token);
      localStorage.setItem('yule_user_profile', JSON.stringify(res.data.user));
      set({ currentUser: res.data.user, isLoading: false });
      return true;
    } catch {
      set({
        isLoading: false,
        error: "L'enllaç d'accés no és vàlid o ja ha caducat.",
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('yule_auth_token');
    localStorage.removeItem('yule_user_profile');
    set({ currentUser: null, assignment: null, myWishlist: [], isWishlistLoaded: false });
    window.location.href = '/login';
  },

  fetchMe: async () => {
    try {
      const res = await yuleApi.getMe();
      localStorage.setItem('yule_user_profile', JSON.stringify(res.data));
      set({ currentUser: res.data });
    } catch {
      // Ignorar si no està autenticat encara
    }
  },

  fetchEdition: async () => {
    try {
      const res = await yuleApi.getCurrentEdition();
      set({ currentEdition: res.data });
    } catch {
      // Error silent
    }
  },

  fetchEditions: async () => {
    try {
      const res = await yuleApi.listEditions();
      set({ editions: res.data });
    } catch {
      // Error silent
    }
  },

  createEdition: async (data: {
    year: number;
    name: string;
    budget_limit?: number;
    copy_members?: boolean;
  }) => {
    try {
      set({ isLoading: true, error: null });
      const res = await yuleApi.createEdition(data);
      // Actualitzar l'edició activa i la llista d'edicions
      set((state) => ({
        currentEdition: res.data,
        editions: [res.data, ...state.editions],
        isLoading: false,
      }));
      await get().fetchAdminData();
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.error || "Error creant el nou sorteig",
      });
      return false;
    }
  },

  updateEdition: async (data: { name?: string; budget_limit?: number }) => {
    try {
      set({ isLoading: true, error: null });
      const res = await yuleApi.updateCurrentEdition(data);
      set({ currentEdition: res.data, isLoading: false });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.error || "Error actualitzant l'edició",
      });
      return false;
    }
  },

  fetchMyWishlist: async () => {
    try {
      const res = await yuleApi.getMyWishlist();
      set({ myWishlist: res.data || [], isWishlistLoaded: true });
    } catch {
      set({ isWishlistLoaded: true });
      // Error silent
    }
  },

  copyPreviousWishlist: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await yuleApi.copyPreviousWishlist();
      // Recarregar la llista actualitzada
      const listRes = await yuleApi.getMyWishlist();
      set({ myWishlist: listRes.data || [], isWishlistLoaded: true, isLoading: false });
      return res.data.copied;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.error || "Error traspassant desitjos anteriors",
      });
      return 0;
    }
  },

  addWishlistItem: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const res = await yuleApi.addWishlistItem(data);
      set((state) => ({
        myWishlist: [...state.myWishlist, res.data],
        isWishlistLoaded: true,
        isLoading: false,
      }));
      return true;
    } catch {
      set({ isLoading: false, error: 'Error desant el regal a la llista' });
      return false;
    }
  },

  deleteWishlistItem: async (id: string) => {
    try {
      await yuleApi.deleteWishlistItem(id);
      set((state) => ({
        myWishlist: state.myWishlist.filter((item) => item.id !== id),
      }));
    } catch {
      // Error silent
    }
  },

  fetchAssignment: async () => {
    try {
      set({ isLoading: true });
      const res = await yuleApi.getMyAssignment();
      set({ assignment: res.data, isLoading: false });
    } catch {
      set({ assignment: null, isLoading: false });
    }
  },

  markItemPurchased: async (itemId: string, isPurchased: boolean) => {
    try {
      await yuleApi.markItemPurchased(itemId, isPurchased);
      set((state) => {
        if (!state.assignment) return state;
        return {
          assignment: {
            ...state.assignment,
            wishlist: state.assignment.wishlist.map((item) =>
              item.id === itemId
                ? { ...item, is_marked_by_me: isPurchased }
                : item
            ),
          },
        };
      });
    } catch {
      // Error silent
    }
  },

  fetchAdminData: async () => {
    try {
      set({ isLoading: true });
      const [membersRes, incompRes, viabilityRes] = await Promise.all([
        yuleApi.listMembers(),
        yuleApi.listIncompatibilities(),
        yuleApi.checkViability(),
      ]);
      set({
        members: membersRes.data,
        incompatibilities: incompRes.data,
        viability: viabilityRes.data,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  createMember: async (name: string, email: string) => {
    try {
      await yuleApi.createMember(name, email);
      await get().fetchAdminData();
      return true;
    } catch {
      return false;
    }
  },

  createIncompatibility: async (
    p1: string,
    p2: string,
    isMutual: boolean,
    notes?: string
  ) => {
    try {
      await yuleApi.createIncompatibility({
        person1_id: p1,
        person2_id: p2,
        is_mutual: isMutual,
        notes,
      });
      await get().fetchAdminData();
      return true;
    } catch {
      return false;
    }
  },

  deleteIncompatibility: async (id: string) => {
    try {
      await yuleApi.deleteIncompatibility(id);
      await get().fetchAdminData();
    } catch {
      // Error silent
    }
  },

  executeDraw: async () => {
    try {
      set({ isLoading: true });
      await yuleApi.executeDraw();
      await get().fetchEdition();
      await get().fetchAdminData();
      set({ isLoading: false });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  notifyDraw: async () => {
    try {
      set({ isLoading: true });
      const res = await yuleApi.notifyDraw();
      set({ isLoading: false });
      return res.data.dispatched;
    } catch {
      set({ isLoading: false });
      return -1;
    }
  },
}));
