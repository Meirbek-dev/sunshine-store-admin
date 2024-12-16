import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cache } from 'react';

import prismadb from '@/lib/prismadb';
import { errorResponses } from '@/lib/error-responses';

// Кэширование запросов на получение билбордов
const getBillboards = cache(async (storeId: string) => {
  return prismadb.billboard.findMany({
    where: { storeId },
    select: {
      id: true,
      label: true,
      imageUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
});

// Расширенная схема валидации для создания билборда
const billboardSchema = z.object({
  label: z
    .string()
    .min(1, 'Укажите метку')
    .max(100, 'Метка слишком длинная')
    .trim(),
  imageUrl: z
    .string()
    .url('Укажите корректный URL изображения')
    .max(500, 'URL слишком длинный')
    .refine((url) => url.startsWith('https://'), 'Разрешены только HTTPS URL'),
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

    // Проверка на лимит билбордов для магазина
    const billboardCount = await prismadb.billboard.count({
      where: { storeId: params.storeId },
    });

    if (billboardCount >= 50) {
      return errorResponses.badRequest('Достигнут лимит билбордов для магазина');
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

      // Проверка на дубликаты
      const existingBillboard = await tx.billboard.findFirst({
        where: {
          storeId: params.storeId,
          label: validationResult.data.label,
        },
        select: { id: true },
      });

      if (existingBillboard) {
        throw new Error('Билборд с такой меткой уже существует');
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

    return NextResponse.json(billboard, {
      status: 201,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('[BILLBOARDS_POST]', error);
    if (error instanceof Error) {
      switch (error.message) {
        case 'Не авторизованный доступ':
          return errorResponses.forbidden();
        case 'Билборд с такой меткой уже существует':
          return errorResponses.conflict(error.message);
        default:
          return errorResponses.serverError(error);
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

    // Используем кэшированную функцию для получения билбордов
    const billboards = await getBillboards(params.storeId);

    return NextResponse.json(billboards, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('[BILLBOARDS_GET]', error);
    return errorResponses.serverError(error);
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ billboardId: string; storeId: string }> },
) {
  const params = await props.params;
  try {
    const { userId }: { userId: string | null } = await auth();

    if (!userId) {
      return new NextResponse('Пользователь не аутентифицирован', {
        status: 403,
      });
    }

    if (!params.billboardId) {
      return new NextResponse('Необходим идентификатор билборда', {
        status: 400,
      });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Не авторизованный доступ', { status: 405 });
    }

    const billboard = await prismadb.billboard.delete({
      where: {
        id: params.billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_DELETE]', error);
    return new NextResponse('Ошибка сервера', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ billboardId: string; storeId: string }> },
) {
  const params = await props.params;
  try {
    const { userId }: { userId: string | null } = await auth();

    const body = await request.json();

    const { label, imageUrl } = body;

    if (!userId) {
      return new NextResponse('Пользователь не аутентифицирован', {
        status: 403,
      });
    }

    if (!label) {
      return new NextResponse('Укажите метку', { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse('Необходимо URL изображения', { status: 400 });
    }

    if (!params.billboardId) {
      return new NextResponse('Необходим идентификатор билборда', {
        status: 400,
      });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Не авторизованный доступ', { status: 405 });
    }

    const billboard = await prismadb.billboard.update({
      where: {
        id: params.billboardId,
      },
      data: {
        label,
        imageUrl,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_PATCH]', error);
    return new NextResponse('Ошибка сервера', { status: 500 });
  }
}
