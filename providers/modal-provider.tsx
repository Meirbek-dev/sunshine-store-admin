'use client';

import { StoreModal } from '@/components/modals/store-modal';
import { useIsClient } from '@/hooks/use-is-client';

export const ModalProvider = () => {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return <StoreModal />;
};
