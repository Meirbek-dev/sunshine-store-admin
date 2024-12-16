import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prismadb from '@/lib/prismadb';
import { errorResponses } from '@/lib/error-responses';

// Схема валидации для создания билборда
const billboardSchema = z.object({
  label: z.string().min(1, 'Укажите метку'),
  imageUrl: z.string().url('Укажите корректный URL изображения'),
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
    const validationResult = billboardSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponses.validationError(validationResult.error.message);
    }

    // Используем транзакцию для проверки прав и создания билборда
    const billboard = await prismadb.$transaction(async (tx) => {
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

      return tx.billboard.create({
        data: {
          ...validationResult.data,
          storeId: params.storeId,
        },
        select: {
          id: true,
          label: true,
          imageUrl: true,
          createdAt: true,
        },
      });
    });

    return NextResponse.json(billboard, { status: 201 });
  } catch (error) {
    console.error('[BILLBOARDS_POST]', error);
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

    const billboards = await prismadb.billboard.findMany({
      where: {
        storeId: params.storeId,
      },
      select: {
        id: true,
        label: true,
        imageUrl: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(billboards);
  } catch (error) {
    console.error('[BILLBOARDS_GET]', error);
    return errorResponses.serverError(error);
  }
}
