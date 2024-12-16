import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { errorResponses } from '@/lib/error-responses';
import prismadb from '@/lib/prismadb';

// Validation schema
const updateStoreSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
});

export async function PATCH(request: Request, props: { params: Promise<{ storeId: string }> }) {
  try {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponses.unauthorized();
    }

    // Validate input
    const body = await request.json();
    const validationResult = updateStoreSchema.safeParse(body);

    if (!validationResult.success) {
      return new NextResponse(validationResult.error.message, { status: 400 });
    }

    // Update store with transaction for data consistency
    const store = await prismadb.$transaction(async (tx) => {
      const existingStore = await tx.store.findFirst({
        where: {
          id: params.storeId,
          userId,
        },
        select: { id: true },
      });

      if (!existingStore) {
        throw new Error('Store not found');
      }

      return tx.store.update({
        where: {
          id: params.storeId,
        },
        data: {
          name: validationResult.data.name,
        },
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
      });
    });

    return NextResponse.json(store, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Store not found') {
      return errorResponses.notFound();
    }
    return errorResponses.serverError(error);
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ storeId: string }> }) {
  try {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
      return errorResponses.unauthorized();
    }

    // Delete store with transaction
    const store = await prismadb.$transaction(async (tx) => {
      const existingStore = await tx.store.findFirst({
        where: {
          id: params.storeId,
          userId,
        },
        select: { id: true },
      });

      if (!existingStore) {
        throw new Error('Store not found');
      }

      // Delete related records first (cascade if needed)
      await tx.store.delete({
        where: {
          id: params.storeId,
        },
      });

      return { success: true };
    });

    return NextResponse.json(store, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Store not found') {
      return errorResponses.notFound();
    }
    return errorResponses.serverError(error);
  }
}
