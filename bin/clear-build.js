const fs = require("node:fs");
const path = require("node:path");

function clearBuild() {
  const dir = path.resolve("build");
  if (fs.existsSync(dir)) {
    fs.promises.rm(dir, { recursive: true });
  }
}

clearBuild();
