import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'inventory_manager' | 'sales_agent' | 'customer';
  customer_profile?: {
    company_name?: string;
    kra_pin?: string;
    customer_type?: string;
    loyalty_points?: number;
  };
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'wired-wizards-auth',
    }
  )
);
