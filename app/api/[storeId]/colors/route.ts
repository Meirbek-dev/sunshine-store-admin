import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prismadb from '@/lib/prismadb';
import { errorResponses } from '@/lib/error-responses';

// Схема валидации для создания цвета
const colorSchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  value: z
    .string()
    .min(4, 'Неверный формат цвета')
    .max(9, 'Неверный формат цвета')
    .regex(/^#/, { message: 'Цвет должен начинаться с #' }),
});

export async function POST(request: Request, props: { params: Promise<{ storeId: string }> }) {
  try {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponses.unauthorized();
    }

    if (!params.storeId) {
      return errorResponses.badRequest('Необходим идентификатор магазина');
    }

    const body = await request.json();
    const validationResult = colorSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponses.validationError(validationResult.error.message);
    }

    // Используем транзакцию для проверки прав и создания цвета
    const color = await prismadb.$transaction(async (tx) => {
      const storeByUserId = await tx.store.findFirst({
        where: {
          id: params.storeId,
          userId,
        },
        select: { id: true },
      });

      if (!storeByUserId) {
        throw new Error('Не авторизованный доступ');
      }

      return tx.color.create({
        data: {
          name: validationResult.data.name,
          value: validationResult.data.value,
          storeId: params.storeId,
        },
        select: {
          id: true,
          name: true,
          value: true,
          createdAt: true,
        },
      });
    });

    return NextResponse.json(color, { status: 201 });
  } catch (error) {
    console.error('[COLORS_POST]', error);
    if (error instanceof Error && error.message === 'Не авторизованный доступ') {
      return errorResponses.forbidden();
    }
    return errorResponses.serverError(error);
  }
}

export async function GET(request: Request, props: { params: Promise<{ storeId: string }> }) {
  try {
    const params = await props.params;

    if (!params.storeId) {
      return errorResponses.badRequest('Необходим идентификатор магазина');
    }

    const colors = await prismadb.color.findMany({
      where: {
        storeId: params.storeId,
      },
      select: {
        id: true,
        name: true,
        value: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(colors);
  } catch (error) {
    console.error('[COLORS_GET]', error);
    return errorResponses.serverError(error);
  }
}
