import {PrismaClient} from "@prisma/client";

declare global {
    let prisma: PrismaClient | undefined;
}
// @ts-ignore
const prismadb = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
    // @ts-ignore
    globalThis.prisma = prismadb;
}

export default prismadb;
