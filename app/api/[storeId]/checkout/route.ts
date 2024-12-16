import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { z } from 'zod';

import prismadb from '@/lib/prismadb';
import { stripe } from '@/lib/stripe';
import { errorResponses } from '@/lib/error-responses';

// Схема валидации для запроса
const checkoutSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'Необходимо выбрать хотя бы один товар'),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request, props: { params: Promise<{ storeId: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();

    const validationResult = checkoutSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponses.validationError(validationResult.error.message);
    }

    const { productIds } = validationResult.data;

    const { products, order } = await prismadb.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          isArchived: false, // Проверяем, что товар не в архиве
        },
        select: {
          id: true,
          name: true,
          price: true,
          storeId: true,
        },
      });

      if (products.length !== productIds.length) {
        throw new Error('Некоторые товары не найдены или недоступны');
      }

      // Проверяем, что все товары из одного магазина
      if (!products.every((product) => product.storeId === params.storeId)) {
        throw new Error('Товары должны быть из одного магазина');
      }

      const order = await tx.order.create({
        data: {
          storeId: params.storeId,
          isPaid: false,
          orderItems: {
            create: productIds.map((productId) => ({
              product: {
                connect: { id: productId },
              },
            })),
          },
        },
        select: {
          id: true,
        },
      });

      return { products, order };
    });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = products.map((product) => ({
      quantity: 1,
      price_data: {
        currency: 'KZT',
        product_data: {
          name: product.name,
        },
        unit_amount: Math.round(product.price * 100),
      },
    }));

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
      cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
      metadata: {
        orderId: order.id,
      },
    });

    return NextResponse.json({ url: session.url }, { headers: corsHeaders });
  } catch (error) {
    console.error('[CHECKOUT_POST]', error);
    if (error instanceof Error) {
      return errorResponses.badRequest(error.message);
    }
    return errorResponses.serverError(error);
  }
}
