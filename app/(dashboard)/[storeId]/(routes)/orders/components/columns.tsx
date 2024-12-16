'use client';

import type { ColumnDef } from '@tanstack/react-table';

export interface OrderColumn {
  id: string;
  phone: string;
  address: string;
  isPaid: boolean;
  totalPrice: string;
  products: string;
  createdAt: string;
}

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: 'products',
    header: 'Товары',
  },
  {
    accessorKey: 'phone',
    header: 'Телефон',
  },
  {
    accessorKey: 'address',
    header: 'Адрес',
  },
  {
    accessorKey: 'totalPrice',
    header: 'Итоговая цена',
  },
  {
    accessorKey: 'isPaid',
    header: 'Оплачено',
  },
];
