import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { SCHEMA_SQL } from './schema';

let db: Database | null = null;
let SQL: any = null;

/**
 * Run database migrations
 */
function runMigrations(database: Database): void {
  // Migration: Add category column to characters table if it doesn't exist
  try {
    const result = database.exec("PRAGMA table_info(characters)");
    const columns = result[0]?.values.map((row) => row[1]) || [];

    if (!columns.includes('category')) {
      console.log('Running migration: Adding category column to characters table');
      database.run('ALTER TABLE characters ADD COLUMN category TEXT');
      saveDatabase();
      console.log('Migration completed: category column added');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

/**
 * Initialize the SQLite database
 */
export async function initDatabase(): Promise<Database> {
  if (db) return db;

  try {
    // Initialize sql.js
    SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });

    // Try to load existing database from localStorage
    const savedDb = localStorage.getItem('trpg-map-db');

    if (savedDb) {
      const uint8Array = new Uint8Array(
        atob(savedDb)
          .split('')
          .map((c) => c.charCodeAt(0))
      );
      db = new SQL!.Database(uint8Array);

      // Run migrations on existing database
      runMigrations(db);
    } else {
      // Create new database
      db = new SQL!.Database();
      db!.run(SCHEMA_SQL);
    }

    console.log('Database initialized successfully');
    return db!;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Save database to localStorage
 */
export function saveDatabase(): void {
  if (!db) {
    console.warn('Database not initialized');
    return;
  }

  try {
    const data = db.export();
    const base64 = btoa(
      Array.from(data)
        .map((byte) => String.fromCharCode(byte))
        .join('')
    );
    localStorage.setItem('trpg-map-db', base64);
    console.log('Database saved to localStorage');
  } catch (error) {
    console.error('Failed to save database:', error);
    throw error;
  }
}

/**
 * Get the current database instance
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Reset the database (delete all data)
 */
export function resetDatabase(): void {
  if (!db) return;

  db.run('DROP TABLE IF EXISTS locations');
  db.run('DROP TABLE IF EXISTS connections');
  db.run('DROP TABLE IF EXISTS characters');
  db.run('DROP TABLE IF EXISTS character_positions');
  db.run('DROP TABLE IF EXISTS map_settings');
  db.run(SCHEMA_SQL);
  saveDatabase();
  console.log('Database reset successfully');
}

/**
 * Export database to JSON
 */
export function exportToJSON(): string {
  const db = getDatabase();

  const locations = db.exec('SELECT * FROM locations')[0]?.values || [];
  const connections = db.exec('SELECT * FROM connections')[0]?.values || [];
  const characters = db.exec('SELECT * FROM characters')[0]?.values || [];
  const positions = db.exec('SELECT * FROM character_positions')[0]?.values || [];
  const settings = db.exec('SELECT * FROM map_settings')[0]?.values || [];

  return JSON.stringify({
    locations,
    connections,
    characters,
    character_positions: positions,
    map_settings: settings,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

/**
 * Import database from JSON
 */
export function importFromJSON(jsonData: string): void {
  try {
    const data = JSON.parse(jsonData);
    const db = getDatabase();

    // Clear existing data
    db.run('DELETE FROM character_positions');
    db.run('DELETE FROM characters');
    db.run('DELETE FROM connections');
    db.run('DELETE FROM locations');
    db.run('DELETE FROM map_settings');

    // Import locations
    if (data.locations) {
      const stmt = db.prepare(
        'INSERT INTO locations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      data.locations.forEach((row: any[]) => stmt.run(row));
      stmt.free();
    }

    // Import connections
    if (data.connections) {
      const stmt = db.prepare(
        'INSERT INTO connections VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      data.connections.forEach((row: any[]) => stmt.run(row));
      stmt.free();
    }

    // Import characters
    if (data.characters) {
      const stmt = db.prepare(
        'INSERT INTO characters VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      data.characters.forEach((row: any[]) => stmt.run(row));
      stmt.free();
    }

    // Import character positions
    if (data.character_positions) {
      const stmt = db.prepare(
        'INSERT INTO character_positions VALUES (?, ?, ?, ?, ?)'
      );
      data.character_positions.forEach((row: any[]) => stmt.run(row));
      stmt.free();
    }

    // Import settings
    if (data.map_settings) {
      const stmt = db.prepare(
        'INSERT INTO map_settings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      data.map_settings.forEach((row: any[]) => stmt.run(row));
      stmt.free();
    }

    saveDatabase();
    console.log('Database imported successfully');
  } catch (error) {
    console.error('Failed to import database:', error);
    throw error;
  }
}
