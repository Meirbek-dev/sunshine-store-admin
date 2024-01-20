import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function POST(
	req: Request,
	{ params }: { params: { storeId: string } },
) {
	try {
		const { userId } = auth();

		const body = await req.json();

		const { label, imageUrl } = body;

		if (!userId) {
			return new NextResponse("Пользователь не аутентифицирован", {
				status: 403,
			});
		}

		if (!label) {
			return new NextResponse("Укажите метку", { status: 400 });
		}

		if (!imageUrl) {
			return new NextResponse("Необходимо URL изображения", { status: 400 });
		}

		if (!params.storeId) {
			return new NextResponse("Необходим идентификатор магазина.", {
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

		const billboard = await prismadb.billboard.create({
			data: {
				label,
				imageUrl,
				storeId: params.storeId,
			},
		});

		return NextResponse.json(billboard);
	} catch (error) {
		console.log("[BILLBOARDS_POST]", error);
		return new NextResponse("Ошибка сервера", { status: 500 });
	}
}

export async function GET(
	req: Request,
	{ params }: { params: { storeId: string } },
) {
	try {
		if (!params.storeId) {
			return new NextResponse("Необходим идентификатор магазина.", {
				status: 400,
			});
		}

		const billboards = await prismadb.billboard.findMany({
			where: {
				storeId: params.storeId,
			},
		});

		return NextResponse.json(billboards);
	} catch (error) {
		console.log("[BILLBOARDS_GET]", error);
		return new NextResponse("Ошибка сервера", { status: 500 });
	}
}
