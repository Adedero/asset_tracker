import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import path from "node:path";
import fs from "fs";
import { HttpException } from "#src/lib/api/http";
import { keepLastNBackups } from "#src/modules/admin/backup/helpers";
import env from "#src/utils/env";
export default api({
    group: "/admins/me",
    path: "/database/backups",
    method: "post"
}, defineHandler(async (req) => {
    const databaseDir = path.resolve("database");
    const backupDir = path.resolve("database/backups");
    const sourceFile = path.join(databaseDir, "main.db");
    if (!fs.existsSync(sourceFile)) {
        throw HttpException.notFound("Critical error: Database not found");
    }
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    const now = Date.now();
    const newFilename = `${now}-${env.get("APP_NAME").toLowerCase()}-backup.db`;
    const backupFilePath = path.join(backupDir, newFilename);
    fs.copyFileSync(sourceFile, backupFilePath);
    keepLastNBackups(backupDir);
    return {
        statusCode: 201,
        success: true,
        message: "Backup created",
        file: {
            filename: newFilename,
            createdAt: new Date(now)
        }
    };
}));
