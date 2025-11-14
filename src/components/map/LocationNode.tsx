import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { Location, Character } from '../../types';
import { useCharacterStore } from '../../stores';

interface LocationNodeData {
  location: Location;
  characters: Character[];
}

export const LocationNode: React.FC<NodeProps<LocationNodeData>> = ({ data }) => {
  const { location, characters } = data;
  const { moveCharacter } = useCharacterStore();
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragStart = (e: React.DragEvent, characterId: string) => {
    e.stopPropagation(); // Prevent ReactFlow from handling this drag event
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', characterId); // Use 'text/plain' for better compatibility
    console.log('Character drag started:', characterId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent ReactFlow from handling this
    setIsDragOver(false);

    const characterId = e.dataTransfer.getData('text/plain');
    console.log('Character dropped:', characterId, 'to location:', location.id);
    if (characterId && characterId !== '') {
      // Move the character to this location
      moveCharacter(characterId, location.id);
    }
  };

  return (
    <div
      className={`px-2 py-0.5 rounded-md border-2 shadow-sm bg-white min-w-[70px] transition-colors ${
        isDragOver ? 'border-blue-500 bg-blue-50' : location.type === 'core' ? 'border-blue-400' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Connection handles on all four sides */}
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />

      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="source" position={Position.Right} id="right-source" />

      <div className="text-center relative min-h-[40px] flex flex-col justify-between">
        {/* Location Name at top */}
        <div className="font-semibold text-xs leading-tight">{location.name}</div>

        {/* Description absolutely centered */}
        {location.description && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-[9px] text-gray-500 leading-tight line-clamp-1 px-1">
            {location.description}
          </div>
        )}

        {/* Characters at bottom */}
        {characters.length > 0 && (
          <div className="flex gap-0.5 justify-center mt-auto nodrag">
            {characters.map((char) => (
              <div
                key={char.id}
                draggable
                onDragStart={(e) => handleDragStart(e, char.id)}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="nodrag w-3 h-3 rounded-full border border-white shadow-sm cursor-move hover:scale-110 transition-transform"
                style={{ backgroundColor: char.color }}
                title={char.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
