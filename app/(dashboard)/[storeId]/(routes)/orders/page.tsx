import { format } from 'date-fns';

import prismadb from '@/lib/prismadb';
import { formatter } from '@/lib/utils';

import { OrderClient } from './components/client';
import type { OrderColumn } from './components/columns';

const OrdersPage = async (props: { params: Promise<{ storeId: string }> }) => {
  const params = await props.params;
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedOrders: OrderColumn[] = orders.map((item: any) => ({
    id: item.id,
    phone: item.phone,
    address: item.address,
    products: item.orderItems.map((orderItem: any) => orderItem.product.name).join(', '),
    totalPrice: formatter.format(
      item.orderItems.reduce((total: any, item: any) => total + Number(item.product.price), 0),
    ),
    isPaid: item.isPaid,
    createdAt: format(item.createdAt, 'dd.MM.yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
