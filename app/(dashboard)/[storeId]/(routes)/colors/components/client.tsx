'use client';

import { Plus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { ApiList } from '@/components/ui/api-list';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

import { type ColorColumn, columns } from './columns';

interface ColorClientProperties {
  data: ColorColumn[];
}

export const ColorClient: React.FC<ColorClientProperties> = ({ data }) => {
  const parameters = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Цвета (${data.length})`}
          description="Менеджмент цветами ваших товаров"
        />
        <Button onClick={() => router.push(`/${parameters.storeId}/colors/new`)}>
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
        description="API-запросы к цветам"
      />
      <Separator />
      <ApiList
        entityName="colors"
        entityIdName="colorId"
      />
    </>
  );
};
