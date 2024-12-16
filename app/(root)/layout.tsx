import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { z } from 'zod';

import prismadb from '@/lib/prismadb';
import { errorResponses } from '@/lib/error-responses';

// Кэширование запроса на получение магазина
const getStore = cache(async (userId: string) => {
  return prismadb.store.findFirst({
    where: { userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
});

// Схема валидации для userId
const userIdSchema = z.string().min(1, 'ID пользователя обязателен');

export default async function SetupLayout({ children }: { children: React.ReactNode }) {
  try {
    const { userId } = await auth();

    // Валидация userId
    const validationResult = userIdSchema.safeParse(userId);

    if (!validationResult.success) {
      redirect('/sign-in');
    }

    // Используем кэшированную функцию для получения магазина
    const store = await getStore(validationResult.data);

    if (store) {
      redirect(`/${store.id}`);
    }

    return <div className="min-h-screen">{children}</div>;
  } catch (error) {
    console.error('[SETUP_LAYOUT]', error);
    redirect('/error');
  }
}
