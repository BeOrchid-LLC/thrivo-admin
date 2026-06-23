import { create } from "zustand";
import { callApi } from "@/lib/api";
import type { Admin } from "@/lib/contracts";

interface AuthState {
  admin: Admin | null;
  initLoading: boolean;
  initComplete: boolean;
  setAdmin: (admin: Admin) => void;
  clearAdmin: () => void;
  initSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  admin: null,
  initLoading: true,
  initComplete: false,

  setAdmin: (admin) => set({ admin }),

  clearAdmin: () => set({ admin: null }),

  initSession: async () => {
    try {
      const { admin } = await callApi("GET_SESSION");
      set({ admin, initLoading: false, initComplete: true });
    } catch {
      set({ admin: null, initLoading: false, initComplete: true });
    }
  },

  logout: async () => {
    try {
      await callApi("LOGOUT");
    } catch {
      // best-effort
    } finally {
      set({ admin: null, initLoading: false, initComplete: true });
    }
  },
}));
