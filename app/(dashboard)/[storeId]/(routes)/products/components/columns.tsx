"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export interface ProductColumn {
  id: string;
  name: string;
  price: string;
  category: string;
  size: string;
  color: string;
  createdAt: string;
  isFeatured: boolean;
  isArchived: boolean;
}

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Название",
  },
  {
    accessorKey: "isArchived",
    header: "Архивирован",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.isArchived ? "Да" : "Нет"}
      </div>
    ),
  },
  {
    accessorKey: "isFeatured",
    header: "Рекомендован на главной странице",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.isArchived ? "Да" : "Нет"}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Цена",
  },
  {
    accessorKey: "category",
    header: "Категория",
  },
  {
    accessorKey: "size",
    header: "Размер",
  },
  {
    accessorKey: "color",
    header: "Цвет",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.color}
        <div
          className="size-6 rounded-full border"
          style={{ backgroundColor: row.original.color }}
        />
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Дата",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
