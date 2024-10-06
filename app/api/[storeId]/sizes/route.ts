import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(request: Request, { params }: { params: { storeId: string } }) {
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

    if (!params.storeId) {
      return new NextResponse("Необходим идентификатор магазина.", {
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

    const size = await prismadb.size.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZES_POST]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Необходим идентификатор магазина.", {
        status: 400,
      });
    }

    const sizes = await prismadb.size.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.log("[SIZES_GET]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}
