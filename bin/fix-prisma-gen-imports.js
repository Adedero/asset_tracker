import fs from "node:fs";
import path from "node:path";

function isFileImportable(p) {
  try {
    const stat = fs.statSync(p);
    return stat.isFile();
  } catch {
    return false;
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  const updatedLines = content.split("\n").map((line) => {
    const importExportRegex = /^(import|export)\s.+\sfrom\s+(['"])(.+?)\2/;
    const match = line.match(importExportRegex);

    if (match) {
      //const quote = match[1];
      const importPath = match[3];

      if (importPath.startsWith("./") && !importPath.endsWith(".js") && !importPath.endsWith("/")) {
        const fullImportPath = path.resolve(path.dirname(filePath), importPath);

        if (isFileImportable(`${fullImportPath}.ts`) || isFileImportable(`${fullImportPath}.js`)) {
          const newPath = `${importPath}.js`;
          return line.replace(importPath, newPath);
        }
      }
    }

    return line;
  });

  fs.writeFileSync(filePath, updatedLines.join("\n"), "utf-8");
  console.log(`✔ Patched ${path.relative(process.cwd(), filePath)}`);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && fullPath.endsWith(".ts")) {
      processFile(fullPath);
    }
  }
}

function main() {
  console.log("🔶 Fixing prisma generated files imports.");
  const baseDir = path.resolve("src/prisma-gen");
  walk(baseDir);
}

main();
