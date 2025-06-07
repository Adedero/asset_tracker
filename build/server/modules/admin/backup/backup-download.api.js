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
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/database/backups/:filename"
}, (0, handlers_1.defineHandler)(async (req, res) => {
    const { filename } = req.params;
    const backupDir = node_path_1.default.resolve("database/backups");
    const filepath = node_path_1.default.join(backupDir, filename);
    if (!fs_1.default.existsSync(filepath)) {
        throw http_1.HttpException.notFound("Backup not found");
    }
    // Set headers for file download
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    const fileStream = fs_1.default.createReadStream(filepath);
    // Pipe file stream to response
    fileStream.pipe(res);
    // Return a promise that resolves when the streaming finishes
    return new Promise((resolve, reject) => {
        fileStream.on("end", () => resolve());
        fileStream.on("error", (err) => reject(err));
    });
}));
