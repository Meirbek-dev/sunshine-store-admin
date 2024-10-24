import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET(request: Request, props: { params: Promise<{ categoryId: string }> }) {
  const params = await props.params;
  try {
    if (!params.categoryId) {
      return new NextResponse("Необходим идентификатор категории.", {
        status: 400,
      });
    }

    const category = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
      },
      include: {
        billboard: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_GET]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ categoryId: string; storeId: string }> },
) {
  const params = await props.params;
  try {
    const { userId }: { userId: string | null } = await auth();

    if (!userId) {
      return new NextResponse("Пользователь не аутентифицирован", {
        status: 403,
      });
    }

    if (!params.categoryId) {
      return new NextResponse("Необходим идентификатор категории.", {
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
      return new NextResponse("Не авторизованный доступ", { status: 405 });
    }

    const category = await prismadb.category.delete({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ categoryId: string; storeId: string }> },
) {
  const params = await props.params;
  try {
    const { userId }: { userId: string | null } = await auth();

    const body = await request.json();

    const { name, billboardId } = body;

    if (!userId) {
      return new NextResponse("Пользователь не аутентифицирован", {
        status: 403,
      });
    }

    if (!billboardId) {
      return new NextResponse("Необходим идентификатор билборда.", {
        status: 400,
      });
    }

    if (!name) {
      return new NextResponse("Укажите название.", { status: 400 });
    }

    if (!params.categoryId) {
      return new NextResponse("Необходим идентификатор категории.", {
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
      return new NextResponse("Не авторизованный доступ", { status: 405 });
    }

    const category = await prismadb.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        billboardId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}
