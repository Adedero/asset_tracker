import { PrismaClient } from '#src/prisma-gen/index';
const prismaClientSingleton = () => {
    return new PrismaClient();
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
(async function () {
    await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);
})();
export default prisma;
if (process.env.NODE_ENV !== 'production')
    globalThis.prismaGlobal = prisma;
