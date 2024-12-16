import prismadb from '@/lib/prismadb';

interface GraphData {
  name: string;
  total: number;
}

export const getGraphRevenue = async (storeId: string): Promise<GraphData[]> => {
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

  const monthlyRevenue: { [key: number]: number } = {};

  for (const order of paidOrders) {
    const month = order.createdAt.getMonth();
    let revenueForOrder = 0;

    for (const item of order.orderItems) {
      const price = item.product.price;
      revenueForOrder += price ?? 0;
    }

    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
  }

  const graphData: GraphData[] = Array.from({ length: 12 }, (_, i) => ({
    name: new Date(2000, i).toLocaleString('default', { month: 'long' }),
    total: monthlyRevenue[i] || 0,
  }));

  return graphData;
};
