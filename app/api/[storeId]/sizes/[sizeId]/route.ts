import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prismadb from '@/lib/prismadb';
import { errorResponses } from '@/lib/error-responses';

// Схема валидации для обновления размера
const updateSizeSchema = z.object({
  name: z.string().min(1, 'Укажите название.'),
  value: z.string().min(1, 'Укажите значение.'),
});

// Получение размера по ID
export async function GET(request: Request, props: { params: Promise<{ sizeId: string }> }) {
  try {
    const params = await props.params;

    if (!params.sizeId) {
      return new NextResponse('Необходим идентификатор размера.', { status: 400 });
    }

    const size = await prismadb.size.findUnique({
      where: { id: params.sizeId },
      select: { id: true, name: true, value: true, createdAt: true, updatedAt: true },
    });

    if (!size) {
      return new NextResponse('Размер не найден', { status: 404 });
    }

    return NextResponse.json(size);
  } catch (error) {
    console.error('[SIZE_GET]', error);
    return errorResponses.serverError(error);
  }
}

// Удаление размера
export async function DELETE(
  request: Request,
  props: { params: Promise<{ sizeId: string; storeId: string }> },
) {
  try {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponses.unauthorized();
    }

    if (!params.sizeId) {
      return new NextResponse('Необходим идентификатор размера.', { status: 400 });
    }

    const size = await prismadb.$transaction(async (tx) => {
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

      return tx.size.delete({
        where: { id: params.sizeId },
      });
    });

    return NextResponse.json(size);
  } catch (error) {
    console.error('[SIZE_DELETE]', error);
    if (error instanceof Error && error.message === 'Не авторизованный доступ') {
      return new NextResponse(error.message, { status: 405 });
    }
    return errorResponses.serverError(error);
  }
}

// Обновление размера
export async function PATCH(
  request: Request,
  props: { params: Promise<{ sizeId: string; storeId: string }> },
) {
  try {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponses.unauthorized();
    }

    if (!params.sizeId) {
      return new NextResponse('Необходим идентификатор размера.', { status: 400 });
    }

    // Валидация входных данных
    const body = await request.json();
    const validationResult = updateSizeSchema.safeParse(body);

    if (!validationResult.success) {
      return new NextResponse(validationResult.error.message, { status: 400 });
    }

    // Используем транзакцию для обновления
    const size = await prismadb.$transaction(async (tx) => {
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

      return tx.size.update({
        where: { id: params.sizeId },
        data: {
          name: validationResult.data.name,
          value: validationResult.data.value,
        },
        select: {
          id: true,
          name: true,
          value: true,
          updatedAt: true,
        },
      });
    });

    return NextResponse.json(size);
  } catch (error) {
    console.error('[SIZE_PATCH]', error);
    if (error instanceof Error && error.message === 'Не авторизованный доступ') {
      return new NextResponse(error.message, { status: 405 });
    }
    return errorResponses.serverError(error);
  }
}
