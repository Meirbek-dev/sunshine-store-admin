"use client";

import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { type OrderColumn, columns } from "./columns";

interface OrderClientProperties {
  data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProperties> = ({ data }) => (
  <>
    <Heading title={`Заказы (${data.length})`} description="Менеджмент заказами вашего магазина" />
    <Separator />
    <DataTable searchKey="products" columns={columns} data={data} />
  </>
);
