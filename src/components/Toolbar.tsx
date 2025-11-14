import React from 'react';
import { useMapStore, useSettingsStore, useCharacterStore } from '../stores';
import { exportToJSON, importFromJSON, saveDatabase, fixSwappedNameAndType } from '../services/database';
import { Button } from './common';

export const Toolbar: React.FC = () => {
  const { generateNewMap, regenerateOuter, generateConnections, clearAllConnections, resetMap, loadMap } = useMapStore();
  const { settings } = useSettingsStore();
  const { loadCharacters } = useCharacterStore();

  const handleGenerateMap = () => {
    if (confirm('Generate a new map? This will create new outer nodes based on current settings.')) {
      generateNewMap({
        outerNodeCount: settings.outerNodeCount,
        avgDegree: settings.avgDegree,
        allowMultipleEdges: settings.allowMultipleEdges,
        allowCycles: settings.allowCycles,
      });
    }
  };

  const handleRegenerateOuter = () => {
    if (confirm('Regenerate outer nodes? This will remove all auto-generated outer locations and create new ones. Manually created locations will be preserved.')) {
      regenerateOuter({
        outerNodeCount: settings.outerNodeCount,
        avgDegree: settings.avgDegree,
        allowMultipleEdges: settings.allowMultipleEdges,
        allowCycles: settings.allowCycles,
      });
    }
  };

  const handleGenerateConnections = () => {
    if (confirm('Generate connections? This will delete all existing connections and create new ones based on current settings. Each core location will connect to at least one outer location.')) {
      generateConnections({
        outerNodeCount: settings.outerNodeCount,
        avgDegree: settings.avgDegree,
        allowMultipleEdges: settings.allowMultipleEdges,
        allowCycles: settings.allowCycles,
      });
    }
  };

  const handleClearConnections = () => {
    if (confirm('Clear all connections? This will remove all connections but keep all locations.')) {
      clearAllConnections();
    }
  };

  const handleResetMap = () => {
    if (
      confirm(
        'Reset the entire map? This will DELETE ALL locations, connections, and characters. This action cannot be undone!'
      )
    ) {
      resetMap();
    }
  };

  const handleExport = () => {
    try {
      const jsonData = exportToJSON();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trpg-map-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export map');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        importFromJSON(text);
        loadMap();
        alert('Map imported successfully!');
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import map. Please check the file format.');
      }
    };
    input.click();
  };

  const handleSave = () => {
    saveDatabase();
    alert('Map saved successfully!');
  };

  const handleFixData = () => {
    if (
      confirm(
        'Fix swapped name and type fields? This will swap the name and type columns for all locations that have "core" or "outer" as their name.'
      )
    ) {
      const fixed = fixSwappedNameAndType();
      if (fixed > 0) {
        loadMap();
        loadCharacters();
        alert(`Fixed ${fixed} locations. Please refresh the page if needed.`);
      } else {
        alert('No locations need fixing. All data looks correct!');
      }
    }
  };

  return (
    <div className="bg-white shadow-sm border-b px-4 py-2 flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="primary" onClick={handleGenerateConnections}>
          Generate Connections
        </Button>
        <Button size="sm" variant="secondary" onClick={handleClearConnections}>
          Clear Connections
        </Button>
      </div>
      <div className="h-6 w-px bg-gray-300" />
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={handleGenerateMap}>
          Generate Map (Legacy)
        </Button>
        <Button size="sm" variant="ghost" onClick={handleRegenerateOuter}>
          Regenerate Outer (Legacy)
        </Button>
      </div>
      <div className="flex-1" />
      <Button size="sm" variant="ghost" onClick={handleFixData}>
        Fix Data
      </Button>
      <Button size="sm" variant="ghost" onClick={handleSave}>
        Save
      </Button>
      <Button size="sm" variant="ghost" onClick={handleExport}>
        Export
      </Button>
      <Button size="sm" variant="ghost" onClick={handleImport}>
        Import
      </Button>
      <Button size="sm" variant="danger" onClick={handleResetMap}>
        Reset All
      </Button>
    </div>
  );
};
