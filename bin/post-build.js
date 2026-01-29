const path = require("node:path");
const fs = require("node:fs");

function main() {
  const dir = path.resolve("src/prisma-gen");
  const targetDir = path.resolve("prisma");

  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (file.endsWith(".node")) {
      const targetPath = path.join(targetDir, file);
      fs.copyFileSync(path.join(dir, file), targetPath);
      console.log(`Copied ${file} to ${targetPath}`);
    }
  }
  
  // Prisma shit
  const prismaLibDir = path.resolve("build/server/lib/prisma");
  if (!fs.existsSync(prismaLibDir)) {
    fs.mkdirSync(prismaLibDir);
  }
  
  // create a prisma.js file in thei directory  
  const contents = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("#src/prisma-gen/index");
const prismaClientSingleton = () => {
    return new index_1.PrismaClient();
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
(async () => {
    await prisma.$executeRawUnsafe(\`PRAGMA foreign_keys = ON;\`);
})();
exports.default = prisma;
if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = prisma;
}
`
  const prismaJsPath = path.join(prismaLibDir, "prisma.js");
  fs.writeFileSync(prismaJsPath, contents);
}

main();
