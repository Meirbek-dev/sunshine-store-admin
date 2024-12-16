import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prismadb from '@/lib/prismadb';
import { errorResponses } from '@/lib/error-responses';

// Схема валидации для создания категории
const categorySchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  billboardId: z.string().uuid('Неверный формат идентификатора билборда'),
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
    const validationResult = categorySchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponses.validationError(validationResult.error.message);
    }

    // Используем транзакцию для проверки прав и создания категории
    const category = await prismadb.$transaction(async (tx) => {
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

      // Проверяем существование билборда
      const billboard = await tx.billboard.findUnique({
        where: { id: validationResult.data.billboardId },
        select: { id: true },
      });

      if (!billboard) {
        throw new Error('Билборд не найден');
      }

      return tx.category.create({
        data: {
          name: validationResult.data.name,
          billboardId: validationResult.data.billboardId,
          storeId: params.storeId,
        },
        select: {
          id: true,
          name: true,
          billboardId: true,
          createdAt: true,
        },
      });
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('[CATEGORIES_POST]', error);
    if (error instanceof Error) {
      if (error.message === 'Не авторизованный доступ') {
        return errorResponses.forbidden();
      }
      if (error.message === 'Билборд не найден') {
        return errorResponses.notFound('Указанный билборд не найден');
      }
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

    const categories = await prismadb.category.findMany({
      where: {
        storeId: params.storeId,
      },
      select: {
        id: true,
        name: true,
        billboard: {
          select: {
            id: true,
            label: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('[CATEGORIES_GET]', error);
    return errorResponses.serverError(error);
  }
}
