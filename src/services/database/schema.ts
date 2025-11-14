// SQLite schema for TRPG Map Manager

export const SCHEMA_SQL = `
-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('core', 'outer')),
  description TEXT,
  x REAL NOT NULL,
  y REAL NOT NULL,
  meta TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  directed INTEGER DEFAULT 0,
  weight REAL DEFAULT 1.0,
  meta TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (source_id) REFERENCES locations(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  category TEXT,
  description TEXT,
  current_location_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (current_location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- Character positions history
CREATE TABLE IF NOT EXISTS character_positions (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  notes TEXT,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Map settings
CREATE TABLE IF NOT EXISTS map_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  outer_node_count INTEGER DEFAULT 10,
  avg_degree INTEGER DEFAULT 3,
  allow_multiple_edges INTEGER DEFAULT 0,
  allow_cycles INTEGER DEFAULT 1,
  auto_save_interval INTEGER DEFAULT 60,
  show_grid INTEGER DEFAULT 1,
  node_color_theme TEXT DEFAULT 'default',
  export_format TEXT DEFAULT 'json',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_connections_source ON connections(source_id);
CREATE INDEX IF NOT EXISTS idx_connections_target ON connections(target_id);
CREATE INDEX IF NOT EXISTS idx_characters_location ON characters(current_location_id);
CREATE INDEX IF NOT EXISTS idx_character_positions_character ON character_positions(character_id);
CREATE INDEX IF NOT EXISTS idx_character_positions_timestamp ON character_positions(timestamp);

-- Insert default settings
INSERT OR IGNORE INTO map_settings (id) VALUES ('default');
`;
