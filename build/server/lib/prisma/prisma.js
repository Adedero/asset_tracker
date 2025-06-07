"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("#src/prisma-gen/index");
const prismaClientSingleton = () => {
    return new index_1.PrismaClient();
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
(async function () {
    await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);
})();
exports.default = prisma;
if (process.env.NODE_ENV !== 'production')
    globalThis.prismaGlobal = prisma;
