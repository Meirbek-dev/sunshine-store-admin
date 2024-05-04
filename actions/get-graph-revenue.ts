import prismadb from "@/lib/prismadb";

interface GraphData {
	name: string;
	total: number;
}

export const getGraphRevenue = async (
	storeId: string,
): Promise<GraphData[]> => {
	const paidOrders = await prismadb.order.findMany({
		where: {
			storeId,
			isPaid: true,
		},
		include: {
			orderItems: {
				include: {
					product: true,
				},
			},
		},
	});

	const monthlyRevenue: { [key: number]: number } = {};

	for (const order of paidOrders) {
		const month = order.createdAt.getMonth();
		let revenueForOrder = 0;

		for (const item of order.orderItems) {
			revenueForOrder += item.product.price.toNumber();
		}

		monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
	}

	const graphData: GraphData[] = [
		{ name: "Январь", total: 0 },
		{ name: "Февраль", total: 0 },
		{ name: "Март", total: 0 },
		{ name: "Апрель", total: 0 },
		{ name: "Май", total: 0 },
		{ name: "Июнь", total: 0 },
		{ name: "Июль", total: 0 },
		{ name: "Август", total: 0 },
		{ name: "Сентябрь", total: 0 },
		{ name: "Октябрь", total: 0 },
		{ name: "Ноябрь", total: 0 },
		{ name: "Декабрь", total: 0 },
	];

	for (const month in monthlyRevenue) {
		graphData[Number.parseInt(month)].total =
			monthlyRevenue[Number.parseInt(month)];
	}

	return graphData;
};
