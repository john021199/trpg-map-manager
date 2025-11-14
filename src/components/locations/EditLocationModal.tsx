import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../common';
import { useMapStore } from '../../stores';
import type { Location } from '../../types';

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
}

export const EditLocationModal: React.FC<EditLocationModalProps> = ({ isOpen, onClose, location }) => {
  const { updateLocation, deleteLocation } = useMapStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (location) {
      setName(location.name);
      setDescription(location.description || '');
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) return;

    if (!name.trim()) {
      alert('Please enter a location name');
      return;
    }

    updateLocation(location.id, {
      name: name.trim(),
      description: description.trim() || undefined,
    });

    onClose();
  };

  const handleDelete = () => {
    if (!location) return;

    if (confirm(`Are you sure you want to delete "${location.name}"? This action cannot be undone.`)) {
      deleteLocation(location.id);
      onClose();
    }
  };

  const handleClose = () => {
    if (location) {
      setName(location.name);
      setDescription(location.description || '');
    }
    onClose();
  };

  if (!location) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Location">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
            {location.type === 'core' ? 'Core (Fixed)' : 'Outer (Random)'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
            X: {Math.round(location.x)}, Y: {Math.round(location.y)}
          </div>
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
