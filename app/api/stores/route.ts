import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prismadb from '@/lib/prismadb';

const createStoreSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
});

export async function POST(request: Request) {
  try {
    // Get user authentication status
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createStoreSchema.safeParse(body);

    if (!validationResult.success) {
      return new NextResponse(validationResult.error.message, { status: 400 });
    }

    // Create store with validated data
    const store = await prismadb.store.create({
      data: {
        name: validationResult.data.name,
        userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    // Log error for monitoring but don't expose details
    console.error('[STORES_POST]', error);

    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
