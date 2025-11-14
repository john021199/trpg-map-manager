import React, { useState } from 'react';
import { Modal, Input, Button } from '../common';
import { useMapStore } from '../../stores';

interface CreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateLocationModal: React.FC<CreateLocationModalProps> = ({ isOpen, onClose }) => {
  const { createLocation } = useMapStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<'core' | 'outer'>('core');
  const [description, setDescription] = useState('');
  const [x, setX] = useState('300');
  const [y, setY] = useState('200');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a location name');
      return;
    }

    createLocation(name, type, parseFloat(x), parseFloat(y), description || undefined);

    // Reset form
    setName('');
    setType('core');
    setDescription('');
    setX('300');
    setY('200');

    onClose();
  };

  const handleClose = () => {
    setName('');
    setType('core');
    setDescription('');
    setX('300');
    setY('200');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Location">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Location name"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="core"
                checked={type === 'core'}
                onChange={(e) => setType(e.target.value as 'core')}
                className="mr-2"
              />
              Core (Fixed)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="outer"
                checked={type === 'outer'}
                onChange={(e) => setType(e.target.value as 'outer')}
                className="mr-2"
              />
              Outer (Random)
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="X Position"
            type="number"
            value={x}
            onChange={(e) => setX(e.target.value)}
            placeholder="X"
          />
          <Input
            label="Y Position"
            type="number"
            value={y}
            onChange={(e) => setY(e.target.value)}
            placeholder="Y"
          />
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
