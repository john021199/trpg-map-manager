import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  currentPanel: 'locations' | 'characters' | 'settings' | null;
  modalOpen: boolean;
  modalType: 'create-location' | 'edit-location' | 'create-character' | 'edit-character' | 'generate-map' | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentPanel: (panel: 'locations' | 'characters' | 'settings' | null) => void;
  openModal: (type: 'create-location' | 'edit-location' | 'create-character' | 'edit-character' | 'generate-map') => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  currentPanel: null,
  modalOpen: false,
  modalType: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setCurrentPanel: (panel) => set({ currentPanel: panel }),

  openModal: (type) => set({ modalOpen: true, modalType: type }),

  closeModal: () => set({ modalOpen: false, modalType: null }),
}));
