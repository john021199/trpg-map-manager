import React, { useState } from 'react';
import { Modal, Input, Button } from '../common';
import { useCharacterStore, useMapStore } from '../../stores';

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({ isOpen, onClose }) => {
  const { createCharacter } = useCharacterStore();
  const { locations } = useMapStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [currentLocationId, setCurrentLocationId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a character name');
      return;
    }

    createCharacter(
      name,
      color,
      category || undefined,
      description || undefined,
      currentLocationId || undefined
    );

    // Reset form
    setName('');
    setColor(PRESET_COLORS[0]);
    setCategory('');
    setDescription('');
    setCurrentLocationId('');

    onClose();
  };

  const handleClose = () => {
    setName('');
    setColor(PRESET_COLORS[0]);
    setCategory('');
    setDescription('');
    setCurrentLocationId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Character">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Character name"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
          <div className="flex gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={`w-10 h-10 rounded-full border-2 ${
                  color === presetColor ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900' : 'border-gray-300'
                }`}
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-2 w-full h-10 cursor-pointer"
          />
        </div>

        <Input
          label="Category (Optional)"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., NPC, Player, Enemy"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Initial Location</label>
          <select
            value={currentLocationId}
            onChange={(e) => setCurrentLocationId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">None</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} ({location.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};
