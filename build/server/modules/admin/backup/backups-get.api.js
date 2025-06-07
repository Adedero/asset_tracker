"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const node_path_1 = __importDefault(require("node:path"));
const fs_1 = __importDefault(require("fs"));
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/database/backups"
}, (0, handlers_1.defineHandler)(async () => {
    const backupDir = node_path_1.default.resolve("database/backups");
    if (!fs_1.default.existsSync(backupDir)) {
        fs_1.default.mkdirSync(backupDir, { recursive: true });
    }
    const files = fs_1.default
        .readdirSync(backupDir)
        .filter((file) => file.endsWith("backup.db"))
        .map((file) => {
        // Assuming filename format: "timestamp-backup.db"
        const [createdAtStr] = file.split("-");
        const createdAt = new Date(Number(createdAtStr));
        return {
            filename: file,
            createdAt
        };
    });
    return {
        success: true,
        files
    };
}));
