"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { ApiList } from "@/components/ui/api-list";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { type ProductColumn, columns } from "./columns";

interface ProductsClientProperties {
  data: ProductColumn[];
}

export const ProductsClient: React.FC<ProductsClientProperties> = ({ data }) => {
  const parameters = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Товары (${data.length})`}
          description="Менеджмент товарами вашего магазина"
        />
        <Button onClick={() => router.push(`/${parameters.storeId}/products/new`)}>
          <Plus className="mr-2 size-4" /> Добавить
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API-запросы к товарам" />
      <Separator />
      <ApiList entityName="products" entityIdName="productId" />
    </>
  );
};
