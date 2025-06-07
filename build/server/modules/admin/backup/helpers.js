"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepLastNBackups = keepLastNBackups;
exports.restoreBackup = restoreBackup;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = __importDefault(require("#src/utils/env"));
function keepLastNBackups(backupDir, maxCount) {
    const count = maxCount || Number(env_1.default.get("MAX_DATABASE_BACKUPS", "10"));
    const files = fs_1.default
        .readdirSync(backupDir)
        .filter((file) => file.endsWith("backup.db"))
        .sort((a, b) => {
        const aTime = Number(a.split("-")[0]);
        const bTime = Number(b.split("-")[0]);
        return bTime - aTime; // descending
    });
    const oldFiles = files.slice(count); // files to delete
    for (const file of oldFiles) {
        fs_1.default.unlinkSync(path_1.default.join(backupDir, file));
    }
    return {
        deleted: oldFiles,
        kept: files.slice(0, count)
    };
}
function restoreBackup(backupFilename) {
    const databaseDir = path_1.default.resolve("database");
    const backupDir = path_1.default.resolve("database/backups");
    const backupPath = path_1.default.join(backupDir, backupFilename);
    const destinationPath = path_1.default.join(databaseDir, "main.db");
    if (!fs_1.default.existsSync(backupPath)) {
        throw new Error("Backup file not found");
    }
    fs_1.default.copyFileSync(backupPath, destinationPath);
    return { restoredFrom: backupFilename };
}
