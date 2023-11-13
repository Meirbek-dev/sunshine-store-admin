import prismadb from "@/lib/prismadb";

export const getStockCount = async (storeId: string) => {
    return await prismadb.product.count({
        where: {
            storeId, isArchived: false,
        }
    });
};
