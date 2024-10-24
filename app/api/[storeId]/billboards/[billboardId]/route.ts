import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET(request: Request, props: { params: Promise<{ billboardId: string }> }) {
  const params = await props.params;
  try {
    if (!params.billboardId) {
      return new NextResponse("Необходим идентификатор билборда.", {
        status: 400,
      });
    }

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: params.billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_GET]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
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
      return new NextResponse("Пользователь не аутентифицирован", {
        status: 403,
      });
    }

    if (!params.billboardId) {
      return new NextResponse("Необходим идентификатор билборда", {
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

    const billboard = await prismadb.billboard.delete({
      where: {
        id: params.billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
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
      return new NextResponse("Пользователь не аутентифицирован", {
        status: 403,
      });
    }

    if (!label) {
      return new NextResponse("Укажите метку", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("Необходимо URL изображения", { status: 400 });
    }

    if (!params.billboardId) {
      return new NextResponse("Необходим идентификатор билборда", {
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
    console.log("[BILLBOARD_PATCH]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}
