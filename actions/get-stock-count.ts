import prismadb from '@/lib/prismadb';

export const getStockCount = async (storeId: string) =>
  await prismadb.product.count({
    where: {
      storeId,
      isArchived: false,
    },
  });
