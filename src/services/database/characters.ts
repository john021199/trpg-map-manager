import { getDatabase, saveDatabase } from './db';
import type { Character, CharacterPosition } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new character
 */
export function createCharacter(
  name: string,
  color: string,
  category?: string,
  description?: string,
  currentLocationId?: string
): Character {
  const db = getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    'INSERT INTO characters (id, name, color, category, description, current_location_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, color, category || null, description || null, currentLocationId || null, now, now]
  );

  // If initial location is provided, record it in position history
  if (currentLocationId) {
    recordCharacterPosition(id, currentLocationId);
  }

  saveDatabase();

  return {
    id,
    name,
    color,
    category,
    description,
    currentLocationId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get all characters
 */
export function getAllCharacters(): Character[] {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM characters ORDER BY created_at DESC');

  if (!result[0]) return [];

  return result[0].values.map((row) => ({
    id: row[0] as string,
    name: row[1] as string,
    color: row[2] as string,
    category: row[3] as string | undefined,
    description: row[4] as string | undefined,
    currentLocationId: row[5] as string | undefined,
    createdAt: row[6] as string,
    updatedAt: row[7] as string,
  }));
}

/**
 * Get character by ID
 */
export function getCharacterById(id: string): Character | null {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM characters WHERE id = ?', [id]);

  if (!result[0] || !result[0].values[0]) return null;

  const row = result[0].values[0];
  return {
    id: row[0] as string,
    name: row[1] as string,
    color: row[2] as string,
    category: row[3] as string | undefined,
    description: row[4] as string | undefined,
    currentLocationId: row[5] as string | undefined,
    createdAt: row[6] as string,
    updatedAt: row[7] as string,
  };
}

/**
 * Get characters at a location
 */
export function getCharactersAtLocation(locationId: string): Character[] {
  const db = getDatabase();
  const result = db.exec(
    'SELECT * FROM characters WHERE current_location_id = ?',
    [locationId]
  );

  if (!result[0]) return [];

  return result[0].values.map((row) => ({
    id: row[0] as string,
    name: row[1] as string,
    color: row[2] as string,
    category: row[3] as string | undefined,
    description: row[4] as string | undefined,
    currentLocationId: row[5] as string | undefined,
    createdAt: row[6] as string,
    updatedAt: row[7] as string,
  }));
}

/**
 * Update character
 */
export function updateCharacter(
  id: string,
  updates: Partial<Omit<Character, 'id' | 'createdAt' | 'updatedAt'>>
): Character | null {
  const db = getDatabase();
  const existing = getCharacterById(id);

  if (!existing) return null;

  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }
  if (updates.category !== undefined) {
    fields.push('category = ?');
    values.push(updates.category);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.currentLocationId !== undefined) {
    fields.push('current_location_id = ?');
    values.push(updates.currentLocationId);
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.run(`UPDATE characters SET ${fields.join(', ')} WHERE id = ?`, values);
  saveDatabase();

  return getCharacterById(id);
}

/**
 * Delete character
 */
export function deleteCharacter(id: string): boolean {
  const db = getDatabase();
  db.run('DELETE FROM characters WHERE id = ?', [id]);
  saveDatabase();
  return true;
}

/**
 * Move character to a new location
 */
export function moveCharacter(
  characterId: string,
  locationId: string,
  notes?: string
): boolean {
  const character = getCharacterById(characterId);
  if (!character) return false;

  updateCharacter(characterId, { currentLocationId: locationId });
  recordCharacterPosition(characterId, locationId, notes);

  return true;
}

/**
 * Record character position in history
 */
export function recordCharacterPosition(
  characterId: string,
  locationId: string,
  notes?: string
): CharacterPosition {
  const db = getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    'INSERT INTO character_positions (id, character_id, location_id, timestamp, notes) VALUES (?, ?, ?, ?, ?)',
    [id, characterId, locationId, now, notes || null]
  );

  saveDatabase();

  return {
    id,
    characterId,
    locationId,
    timestamp: now,
    notes,
  };
}

/**
 * Get character position history
 */
export function getCharacterPositionHistory(characterId: string): CharacterPosition[] {
  const db = getDatabase();
  const result = db.exec(
    'SELECT * FROM character_positions WHERE character_id = ? ORDER BY timestamp DESC',
    [characterId]
  );

  if (!result[0]) return [];

  return result[0].values.map((row) => ({
    id: row[0] as string,
    characterId: row[1] as string,
    locationId: row[2] as string,
    timestamp: row[3] as string,
    notes: row[4] as string | undefined,
  }));
}

/**
 * Get all position history (for playback)
 */
export function getAllPositionHistory(): CharacterPosition[] {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM character_positions ORDER BY timestamp ASC');

  if (!result[0]) return [];

  return result[0].values.map((row) => ({
    id: row[0] as string,
    characterId: row[1] as string,
    locationId: row[2] as string,
    timestamp: row[3] as string,
    notes: row[4] as string | undefined,
  }));
}

/**
 * Clear character position history
 */
export function clearCharacterPositionHistory(characterId: string): void {
  const db = getDatabase();
  db.run('DELETE FROM character_positions WHERE character_id = ?', [characterId]);
  saveDatabase();
}
