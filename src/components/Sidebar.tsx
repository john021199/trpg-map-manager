import React from 'react';
import { useUIStore } from '../stores';
import { Button } from './common';
import { EditLocationModal } from './locations';
import { EditCharacterModal } from './characters';
import type { Location, Character } from '../types';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, currentPanel, setCurrentPanel, setSidebarOpen } = useUIStore();

  if (!sidebarOpen) {
    return (
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-r-lg p-2 z-10 hover:bg-gray-50"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <div className="w-80 bg-white shadow-lg h-full overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">TRPG Map Manager</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b">
        <div className="flex flex-col gap-2">
          <Button
            variant={currentPanel === 'locations' ? 'primary' : 'ghost'}
            onClick={() => setCurrentPanel('locations')}
            className="w-full justify-start"
          >
            Locations
          </Button>
          <Button
            variant={currentPanel === 'characters' ? 'primary' : 'ghost'}
            onClick={() => setCurrentPanel('characters')}
            className="w-full justify-start"
          >
            Characters
          </Button>
          <Button
            variant={currentPanel === 'settings' ? 'primary' : 'ghost'}
            onClick={() => setCurrentPanel('settings')}
            className="w-full justify-start"
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Content Panel */}
      <div className="flex-1 p-4">
        {currentPanel === 'locations' && <LocationsPanel />}
        {currentPanel === 'characters' && <CharactersPanel />}
        {currentPanel === 'settings' && <SettingsPanel />}
        {!currentPanel && (
          <div className="text-center text-gray-500 mt-8">
            Select a panel to get started
          </div>
        )}
      </div>
    </div>
  );
};

const LocationsPanel: React.FC = () => {
  const { locations } = useMapStore();
  const { openModal } = useUIStore();
  const [selectedLocation, setSelectedLocation] = React.useState<Location | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Locations</h2>
        <Button size="sm" onClick={() => openModal('create-location')}>
          + Add
        </Button>
      </div>

      <div className="space-y-2">
        {locations.map((location) => (
          <div
            key={location.id}
            onClick={() => handleEditLocation(location)}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{location.name}</div>
                <div className="text-xs text-gray-500">{location.type}</div>
              </div>
              {location.type === 'core' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  CORE
                </span>
              )}
            </div>
          </div>
        ))}

        {locations.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No locations yet. Click "Add" to create one.
          </div>
        )}
      </div>

      <EditLocationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        location={selectedLocation}
      />
    </div>
  );
};

const CharactersPanel: React.FC = () => {
  const { characters } = useCharacterStore();
  const { openModal } = useUIStore();
  const [selectedCharacter, setSelectedCharacter] = React.useState<Character | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(new Set());

  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setIsEditModalOpen(true);
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Group characters by category
  const groupedCharacters = React.useMemo(() => {
    const groups: Record<string, Character[]> = {};
    characters.forEach((char) => {
      const category = char.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(char);
    });
    return groups;
  }, [characters]);

  const categories = Object.keys(groupedCharacters).sort((a, b) => {
    // "Uncategorized" always goes last
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Characters</h2>
        <Button size="sm" onClick={() => openModal('create-character')}>
          + Add
        </Button>
      </div>

      <div className="space-y-3">
        {categories.map((category) => {
          const categoryCharacters = groupedCharacters[category];
          const isCollapsed = collapsedCategories.has(category);

          return (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-150 flex items-center justify-between text-sm font-medium text-gray-700"
              >
                <span>
                  {category} ({categoryCharacters.length})
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {!isCollapsed && (
                <div className="p-2 space-y-1">
                  {categoryCharacters.map((character) => (
                    <div
                      key={character.id}
                      onClick={() => handleEditCharacter(character)}
                      className="p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: character.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{character.name}</div>
                        {character.description && (
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {character.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {characters.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No characters yet. Click "Add" to create one.
          </div>
        )}
      </div>

      <EditCharacterModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        character={selectedCharacter}
      />
    </div>
  );
};

const SettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { locations } = useMapStore();

  const coreCount = locations.filter(loc => loc.type === 'core').length;
  const outerCount = locations.filter(loc => loc.type === 'outer').length;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Settings</h2>

      <div className="space-y-4">
        {/* Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="font-semibold text-blue-900 mb-2">Workflow:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Create 4 core locations (set positions)</li>
            <li>Create 16 outer locations</li>
            <li>Click "Generate Connections"</li>
          </ol>
          <p className="text-xs text-blue-700 mt-2">
            ℹ️ Core positions stay fixed, outer positions randomize on each generation
          </p>
        </div>

        {/* Current Stats */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Current Status:</p>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Core Locations:</span>
              <span className={`font-semibold ${coreCount === 4 ? 'text-green-600' : 'text-orange-600'}`}>
                {coreCount} / 4
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Outer Locations:</span>
              <span className={`font-semibold ${outerCount === 16 ? 'text-green-600' : 'text-orange-600'}`}>
                {outerCount} / 16
              </span>
            </div>
          </div>
        </div>

        {/* Connection Settings */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Connection Settings:</p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-green-900 mb-1">Auto-configured:</p>
            <ul className="list-disc list-inside space-y-1 text-green-800">
              <li>Min connections: 1 per location</li>
              <li>Max connections: 5 per location</li>
              <li>Core locations can connect to each other</li>
              <li>Each core connects to ≥1 outer</li>
              <li>No overlapping connections</li>
              <li>Core positions fixed, outer randomized</li>
            </ul>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Average Degree: {settings.avgDegree}
            </label>
            <input
              type="range"
              min="2"
              max="4"
              step="0.5"
              value={settings.avgDegree}
              onChange={(e) =>
                updateSettings({ avgDegree: parseFloat(e.target.value) })
              }
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Target average connections (actual may vary due to constraints)
            </p>
          </div>
        </div>

        {/* Display Settings */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Display Settings:</p>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showGrid"
              checked={settings.showGrid}
              onChange={(e) => updateSettings({ showGrid: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="showGrid" className="text-sm text-gray-700">
              Show Grid
            </label>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="allowCycles"
              checked={settings.allowCycles}
              onChange={(e) => updateSettings({ allowCycles: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="allowCycles" className="text-sm text-gray-700">
              Allow Cycles
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import stores
import { useMapStore } from '../stores';
import { useCharacterStore } from '../stores';
import { useSettingsStore } from '../stores';
