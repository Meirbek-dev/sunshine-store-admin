import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prismadb from '@/lib/prismadb';
import { errorResponses } from '@/lib/error-responses';

// Validation schemas
const productSchema = z.object({
  name: z.string().min(1, 'Укажите название.'),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
  categoryId: z.string().min(1, 'Необходим идентификатор категории'),
  colorId: z.string().min(1, 'Необходим идентификатор цвета'),
  sizeId: z.string().min(1, 'Необходим идентификатор размера'),
  images: z.array(z.object({ url: z.string().url() })).min(1, 'Необходимо загрузить изображение'),
  isFeatured: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export async function GET(request: Request, props: { params: Promise<{ productId: string }> }) {
  try {
    const params = await props.params;

    if (!params.productId) {
      return errorResponses.badRequest('Необходим идентификатор товара');
    }

    const product = await prismadb.product.findUnique({
      where: { id: params.productId },
      select: {
        id: true,
        name: true,
        price: true,
        isFeatured: true,
        isArchived: true,
        images: { select: { url: true, id: true } },
        category: { select: { id: true, name: true } },
        size: { select: { id: true, name: true, value: true } },
        color: { select: { id: true, name: true, value: true } },
      },
    });

    if (!product) {
      return errorResponses.notFound('Товар не найден');
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
    return errorResponses.serverError(error);
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ productId: string; storeId: string }> },
) {
  try {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponses.unauthorized();
    }

    const product = await prismadb.$transaction(async (tx) => {
      const storeByUserId = await tx.store.findFirst({
        where: { id: params.storeId, userId },
        select: { id: true },
      });

      if (!storeByUserId) {
        throw new Error('Не авторизованный доступ');
      }

      // Удаляем связанные изображения
      await tx.image.deleteMany({
        where: { productId: params.productId },
      });

      return tx.product.delete({
        where: { id: params.productId },
        select: { id: true, name: true },
      });
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_DELETE]', error);
    if (error instanceof Error && error.message === 'Не авторизованный доступ') {
      return errorResponses.forbidden();
    }
    return errorResponses.serverError(error);
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ productId: string; storeId: string }> },
) {
  try {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponses.unauthorized();
    }

    const body = await request.json();
    const validationResult = productSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponses.badRequest(validationResult.error.message);
    }

    const product = await prismadb.$transaction(async (tx) => {
      const storeByUserId = await tx.store.findFirst({
        where: { id: params.storeId, userId },
        select: { id: true },
      });

      if (!storeByUserId) {
        throw new Error('Не авторизованный доступ');
      }

      // Обновляем основные данные и удаляем старые изображения
      await tx.product.update({
        where: { id: params.productId },
        data: {
          name: validationResult.data.name,
          price: validationResult.data.price,
          categoryId: validationResult.data.categoryId,
          colorId: validationResult.data.colorId,
          sizeId: validationResult.data.sizeId,
          isFeatured: validationResult.data.isFeatured,
          isArchived: validationResult.data.isArchived,
          images: { deleteMany: {} },
        },
      });

      // Создаем новые изображения
      return tx.product.update({
        where: { id: params.productId },
        data: {
          images: {
            createMany: {
              data: validationResult.data.images,
            },
          },
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: { select: { url: true } },
        },
      });
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_PATCH]', error);
    if (error instanceof Error && error.message === 'Не авторизованный доступ') {
      return errorResponses.forbidden();
    }
    return errorResponses.serverError(error);
  }
}
