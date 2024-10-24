import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { CategoriesClient } from "./components/client";
import type { CategoryColumn } from "./components/columns";

const CategoriesPage = async (props: { params: Promise<{ storeId: string }> }) => {
  const params = await props.params;
  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      billboard: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCategories: CategoryColumn[] = categories.map((item: any) => ({
    id: item.id,
    name: item.name,
    billboardLabel: item.billboard.label,
    createdAt: format(item.createdAt, "dd.MM.yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoriesClient data={formattedCategories} />
      </div>
    </div>
  );
};

export default CategoriesPage;
