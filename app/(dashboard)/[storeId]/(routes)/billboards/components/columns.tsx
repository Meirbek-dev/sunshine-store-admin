'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { CellAction } from './cell-action';

export interface BillboardColumn {
  id: string;
  label: string;
  createdAt: string;
}

export const columns: ColumnDef<BillboardColumn>[] = [
  {
    accessorKey: 'label',
    header: 'Название',
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
