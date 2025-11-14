import { create } from 'zustand';
import type { Character, CharacterPosition } from '../types';
import {
  getAllCharacters,
  createCharacter as dbCreateCharacter,
  updateCharacter as dbUpdateCharacter,
  deleteCharacter as dbDeleteCharacter,
  moveCharacter as dbMoveCharacter,
  getCharacterPositionHistory,
  getCharactersAtLocation,
} from '../services/database/characters';

interface CharacterStore {
  characters: Character[];
  selectedCharacterId: string | null;

  // Actions
  loadCharacters: () => void;
  createCharacter: (name: string, color: string, category?: string, description?: string, currentLocationId?: string) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  moveCharacter: (characterId: string, locationId: string, notes?: string) => void;
  getCharacterHistory: (characterId: string) => CharacterPosition[];
  getCharactersAt: (locationId: string) => Character[];
  setSelectedCharacter: (id: string | null) => void;
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  characters: [],
  selectedCharacterId: null,

  loadCharacters: () => {
    const characters = getAllCharacters();
    set({ characters });
  },

  createCharacter: (name, color, category, description, currentLocationId) => {
    const character = dbCreateCharacter(name, color, category, description, currentLocationId);
    set({ characters: [...get().characters, character] });
  },

  updateCharacter: (id, updates) => {
    const updated = dbUpdateCharacter(id, updates);
    if (updated) {
      set({
        characters: get().characters.map((char) => (char.id === id ? updated : char)),
      });
    }
  },

  deleteCharacter: (id) => {
    dbDeleteCharacter(id);
    set({ characters: get().characters.filter((char) => char.id !== id) });
  },

  moveCharacter: (characterId, locationId, notes) => {
    const success = dbMoveCharacter(characterId, locationId, notes);
    if (success) {
      const updated = get().characters.map((char) =>
        char.id === characterId ? { ...char, currentLocationId: locationId } : char
      );
      set({ characters: updated });
    }
  },

  getCharacterHistory: (characterId) => {
    return getCharacterPositionHistory(characterId);
  },

  getCharactersAt: (locationId) => {
    return getCharactersAtLocation(locationId);
  },

  setSelectedCharacter: (id) => {
    set({ selectedCharacterId: id });
  },
}));
