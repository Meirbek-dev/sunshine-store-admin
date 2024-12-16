import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useIsClient } from '@/hooks/use-is-client';

interface AlertModalProperties {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean; // Optional, defaults to false
}

export const AlertModal: React.FC<AlertModalProperties> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return (
    <Modal
      title="Вы уверены?"
      description="Это действие необратимо."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex w-full items-center justify-end gap-2 pt-6">
        <Button
          disabled={loading}
          variant="outline"
          onClick={onClose}
          aria-label="Отменить действие"
        >
          Отменить
        </Button>
        <Button
          disabled={loading}
          variant="destructive"
          onClick={onConfirm}
          aria-busy={loading} // Indicate a loading state for accessibility
          aria-label="Подтвердить действие"
        >
          {loading ? 'Загрузка...' : 'Продолжить'}
        </Button>
      </div>
    </Modal>
  );
};
