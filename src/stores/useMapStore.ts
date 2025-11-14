import { create } from 'zustand';
import type { Location, Connection } from '../types';
import {
  getAllLocations,
  createLocation as dbCreateLocation,
  updateLocation as dbUpdateLocation,
  deleteLocation as dbDeleteLocation,
} from '../services/database/locations';
import {
  getAllConnections,
  createConnection as dbCreateConnection,
  deleteConnection as dbDeleteConnection,
  deleteConnectionsForLocation,
} from '../services/database/connections';
import { generateMap, regenerateOuterNodes, clearMap, generateConnectionsOnly, clearConnections } from '../services/mapGenerator';
import type { GenerationParams } from '../types';

interface MapStore {
  locations: Location[];
  connections: Connection[];
  selectedLocationId: string | null;

  // Actions
  loadMap: () => void;
  createLocation: (name: string, type: 'core' | 'outer', x: number, y: number, description?: string) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  createConnection: (sourceId: string, targetId: string, directed?: boolean, weight?: number) => void;
  deleteConnection: (id: string) => void;
  generateNewMap: (params: GenerationParams) => void;
  regenerateOuter: (params: GenerationParams) => void;
  generateConnections: (params: GenerationParams) => void;
  clearAllConnections: () => void;
  resetMap: () => void;
  setSelectedLocation: (id: string | null) => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
  locations: [],
  connections: [],
  selectedLocationId: null,

  loadMap: () => {
    const locations = getAllLocations();
    const connections = getAllConnections();
    set({ locations, connections });
  },

  createLocation: (name, type, x, y, description) => {
    const location = dbCreateLocation(name, type, x, y, description);
    set({ locations: [...get().locations, location] });
  },

  updateLocation: (id, updates) => {
    const updated = dbUpdateLocation(id, updates);
    if (updated) {
      set({
        locations: get().locations.map((loc) => (loc.id === id ? updated : loc)),
      });
    }
  },

  deleteLocation: (id) => {
    // Delete associated connections first
    deleteConnectionsForLocation(id);
    dbDeleteLocation(id);

    set({
      locations: get().locations.filter((loc) => loc.id !== id),
      connections: get().connections.filter(
        (conn) => conn.sourceId !== id && conn.targetId !== id
      ),
    });
  },

  createConnection: (sourceId, targetId, directed = false, weight = 1.0) => {
    const connection = dbCreateConnection(sourceId, targetId, directed, weight);
    set({ connections: [...get().connections, connection] });
  },

  deleteConnection: (id) => {
    dbDeleteConnection(id);
    set({ connections: get().connections.filter((conn) => conn.id !== id) });
  },

  generateNewMap: (params) => {
    const { locations, connections } = generateMap(params);
    set({ locations, connections });
  },

  regenerateOuter: (params) => {
    const { locations, connections } = regenerateOuterNodes(params);
    set({ locations, connections });
  },

  generateConnections: (params) => {
    try {
      const { locations, connections } = generateConnectionsOnly(params);
      set({ locations, connections });
    } catch (error) {
      console.error('Failed to generate connections:', error);
      alert((error as Error).message);
    }
  },

  clearAllConnections: () => {
    clearConnections();
    set({ connections: [] });
  },

  resetMap: () => {
    clearMap();
    set({ locations: [], connections: [], selectedLocationId: null });
  },

  setSelectedLocation: (id) => {
    set({ selectedLocationId: id });
  },
}));
