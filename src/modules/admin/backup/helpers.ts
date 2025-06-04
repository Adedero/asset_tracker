import fs from "fs";
import path from "path";
import env from "#src/utils/env";

export function keepLastNBackups(backupDir: string, maxCount?: number) {
  const count = maxCount || Number(env.get("MAX_DATABASE_BACKUPS", "10"));
  const files = fs
    .readdirSync(backupDir)
    .filter((file) => file.endsWith("backup.db"))
    .sort((a, b) => {
      const aTime = Number(a.split("-")[0]);
      const bTime = Number(b.split("-")[0]);
      return bTime - aTime; // descending
    });

  const oldFiles = files.slice(count); // files to delete
  for (const file of oldFiles) {
    fs.unlinkSync(path.join(backupDir, file));
  }

  return {
    deleted: oldFiles,
    kept: files.slice(0, count)
  };
}

export function restoreBackup(backupFilename: string) {
  const databaseDir = path.resolve("database");
  const backupDir = path.resolve("database/backups");
  const backupPath = path.join(backupDir, backupFilename);
  const destinationPath = path.join(databaseDir, "main.db");

  if (!fs.existsSync(backupPath)) {
    throw new Error("Backup file not found");
  }

  fs.copyFileSync(backupPath, destinationPath);
  return { restoredFrom: backupFilename };
}
