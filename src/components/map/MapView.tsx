import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import type { Node, Edge, Connection, NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { useMapStore, useCharacterStore, useSettingsStore } from '../../stores';
import { LocationNode } from './LocationNode';

const nodeTypes: NodeTypes = {
  location: LocationNode,
};

export const MapView: React.FC = () => {
  const { locations, connections, setSelectedLocation, updateLocation } = useMapStore();
  const { characters } = useCharacterStore();
  const { settings } = useSettingsStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert locations to React Flow nodes
  useEffect(() => {
    const flowNodes: Node[] = locations.map((location) => {
      const locationCharacters = characters.filter(
        (char) => char.currentLocationId === location.id
      );

      return {
        id: location.id,
        type: 'location',
        position: { x: location.x, y: location.y },
        data: {
          location,
          characters: locationCharacters,
        },
        className: location.type === 'core' ? 'core-node' : 'outer-node',
      };
    });

    setNodes(flowNodes);
  }, [locations, characters, setNodes]);

  // Handle node drag to update position in database
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChange(changes);

      // Update location positions in database when nodes are dragged
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && change.dragging === false) {
          updateLocation(change.id, {
            x: change.position.x,
            y: change.position.y,
          });
        }
      });
    },
    [onNodesChange, updateLocation]
  );

  // Helper function to determine the best handle positions based on node positions
  const getHandlePositions = (sourceX: number, sourceY: number, targetX: number, targetY: number) => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Determine handles based on angle
    // Right: -45° to 45°
    // Bottom: 45° to 135°
    // Left: 135° to -135° (or 135° to 180° and -180° to -135°)
    // Top: -135° to -45°

    let sourceHandle = 'right-source';
    let targetHandle = 'left';

    if (angle >= -45 && angle < 45) {
      // Target is to the right
      sourceHandle = 'right-source';
      targetHandle = 'left';
    } else if (angle >= 45 && angle < 135) {
      // Target is below
      sourceHandle = 'bottom-source';
      targetHandle = 'top';
    } else if (angle >= 135 || angle < -135) {
      // Target is to the left
      sourceHandle = 'left-source';
      targetHandle = 'right';
    } else {
      // Target is above
      sourceHandle = 'top-source';
      targetHandle = 'bottom';
    }

    return { sourceHandle, targetHandle };
  };

  // Convert connections to React Flow edges
  useEffect(() => {
    const flowEdges: Edge[] = connections.map((connection) => {
      // Find the source and target locations
      const sourceLocation = locations.find((loc) => loc.id === connection.sourceId);
      const targetLocation = locations.find((loc) => loc.id === connection.targetId);

      let sourceHandle = 'right-source';
      let targetHandle = 'left';

      if (sourceLocation && targetLocation) {
        const handles = getHandlePositions(
          sourceLocation.x,
          sourceLocation.y,
          targetLocation.x,
          targetLocation.y
        );
        sourceHandle = handles.sourceHandle;
        targetHandle = handles.targetHandle;
      }

      return {
        id: connection.id,
        source: connection.sourceId,
        target: connection.targetId,
        sourceHandle,
        targetHandle,
        type: connection.directed ? 'default' : 'default',
        animated: false,
        style: { strokeWidth: 2 },
      };
    });

    setEdges(flowEdges);
  }, [connections, locations, setEdges]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedLocation(node.id);
    },
    [setSelectedLocation]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      // This will be handled by the store
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView={locations.length === 0}
        fitViewOptions={{ padding: 0.2 }}
        noDragClassName="nodrag"
      >
        <Controls />
        {settings.showGrid && (
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        )}
      </ReactFlow>
    </div>
  );
};
