import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
	req: Request,
	{ params }: { params: { productId: string } },
) {
	try {
		if (!params.productId) {
			return new NextResponse("Необходим идентификатор товара.", {
				status: 400,
			});
		}

		const product = await prismadb.product.findUnique({
			where: {
				id: params.productId,
			},
			include: {
				images: true,
				category: true,
				size: true,
				color: true,
			},
		});

		return NextResponse.json(product);
	} catch (error) {
		console.log("[PRODUCT_GET]", error);
		return new NextResponse("Ошибка сервера", { status: 500 });
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { productId: string; storeId: string } },
) {
	try {
		const { userId } = auth();

		if (!userId) {
			return new NextResponse("Пользователь не аутентифицирован", {
				status: 403,
			});
		}

		if (!params.productId) {
			return new NextResponse("Необходим идентификатор товара.", {
				status: 400,
			});
		}

		const storeByUserId = await prismadb.store.findFirst({
			where: {
				id: params.storeId,
				userId,
			},
		});

		if (!storeByUserId) {
			return new NextResponse("Не авторизованный доступ", { status: 405 });
		}

		const product = await prismadb.product.delete({
			where: {
				id: params.productId,
			},
		});

		return NextResponse.json(product);
	} catch (error) {
		console.log("[PRODUCT_DELETE]", error);
		return new NextResponse("Ошибка сервера", { status: 500 });
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: { productId: string; storeId: string } },
) {
	try {
		const { userId } = auth();

		const body = await req.json();

		const {
			name,
			price,
			categoryId,
			images,
			colorId,
			sizeId,
			isFeatured,
			isArchived,
		} = body;

		if (!userId) {
			return new NextResponse("Пользователь не аутентифицирован", {
				status: 403,
			});
		}

		if (!params.productId) {
			return new NextResponse("Необходим идентификатор товара.", {
				status: 400,
			});
		}

		if (!name) {
			return new NextResponse("Укажите название.", { status: 400 });
		}

		if (!images || !images.length) {
			return new NextResponse("Необходимо загрузить изображение", {
				status: 400,
			});
		}

		if (!price) {
			return new NextResponse("Укажите цену", { status: 400 });
		}

		if (!categoryId) {
			return new NextResponse("Необходим идентификатор категории.", {
				status: 400,
			});
		}

		if (!colorId) {
			return new NextResponse("Необходим идентификатор цвета.", {
				status: 400,
			});
		}

		if (!sizeId) {
			return new NextResponse("Необходим идентификатор размера.", {
				status: 400,
			});
		}

		const storeByUserId = await prismadb.store.findFirst({
			where: {
				id: params.storeId,
				userId,
			},
		});

		if (!storeByUserId) {
			return new NextResponse("Не авторизованный доступ", { status: 405 });
		}

		await prismadb.product.update({
			where: {
				id: params.productId,
			},
			data: {
				name,
				price,
				categoryId,
				colorId,
				sizeId,
				images: {
					deleteMany: {},
				},
				isFeatured,
				isArchived,
			},
		});

		const product = await prismadb.product.update({
			where: {
				id: params.productId,
			},
			data: {
				images: {
					createMany: {
						data: [...images.map((image: { url: string }) => image)],
					},
				},
			},
		});

		return NextResponse.json(product);
	} catch (error) {
		console.log("[PRODUCT_PATCH]", error);
		return new NextResponse("Ошибка сервера", { status: 500 });
	}
}
