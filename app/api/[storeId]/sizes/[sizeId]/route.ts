import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';

export async function GET(request: Request, props: { params: Promise<{ sizeId: string }> }) {
  const params = await props.params;
  try {
    if (!params.sizeId) {
      return new NextResponse('Необходим идентификатор размера.', {
        status: 400,
      });
    }

    const size = await prismadb.size.findUnique({
      where: {
        id: params.sizeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZE_GET]', error);
    return new NextResponse('Ошибка сервера', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ sizeId: string; storeId: string }> },
) {
  const params = await props.params;
  try {
    const { userId }: { userId: string | null } = await auth();

    if (!userId) {
      return new NextResponse('Пользователь не аутентифицирован', {
        status: 403,
      });
    }

    if (!params.sizeId) {
      return new NextResponse('Необходим идентификатор размера.', {
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

    const size = await prismadb.size.delete({
      where: {
        id: params.sizeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZE_DELETE]', error);
    return new NextResponse('Ошибка сервера', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ sizeId: string; storeId: string }> },
) {
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

    if (!params.sizeId) {
      return new NextResponse('Необходим идентификатор размера.', {
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

    const size = await prismadb.size.update({
      where: {
        id: params.sizeId,
      },
      data: {
        name,
        value,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZE_PATCH]', error);
    return new NextResponse('Ошибка сервера', { status: 500 });
  }
}
