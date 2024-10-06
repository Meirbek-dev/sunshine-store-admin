import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(request: Request) {
  try {
    const { userId }: { userId: string | null } = auth();
    const body = await request.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("Не авторизованный доступ", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Необходимо ввести имя", { status: 400 });
    }

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORES_POST]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}
