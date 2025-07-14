const path = require("node:path");
const fs = require("node:fs");

function main() {
  const dir = path.resolve("src/prisma-gen");
  const targetDir = path.resolve("build/server/prisma-gen");

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
}

main();
