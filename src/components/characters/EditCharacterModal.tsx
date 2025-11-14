import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../common';
import { useCharacterStore, useMapStore } from '../../stores';
import type { Character } from '../../types';

interface EditCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character | null;
}

export const EditCharacterModal: React.FC<EditCharacterModalProps> = ({ isOpen, onClose, character }) => {
  const { updateCharacter, deleteCharacter, moveCharacter } = useCharacterStore();
  const { locations } = useMapStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [currentLocationId, setCurrentLocationId] = useState('');

  useEffect(() => {
    if (character) {
      setName(character.name);
      setColor(character.color);
      setCategory(character.category || '');
      setDescription(character.description || '');
      setCurrentLocationId(character.currentLocationId || '');
    }
  }, [character]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!character) return;

    if (!name.trim()) {
      alert('Please enter a character name');
      return;
    }

    updateCharacter(character.id, {
      name: name.trim(),
      color,
      category: category.trim() || undefined,
      description: description.trim() || undefined,
    });

    // If location changed, move the character
    if (currentLocationId !== character.currentLocationId) {
      if (currentLocationId) {
        moveCharacter(character.id, currentLocationId);
      }
    }

    onClose();
  };

  const handleDelete = () => {
    if (!character) return;

    if (confirm(`Are you sure you want to delete "${character.name}"? This action cannot be undone.`)) {
      deleteCharacter(character.id);
      onClose();
    }
  };

  const handleClose = () => {
    if (character) {
      setName(character.name);
      setColor(character.color);
      setCategory(character.category || '');
      setDescription(character.description || '');
      setCurrentLocationId(character.currentLocationId || '');
    }
    onClose();
  };

  if (!character) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Character">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <Input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#3b82f6"
              className="flex-1"
            />
          </div>
        </div>

        <Input
          label="Category (Optional)"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., NPC, Player, Enemy"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
          <select
            value={currentLocationId}
            onChange={(e) => setCurrentLocationId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No location</option>
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

        <div className="flex gap-2 justify-between">
          <Button type="button" variant="danger" onClick={handleDelete}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
