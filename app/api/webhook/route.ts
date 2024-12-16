import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import prismadb from '@/lib/prismadb';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  // Validate request
  if (!request.body) {
    return new NextResponse('Missing request body', { status: 400 });
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('Stripe-Signature');

  if (!signature) {
    return new NextResponse('Missing Stripe signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Missing Stripe webhook secret');
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse(
      `Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 400 },
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Validate session and metadata
  if (!session?.metadata?.orderId) {
    return new NextResponse('Missing order ID in session metadata', {
      status: 400,
    });
  }

  const orderId = session.metadata.orderId;
  const address = session.customer_details?.address;

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ];

  const addressString = addressComponents.filter(Boolean).join(', ');

  try {
    if (event.type === 'checkout.session.completed') {
      // Use transaction to ensure data consistency
      await prismadb.$transaction(async (tx) => {
        const order = await tx.order.update({
          where: {
            id: orderId,
          },
          data: {
            isPaid: true,
            address: addressString,
            phone: session.customer_details?.phone ?? '',
          },
          include: {
            orderItems: true,
          },
        });

        const productIds = order.orderItems.map((orderItem) => orderItem.productId);

        if (productIds.length > 0) {
          await tx.product.updateMany({
            where: {
              id: {
                in: productIds,
              },
            },
            data: {
              isArchived: true,
            },
          });
        }
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
