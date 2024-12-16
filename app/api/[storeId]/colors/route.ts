import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';

export async function POST(request: Request, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  try {
    const { userId }: { userId: string | null } = await auth();

    const body = await request.json();

    const { name, value } = body;

    if (!userId) {
      return new NextResponse('Пользователь не аутентифицирован', {
        status: 403,
      });
    }

    if (!name) {
      return new NextResponse('Укажите название.', { status: 400 });
    }

    if (!value) {
      return new NextResponse('Укажите значение.', { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse('Необходим идентификатор магазина.', {
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

    const color = await prismadb.color.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log('[COLORS_POST]', error);
    return new NextResponse('Ошибка сервера', { status: 500 });
  }
}

export async function GET(request: Request, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  try {
    if (!params.storeId) {
      return new NextResponse('Необходим идентификатор магазина.', {
        status: 400,
      });
    }

    const colors = await prismadb.color.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(colors);
  } catch (error) {
    console.log('[COLORS_GET]', error);
    return new NextResponse('Ошибка сервера', { status: 500 });
  }
}
