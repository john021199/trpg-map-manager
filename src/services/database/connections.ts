import { getDatabase, saveDatabase } from './db';
import type { Connection } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new connection
 */
export function createConnection(
  sourceId: string,
  targetId: string,
  directed: boolean = false,
  weight: number = 1.0,
  meta?: Record<string, any>
): Connection {
  const db = getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    'INSERT INTO connections (id, source_id, target_id, directed, weight, meta, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, sourceId, targetId, directed ? 1 : 0, weight, meta ? JSON.stringify(meta) : null, now]
  );

  saveDatabase();

  return {
    id,
    sourceId,
    targetId,
    directed,
    weight,
    meta,
    createdAt: now,
  };
}

/**
 * Get all connections
 */
export function getAllConnections(): Connection[] {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM connections ORDER BY created_at DESC');

  if (!result[0]) return [];

  return result[0].values.map((row) => ({
    id: row[0] as string,
    sourceId: row[1] as string,
    targetId: row[2] as string,
    directed: row[3] === 1,
    weight: row[4] as number,
    meta: row[5] ? JSON.parse(row[5] as string) : undefined,
    createdAt: row[6] as string,
  }));
}

/**
 * Get connection by ID
 */
export function getConnectionById(id: string): Connection | null {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM connections WHERE id = ?', [id]);

  if (!result[0] || !result[0].values[0]) return null;

  const row = result[0].values[0];
  return {
    id: row[0] as string,
    sourceId: row[1] as string,
    targetId: row[2] as string,
    directed: row[3] === 1,
    weight: row[4] as number,
    meta: row[5] ? JSON.parse(row[5] as string) : undefined,
    createdAt: row[6] as string,
  };
}

/**
 * Get connections for a location
 */
export function getConnectionsForLocation(locationId: string): Connection[] {
  const db = getDatabase();
  const result = db.exec(
    'SELECT * FROM connections WHERE source_id = ? OR target_id = ?',
    [locationId, locationId]
  );

  if (!result[0]) return [];

  return result[0].values.map((row) => ({
    id: row[0] as string,
    sourceId: row[1] as string,
    targetId: row[2] as string,
    directed: row[3] === 1,
    weight: row[4] as number,
    meta: row[5] ? JSON.parse(row[5] as string) : undefined,
    createdAt: row[6] as string,
  }));
}

/**
 * Update connection
 */
export function updateConnection(
  id: string,
  updates: Partial<Omit<Connection, 'id' | 'createdAt'>>
): Connection | null {
  const db = getDatabase();
  const existing = getConnectionById(id);

  if (!existing) return null;

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.sourceId !== undefined) {
    fields.push('source_id = ?');
    values.push(updates.sourceId);
  }
  if (updates.targetId !== undefined) {
    fields.push('target_id = ?');
    values.push(updates.targetId);
  }
  if (updates.directed !== undefined) {
    fields.push('directed = ?');
    values.push(updates.directed ? 1 : 0);
  }
  if (updates.weight !== undefined) {
    fields.push('weight = ?');
    values.push(updates.weight);
  }
  if (updates.meta !== undefined) {
    fields.push('meta = ?');
    values.push(JSON.stringify(updates.meta));
  }

  values.push(id);

  db.run(`UPDATE connections SET ${fields.join(', ')} WHERE id = ?`, values);
  saveDatabase();

  return getConnectionById(id);
}

/**
 * Delete connection
 */
export function deleteConnection(id: string): boolean {
  const db = getDatabase();
  db.run('DELETE FROM connections WHERE id = ?', [id]);
  saveDatabase();
  return true;
}

/**
 * Delete connections for a location
 */
export function deleteConnectionsForLocation(locationId: string): number {
  const db = getDatabase();
  const result = db.exec(
    'SELECT COUNT(*) FROM connections WHERE source_id = ? OR target_id = ?',
    [locationId, locationId]
  );
  const count = result[0]?.values[0]?.[0] as number || 0;

  db.run('DELETE FROM connections WHERE source_id = ? OR target_id = ?', [locationId, locationId]);
  saveDatabase();

  return count;
}

/**
 * Check if connection exists between two locations
 */
export function connectionExists(sourceId: string, targetId: string): boolean {
  const db = getDatabase();
  const result = db.exec(
    'SELECT COUNT(*) FROM connections WHERE (source_id = ? AND target_id = ?) OR (source_id = ? AND target_id = ?)',
    [sourceId, targetId, targetId, sourceId]
  );

  const count = result[0]?.values[0]?.[0] as number || 0;
  return count > 0;
}
