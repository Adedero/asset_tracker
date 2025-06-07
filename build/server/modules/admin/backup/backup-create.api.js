"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const node_path_1 = __importDefault(require("node:path"));
const fs_1 = __importDefault(require("fs"));
const http_1 = require("#src/lib/api/http");
const helpers_1 = require("#src/modules/admin/backup/helpers");
const env_1 = __importDefault(require("#src/utils/env"));
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/database/backups",
    method: "post"
}, (0, handlers_1.defineHandler)(async (req) => {
    const databaseDir = node_path_1.default.resolve("database");
    const backupDir = node_path_1.default.resolve("database/backups");
    const sourceFile = node_path_1.default.join(databaseDir, "main.db");
    if (!fs_1.default.existsSync(sourceFile)) {
        throw http_1.HttpException.notFound("Critical error: Database not found");
    }
    if (!fs_1.default.existsSync(backupDir)) {
        fs_1.default.mkdirSync(backupDir, { recursive: true });
    }
    const now = Date.now();
    const newFilename = `${now}-${env_1.default.get("APP_NAME").toLowerCase()}-backup.db`;
    const backupFilePath = node_path_1.default.join(backupDir, newFilename);
    fs_1.default.copyFileSync(sourceFile, backupFilePath);
    (0, helpers_1.keepLastNBackups)(backupDir);
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
