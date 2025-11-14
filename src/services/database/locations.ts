import { getDatabase, saveDatabase } from './db';
import type { Location, LocationType } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new location
 */
export function createLocation(
  name: string,
  type: LocationType,
  x: number,
  y: number,
  description?: string,
  meta?: Record<string, any>
): Location {
  const db = getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    'INSERT INTO locations (id, name, type, description, x, y, meta, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, type, description || null, x, y, meta ? JSON.stringify(meta) : null, now, now]
  );

  saveDatabase();

  return {
    id,
    name,
    type,
    description,
    x,
    y,
    meta,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get all locations
 */
export function getAllLocations(): Location[] {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM locations ORDER BY created_at DESC');

  if (!result[0]) return [];

  return result[0].values.map((row) => ({
    id: row[0] as string,
    name: row[1] as string,
    type: row[2] as LocationType,
    description: row[3] as string | undefined,
    x: row[4] as number,
    y: row[5] as number,
    meta: row[6] ? JSON.parse(row[6] as string) : undefined,
    createdAt: row[7] as string,
    updatedAt: row[8] as string,
  }));
}

/**
 * Get location by ID
 */
export function getLocationById(id: string): Location | null {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM locations WHERE id = ?', [id]);

  if (!result[0] || !result[0].values[0]) return null;

  const row = result[0].values[0];
  return {
    id: row[0] as string,
    name: row[1] as string,
    type: row[2] as LocationType,
    description: row[3] as string | undefined,
    x: row[4] as number,
    y: row[5] as number,
    meta: row[6] ? JSON.parse(row[6] as string) : undefined,
    createdAt: row[7] as string,
    updatedAt: row[8] as string,
  };
}

/**
 * Get locations by type
 */
export function getLocationsByType(type: LocationType): Location[] {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM locations WHERE type = ? ORDER BY created_at DESC', [type]);

  if (!result[0]) return [];

  return result[0].values.map((row) => ({
    id: row[0] as string,
    name: row[1] as string,
    type: row[2] as LocationType,
    description: row[3] as string | undefined,
    x: row[4] as number,
    y: row[5] as number,
    meta: row[6] ? JSON.parse(row[6] as string) : undefined,
    createdAt: row[7] as string,
    updatedAt: row[8] as string,
  }));
}

/**
 * Update location
 */
export function updateLocation(
  id: string,
  updates: Partial<Omit<Location, 'id' | 'createdAt' | 'updatedAt'>>
): Location | null {
  const db = getDatabase();
  const existing = getLocationById(id);

  if (!existing) return null;

  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.x !== undefined) {
    fields.push('x = ?');
    values.push(updates.x);
  }
  if (updates.y !== undefined) {
    fields.push('y = ?');
    values.push(updates.y);
  }
  if (updates.meta !== undefined) {
    fields.push('meta = ?');
    values.push(JSON.stringify(updates.meta));
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.run(`UPDATE locations SET ${fields.join(', ')} WHERE id = ?`, values);
  saveDatabase();

  return getLocationById(id);
}

/**
 * Delete location
 */
export function deleteLocation(id: string): boolean {
  const db = getDatabase();
  db.run('DELETE FROM locations WHERE id = ?', [id]);
  saveDatabase();
  return true;
}

/**
 * Delete all locations of a specific type
 */
export function deleteLocationsByType(type: LocationType): number {
  const db = getDatabase();
  const result = db.exec('SELECT COUNT(*) FROM locations WHERE type = ?', [type]);
  const count = result[0]?.values[0]?.[0] as number || 0;

  db.run('DELETE FROM locations WHERE type = ?', [type]);
  saveDatabase();

  return count;
}

/**
 * Search locations by name
 */
export function searchLocationsByName(query: string): Location[] {
  const db = getDatabase();
  const result = db.exec(
    'SELECT * FROM locations WHERE name LIKE ? ORDER BY created_at DESC',
    [`%${query}%`]
  );

  if (!result[0]) return [];

  return result[0].values.map((row) => ({
    id: row[0] as string,
    name: row[1] as string,
    type: row[2] as LocationType,
    description: row[3] as string | undefined,
    x: row[4] as number,
    y: row[5] as number,
    meta: row[6] ? JSON.parse(row[6] as string) : undefined,
    createdAt: row[7] as string,
    updatedAt: row[8] as string,
  }));
}

/**
 * Fix swapped name and type fields in the database
 * This function swaps the name and type columns for all locations
 */
export function fixSwappedNameAndType(): number {
  const db = getDatabase();
  const locations = getAllLocations();
  let fixed = 0;

  // Check if any location has 'core' or 'outer' as its name
  const needsFix = locations.filter(
    (loc) => loc.name === 'core' || loc.name === 'outer'
  );

  if (needsFix.length === 0) {
    return 0;
  }

  // Swap name and type for all locations
  locations.forEach((loc) => {
    const currentName = loc.name;
    const currentType = loc.type;

    // Swap the values
    db.run(
      'UPDATE locations SET name = ?, type = ? WHERE id = ?',
      [currentType, currentName as LocationType, loc.id]
    );
    fixed++;
  });

  saveDatabase();
  return fixed;
}
