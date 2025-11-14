import { getDatabase, saveDatabase } from './db';
import type { MapSettings } from '../../types';

/**
 * Get map settings
 */
export function getMapSettings(): MapSettings {
  const db = getDatabase();
  const result = db.exec("SELECT * FROM map_settings WHERE id = 'default'");

  if (!result[0] || !result[0].values[0]) {
    // Return default settings if not found
    return {
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
    };
  }

  const row = result[0].values[0];
  return {
    id: row[0] as string,
    outerNodeCount: row[1] as number,
    avgDegree: row[2] as number,
    allowMultipleEdges: row[3] === 1,
    allowCycles: row[4] === 1,
    autoSaveInterval: row[5] as number,
    showGrid: row[6] === 1,
    nodeColorTheme: row[7] as string,
    exportFormat: row[8] as 'json' | 'png' | 'graphml',
    updatedAt: row[9] as string,
  };
}

/**
 * Update map settings
 */
export function updateMapSettings(
  updates: Partial<Omit<MapSettings, 'id' | 'updatedAt'>>
): MapSettings {
  const db = getDatabase();
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.outerNodeCount !== undefined) {
    fields.push('outer_node_count = ?');
    values.push(updates.outerNodeCount);
  }
  if (updates.avgDegree !== undefined) {
    fields.push('avg_degree = ?');
    values.push(updates.avgDegree);
  }
  if (updates.allowMultipleEdges !== undefined) {
    fields.push('allow_multiple_edges = ?');
    values.push(updates.allowMultipleEdges ? 1 : 0);
  }
  if (updates.allowCycles !== undefined) {
    fields.push('allow_cycles = ?');
    values.push(updates.allowCycles ? 1 : 0);
  }
  if (updates.autoSaveInterval !== undefined) {
    fields.push('auto_save_interval = ?');
    values.push(updates.autoSaveInterval);
  }
  if (updates.showGrid !== undefined) {
    fields.push('show_grid = ?');
    values.push(updates.showGrid ? 1 : 0);
  }
  if (updates.nodeColorTheme !== undefined) {
    fields.push('node_color_theme = ?');
    values.push(updates.nodeColorTheme);
  }
  if (updates.exportFormat !== undefined) {
    fields.push('export_format = ?');
    values.push(updates.exportFormat);
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push('default');

  db.run(`UPDATE map_settings SET ${fields.join(', ')} WHERE id = ?`, values);
  saveDatabase();

  return getMapSettings();
}
