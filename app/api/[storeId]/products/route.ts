import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(request: Request, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  try {
    const { userId }: { userId: string | null } = await auth();

    const body = await request.json();

    const { name, price, categoryId, colorId, sizeId, images, isFeatured, isArchived } = body;

    if (!userId) {
      return new NextResponse("Пользователь не аутентифицирован", {
        status: 403,
      });
    }

    if (!name) {
      return new NextResponse("Укажите название.", { status: 400 });
    }

    if (!images || images.length === 0) {
      return new NextResponse("Необходимо загрузить изображение", {
        status: 400,
      });
    }

    if (!price) {
      return new NextResponse("Укажите цену", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Необходим идентификатор категории.", {
        status: 400,
      });
    }

    if (!colorId) {
      return new NextResponse("Необходим идентификатор цвета.", {
        status: 400,
      });
    }

    if (!sizeId) {
      return new NextResponse("Необходим идентификатор размера.", {
        status: 400,
      });
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

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        isFeatured,
        isArchived,
        categoryId,
        colorId,
        sizeId,
        storeId: params.storeId,
        images: {
          createMany: {
            data: images.map((image: { url: string }) => image),
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}

export async function GET(request: Request, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const colorId = searchParams.get("colorId") || undefined;
    const sizeId = searchParams.get("sizeId") || undefined;
    const isFeatured = searchParams.get("isFeatured");

    if (!params.storeId) {
      return new NextResponse("Необходим идентификатор магазина.", {
        status: 400,
      });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}
