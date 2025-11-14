import React from 'react';
import { useUIStore } from '../stores';
import { CreateLocationModal } from './locations';
import { CreateCharacterModal } from './characters';

export const ModalManager: React.FC = () => {
  const { modalOpen, modalType, closeModal } = useUIStore();

  return (
    <>
      <CreateLocationModal
        isOpen={modalOpen && modalType === 'create-location'}
        onClose={closeModal}
      />
      <CreateCharacterModal
        isOpen={modalOpen && modalType === 'create-character'}
        onClose={closeModal}
      />
    </>
  );
};
