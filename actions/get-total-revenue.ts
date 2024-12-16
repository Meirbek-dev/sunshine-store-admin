import prismadb from '@/lib/prismadb';

export const getTotalRevenue = async (storeId: string) => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  return paidOrders.reduce((total: any, order: any) => {
    const orderTotal = order.orderItems.reduce(
      (orderSum: any, item: any) => orderSum + item.product.price.toNumber(),
      0,
    );
    return total + orderTotal;
  }, 0);
};
