'use client';

import { Plus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { ApiList } from '@/components/ui/api-list';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

import { type SizeColumn, columns } from './columns';

interface SizesClientProperties {
  data: SizeColumn[];
}

export const SizesClient: React.FC<SizesClientProperties> = ({ data }) => {
  const parameters = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Размеры (${data.length})`}
          description="Менеджмент размерами ваших товаров"
        />
        <Button onClick={() => router.push(`/${parameters.storeId}/sizes/new`)}>
          <Plus className="mr-2 size-4" /> Добавить
        </Button>
      </div>
      <Separator />
      <DataTable
        searchKey="name"
        columns={columns}
        data={data}
      />
      <Heading
        title="API"
        description="API-запросы к размерам"
      />
      <Separator />
      <ApiList
        entityName="sizes"
        entityIdName="sizeId"
      />
    </>
  );
};
