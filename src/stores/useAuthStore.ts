import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export interface UserWallet {
  availableBalance: number;
  totalEarnings: number;
  pendingWithdrawal: number;
}

export interface ApiUser {
  _id: string;
  memberId: string;
  fullName: string;
  email: string;
  phone: string;
  sponsorId: string;
  panCardNumber: string;
  rank: string;
  leftPV: number;
  rightPV: number;
  wallet: UserWallet;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  sponsorId: string;
  panCardNumber: string;
}

interface RegisterResponse {
  success: boolean;
  memberId: string;
  token: string;
  message?: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: ApiUser;
  message?: string;
}

interface AuthState {
  user: ApiUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  registeredMemberId: string | null;
  showMemberIdModal: boolean;
  
  // Actions
  login: (memberId: string, password: string) => Promise<{ success: boolean; redirect?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; memberId?: string }>;
  logout: () => void;
  clearError: () => void;
  closeMemberIdModal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      registeredMemberId: null,
      showMemberIdModal: false,

      login: async (memberId: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post<LoginResponse>('/api/v1/login/user', {
            memberId,
            password,
          });
          
          const { token, user } = response.data;
          
          set({
            user,
            token,
            isLoading: false,
            error: null,
          });
          
          return { success: true, redirect: '/dashboard' };
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Invalid Member ID or Password';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return { success: false };
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post<RegisterResponse>('/api/v1/register/user', userData);
          
          const { memberId } = response.data;
          
          set({
            isLoading: false,
            error: null,
            registeredMemberId: memberId,
            showMemberIdModal: true,
          });
          
          return { success: true, memberId };
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return { success: false };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          error: null,
          registeredMemberId: null,
          showMemberIdModal: false,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      closeMemberIdModal: () => {
        set({ showMemberIdModal: false, registeredMemberId: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
