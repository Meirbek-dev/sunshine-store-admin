'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useStoreModal } from '@/hooks/use-store-modal';

// Компонент настройки магазина
const SetupPage = () => {
  const router = useRouter();

  // Используем селекторы из хука с мемоизацией
  const { onOpen, isOpen } = useStoreModal(
    useCallback(
      (state) => ({
        onOpen: state.onOpen,
        isOpen: state.isOpen,
      }),
      [],
    ),
  );

  useEffect(() => {
    try {
      if (!isOpen) {
        onOpen();
      }
    } catch (error) {
      console.error('[SETUP_PAGE]', error);
    }
  }, [isOpen, onOpen]);

  // Возвращаем пустой фрагмент вместо null для лучшей производительности
  return <></>;
};

export default SetupPage;
