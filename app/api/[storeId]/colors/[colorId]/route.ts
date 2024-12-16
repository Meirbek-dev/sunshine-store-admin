import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prismadb from '@/lib/prismadb';
import { errorResponses } from '@/lib/error-responses';

// Схема валидации для обновления цвета
const updateColorSchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  value: z.string()
    .min(4, 'Неверный формат цвета')
    .max(9, 'Неверный формат цвета')
    .regex(/^#/, { message: 'Цвет должен начинаться с #' }),
});

export async function GET(request: Request, props: { params: Promise<{ colorId: string }> }) {
  try {
    const params = await props.params;

    if (!params.colorId) {
      return errorResponses.badRequest('Необходим идентификатор цвета');
    }

    const color = await prismadb.color.findUnique({
      where: { id: params.colorId },
      select: {
        id: true,
        name: true,
        value: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!color) {
      return errorResponses.notFound('Цвет не найден');
    }

    return NextResponse.json(color);
  } catch (error) {
    console.error('[COLOR_GET]', error);
    return errorResponses.serverError(error);
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ colorId: string; storeId: string }> },
) {
  try {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponses.unauthorized();
    }

    if (!params.colorId) {
      return errorResponses.badRequest('Необходим идентификатор цвета');
    }
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

      // Проверяем использование цвета в товарах
      const productsUsingColor = await tx.product.count({
        where: { colorId: params.colorId },
      });

      if (productsUsingColor > 0) {
        throw new Error('Цвет используется в товарах');
      }

      return tx.color.delete({
        where: { id: params.colorId },
        select: {
          id: true,
          name: true,
          value: true,
        },
      });
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error('[COLOR_DELETE]', error);
    if (error instanceof Error) {
      if (error.message === 'Не авторизованный доступ') {
        return errorResponses.forbidden();
      }
      if (error.message === 'Цвет используется в товарах') {
        return errorResponses.conflict('Нельзя удалить цвет, который используется в товарах');
      }
    }
    return errorResponses.serverError(error);
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ colorId: string; storeId: string }> },
) {
  try {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponses.unauthorized();
    }

    if (!params.colorId) {
      return errorResponses.badRequest('Необходим идентификатор цвета');
    }

    const body = await request.json();
    const validationResult = updateColorSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponses.validationError(validationResult.error.message);
    }

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

      return tx.color.update({
        where: { id: params.colorId },
        data: validationResult.data,
        select: {
          id: true,
          name: true,
          value: true,
          updatedAt: true,
        },
      });
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error('[COLOR_PATCH]', error);
    return errorResponses.serverError(error);
  }
}
