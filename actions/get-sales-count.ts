import prismadb from "@/lib/prismadb";

export const getSalesCount = async (storeId: string) => {
    return await prismadb.order.count({
        where: {
            storeId, isPaid: true
        },
    });
};
