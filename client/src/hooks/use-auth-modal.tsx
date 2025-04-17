import { create } from 'zustand';

type AuthMode = 'login' | 'register';

interface AuthModalStore {
  isOpen: boolean;
  mode: AuthMode;
  openModal: (mode: AuthMode) => void;
  closeModal: () => void;
  switchMode: () => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  mode: 'login',
  openModal: (mode) => set({ isOpen: true, mode }),
  closeModal: () => set({ isOpen: false }),
  switchMode: () => set((state) => ({
    mode: state.mode === 'login' ? 'register' : 'login'
  })),
}));
