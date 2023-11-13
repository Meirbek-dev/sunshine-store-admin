import {NextResponse} from "next/server";
import {auth} from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";


export async function PATCH(req: Request, {params}: { params: { storeId: string; }; }) {
    try {
        const {userId} = auth();
        const body = await req.json();

        const {name} = body;

        if (!userId) {
            return new NextResponse("Пользователь не аутентифицирован", {status: 403});
        }

        if (!name) {
            return new NextResponse("Необходимо ввести имя", {status: 400});
        }

        if (!params.storeId) {
            return new NextResponse("Необходимо ввести имя ID магазина", {status: 400});
        }

        const store = await prismadb.store.updateMany({
            where: {
                id: params.storeId, userId,
            }, data: {
                name
            }
        });

        return NextResponse.json(store);
    } catch (error) {
        console.log('[STORE_PATCH]', error);
        return new NextResponse("Ошибка сервера", {status: 500});
    }
};


export async function DELETE(req: Request, {params}: { params: { storeId: string; }; }) {
    try {
        const {userId} = auth();

        if (!userId) {
            return new NextResponse("Пользователь не аутентифицирован", {status: 403});
        }

        if (!params.storeId) {
            return new NextResponse("Необходим идентификатор магазина.", {status: 400});
        }

        const store = await prismadb.store.deleteMany({
            where: {
                id: params.storeId, userId
            }
        });

        return NextResponse.json(store);
    } catch (error) {
        console.log('[STORE_DELETE]', error);
        return new NextResponse("Ошибка сервера", {status: 500});
    }
};
