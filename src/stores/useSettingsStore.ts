import { create } from 'zustand';
import type { MapSettings } from '../types';
import { getMapSettings, updateMapSettings } from '../services/database/settings';

interface SettingsStore {
  settings: MapSettings;

  // Actions
  loadSettings: () => void;
  updateSettings: (updates: Partial<MapSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    id: 'default',
    outerNodeCount: 10,
    avgDegree: 3,
    allowMultipleEdges: false,
    allowCycles: true,
    autoSaveInterval: 60,
    showGrid: true,
    nodeColorTheme: 'default',
    exportFormat: 'json',
    updatedAt: new Date().toISOString(),
  },

  loadSettings: () => {
    const settings = getMapSettings();
    set({ settings });
  },

  updateSettings: (updates) => {
    const settings = updateMapSettings(updates);
    set({ settings });
  },
}));
