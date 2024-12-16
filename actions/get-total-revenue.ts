import { cache } from 'react';
import { z } from 'zod';

import prismadb from '@/lib/prismadb';

const storeIdSchema = z.string().uuid('Неверный формат идентификатора магазина');

interface PrismaOrder {
  orderItems: {
    product: {
      price: number;
    };
  }[];
}

// Кэшированная функция получения выручки
export const getTotalRevenue = cache(async (storeId: string) => {
  try {
    const validationResult = storeIdSchema.safeParse(storeId);

    if (!validationResult.success) {
      throw new Error('Неверный идентификатор магазина');
    }

    const paidOrders = await prismadb.order.findMany({
      where: {
        storeId: validationResult.data,
        isPaid: true,
      },
      select: {
        orderItems: {
          select: {
            product: {
              select: {
                price: true,
              },
            },
          },
        },
      },
    });

    return paidOrders.reduce((total: number, order: PrismaOrder) => {
      const orderTotal = order.orderItems.reduce(
        (orderSum: number, item) =>
          orderSum + item.product.price,
        0,
      );
      return total + orderTotal;
    }, 0);
  } catch (error) {
    console.error('[GET_TOTAL_REVENUE]', error);
    return 0;
  }
});
