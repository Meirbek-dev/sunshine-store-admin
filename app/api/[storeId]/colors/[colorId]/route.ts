import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET(request: Request, { params }: { params: { colorId: string } }) {
  try {
    if (!params.colorId) {
      return new NextResponse("Необходим идентификатор цвета.", {
        status: 400,
      });
    }

    const color = await prismadb.color.findUnique({
      where: {
        id: params.colorId,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_GET]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { colorId: string; storeId: string } },
) {
  try {
    const { userId }: { userId: string | null } = auth();

    if (!userId) {
      return new NextResponse("Пользователь не аутентифицирован", {
        status: 403,
      });
    }

    if (!params.colorId) {
      return new NextResponse("Необходим идентификатор цвета.", {
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

    const color = await prismadb.color.delete({
      where: {
        id: params.colorId,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_DELETE]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { colorId: string; storeId: string } },
) {
  try {
    const { userId }: { userId: string | null } = auth();

    const body = await request.json();

    const { name, value } = body;

    if (!userId) {
      return new NextResponse("Пользователь не аутентифицирован", {
        status: 403,
      });
    }

    if (!name) {
      return new NextResponse("Укажите название.", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Укажите значение.", { status: 400 });
    }

    if (!params.colorId) {
      return new NextResponse("Необходим идентификатор цвета.", {
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

    const color = await prismadb.color.update({
      where: {
        id: params.colorId,
      },
      data: {
        name,
        value,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_PATCH]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}
