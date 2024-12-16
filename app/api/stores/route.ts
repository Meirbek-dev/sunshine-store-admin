import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prismadb from '@/lib/prismadb';
import { errorResponses } from '@/lib/error-responses';

// схема валидации для создания магазина
const createStoreSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя слишком длинное')
    .trim()
    .regex(/^[\p{L}\s-]+$/u, 'Имя может содержать только буквы, пробелы и дефисы'),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponses.unauthorized();
    }

    const body = await request.json();
    const validationResult = createStoreSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponses.validationError(validationResult.error.message);
    }

    // Проверка на лимит магазинов
    const storesCount = await prismadb.store.count({
      where: { userId },
    });

    if (storesCount >= 7) {
      return errorResponses.forbidden('Достигнут лимит магазинов (максимум 3)');
    }

    // Используем транзакцию для проверки дубликатов и создания магазина
    const store = await prismadb.$transaction(async (tx) => {
      // Проверка на дубликаты
      const existingStore = await tx.store.findFirst({
        where: {
          userId,
          name: validationResult.data.name,
        },
        select: { id: true },
      });

      if (existingStore) {
        throw new Error('Магазин с таким именем уже существует');
      }

      return tx.store.create({
        data: {
          name: validationResult.data.name,
          userId,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      });
    });

    return NextResponse.json(store, {
      status: 201,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[STORES_POST]', error);
    if (error instanceof Error) {
      switch (error.message) {
        case 'Магазин с таким именем уже существует':
          return errorResponses.conflict(error.message);
        default:
          return errorResponses.serverError(error);
      }
    }
    return errorResponses.serverError(error);
  }
}
