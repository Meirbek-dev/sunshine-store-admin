import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prismadb from '@/lib/prismadb';
import { errorResponses } from '@/lib/error-responses';

// Схема валидации для обновления категории
const updateCategorySchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  billboardId: z.string().uuid('Неверный формат идентификатора билборда'),
});

export async function GET(request: Request, props: { params: Promise<{ categoryId: string }> }) {
  try {
    const params = await props.params;

    if (!params.categoryId) {
      return errorResponses.badRequest('Необходим идентификатор категории');
    }

    const category = await prismadb.category.findUnique({
      where: { id: params.categoryId },
      select: {
        id: true,
        name: true,
        billboard: {
          select: {
            id: true,
            label: true,
            imageUrl: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!category) {
      return errorResponses.notFound('Категория не найдена');
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_GET]', error);
    return errorResponses.serverError(error);
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ categoryId: string; storeId: string }> },
) {
  try {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponses.unauthorized();
    }

    if (!params.categoryId) {
      return errorResponses.badRequest('Необходим идентификатор категории');
    }

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

      // Проверяем наличие связанных продуктов
      const productsCount = await tx.product.count({
        where: { categoryId: params.categoryId },
      });

      if (productsCount > 0) {
        throw new Error('Нельзя удалить категорию с привязанными товарами');
      }

      return tx.category.delete({
        where: { id: params.categoryId },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      });
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_DELETE]', error);
    if (error instanceof Error) {
      if (error.message === 'Не авторизованный доступ') {
        return errorResponses.forbidden();
      }
      if (error.message === 'Нельзя удалить категорию с привязанными товарами') {
        return errorResponses.badRequest(error.message);
      }
    }
    return errorResponses.serverError(error);
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ categoryId: string; storeId: string }> },
) {
  try {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponses.unauthorized();
    }

    const body = await request.json();
    const validationResult = updateCategorySchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponses.validationError(validationResult.error.message);
    }

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

      return tx.category.update({
        where: { id: params.categoryId },
        data: validationResult.data,
        select: {
          id: true,
          name: true,
          billboard: {
            select: {
              id: true,
              label: true,
            },
          },
          updatedAt: true,
        },
      });
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_PATCH]', error);
    if (error instanceof Error) {
      if (error.message === 'Не авторизованный доступ') {
        return errorResponses.forbidden();
      }
      if (error.message === 'Билборд не найден') {
        return errorResponses.notFound(error.message);
      }
    }
    return errorResponses.serverError(error);
  }
}
