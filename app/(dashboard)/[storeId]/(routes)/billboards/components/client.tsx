'use client';

import { Plus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { ApiList } from '@/components/ui/api-list';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

import { type BillboardColumn, columns } from './columns';

interface BillboardClientProperties {
  data: BillboardColumn[];
}

export const BillboardClient: React.FC<BillboardClientProperties> = ({ data }) => {
  const parameters = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Билборды (${data.length})`}
          description="Менеджмент билбордами вашего магазина"
        />
        <Button onClick={() => router.push(`/${parameters.storeId}/billboards/new`)}>
          <Plus className="mr-2 size-4" /> Добавить
        </Button>
      </div>
      <Separator />
      <DataTable
        searchKey="label"
        columns={columns}
        data={data}
      />
      <Heading
        title="API"
        description="API-запросы к билбордам"
      />
      <Separator />
      <ApiList
        entityName="billboards"
        entityIdName="billboardId"
      />
    </>
  );
};
