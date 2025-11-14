// Core types for the TRPG Map Manager

export type LocationType = 'core' | 'outer';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description?: string;
  x: number;
  y: number;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  directed?: boolean;
  weight?: number;
  meta?: Record<string, any>;
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  color: string;
  category?: string; // e.g., "NPC", "Player", "Enemy", etc.
  description?: string;
  currentLocationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterPosition {
  id: string;
  characterId: string;
  locationId: string;
  timestamp: string;
  notes?: string;
}

export interface MapSettings {
  id: string;
  outerNodeCount: number;
  avgDegree: number;
  allowMultipleEdges: boolean;
  allowCycles: boolean;
  autoSaveInterval: number; // in seconds
  showGrid: boolean;
  nodeColorTheme: string;
  exportFormat: 'json' | 'png' | 'graphml';
  updatedAt: string;
}

// React Flow types
export interface NodeData {
  location: Location;
  characters: Character[];
}

export interface EdgeData {
  connection: Connection;
}

// Map generation parameters
export interface GenerationParams {
  outerNodeCount: number;
  avgDegree: number;
  allowMultipleEdges?: boolean;
  allowCycles?: boolean;
}
