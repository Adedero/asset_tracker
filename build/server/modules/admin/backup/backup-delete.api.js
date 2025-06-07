"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const http_1 = require("#src/lib/api/http");
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/database/backups/:filename",
    method: "delete"
}, (0, handlers_1.defineHandler)(async (req) => {
    const { filename } = req.params;
    const backupDir = path_1.default.resolve("database/backups");
    if (!fs_1.default.existsSync(backupDir)) {
        throw http_1.HttpException.notFound("No backups have been created");
    }
    fs_1.default.unlinkSync(path_1.default.join(backupDir, filename));
    return {
        success: true,
        message: "Backup deleted"
    };
}));
