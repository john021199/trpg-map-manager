import { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { initDatabase, saveDatabase } from './services/database';
import { useMapStore, useCharacterStore, useSettingsStore } from './stores';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/map';
import { Toolbar } from './components/Toolbar';
import { ModalManager } from './components/ModalManager';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMap = useMapStore((state) => state.loadMap);
  const loadCharacters = useCharacterStore((state) => state.loadCharacters);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        loadMap();
        loadCharacters();
        loadSettings();
        setIsInitialized(true);

        // Set up auto-save
        const interval = setInterval(() => {
          saveDatabase();
        }, 30000); // Auto-save every 30 seconds

        return () => clearInterval(interval);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to initialize database. Please refresh the page.');
      }
    };

    initialize();
  }, [loadMap, loadCharacters, loadSettings]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing database...</p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Toolbar />
          <div className="flex-1">
            <MapView />
          </div>
        </div>
      </div>
      <ModalManager />
    </ReactFlowProvider>
  );
}

export default App;
