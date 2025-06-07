"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const express_1 = __importDefault(require("express"));
const env_1 = __importDefault(require("#src/utils/env"));
const logger_1 = __importDefault(require("#src/utils/logger"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const node_path_1 = __importDefault(require("node:path"));
const sirv_1 = __importDefault(require("sirv"));
const route_gen_1 = require("#src/lib/api/route-gen");
const error_handler_1 = __importDefault(require("#src/middleware/error-handler"));
const auth_1 = __importDefault(require("#src/middleware/auth"));
const parse_request_query_1 = __importDefault(require("#src/middleware/parse-request-query"));
const profit_distribution_cron_1 = require("#src/cron/profit-distribution.cron");
const PORT = env_1.default.get("PORT", 8000);
const app = (0, express_1.default)();
const server = node_http_1.default.createServer(app);
const isProduction = env_1.default.get("NODE_ENV") === "production";
async function main() {
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, compression_1.default)());
    app.use(express_1.default.static("public"));
    profit_distribution_cron_1.profitDistributionJob.start();
    await (0, route_gen_1.generateRoutes)(app, {
        globalPrefix: "/api",
        globalMiddleware: parse_request_query_1.default,
        groupMiddleware: {
            "/admins/me": (0, auth_1.default)("ADMIN"),
            "/users/me": (0, auth_1.default)("USER")
        }
    });
    if (!isProduction) {
        const { createServer } = await Promise.resolve().then(() => __importStar(require("vite")));
        const viteServer = await createServer({
            configFile: node_path_1.default.resolve("vite.config.mts"),
            server: { middlewareMode: true },
            root: node_path_1.default.resolve("src/app/"),
            base: "/",
            forceOptimizeDeps: true
        });
        await viteServer.restart(true);
        app.use(viteServer.middlewares);
    }
    else {
        app.use((0, helmet_1.default)());
        app.use("/", (0, sirv_1.default)("build/client", { single: true }));
    }
    app.get("/api/{*all}", (req, res) => {
        res.status(404).json({ success: false, message: "not found" });
    });
    app.get("/{*all}", (req, res) => {
        const HTML_PATH = isProduction ? "build/client/index.html" : "src/app/index.html";
        res.sendFile(node_path_1.default.resolve(HTML_PATH));
    });
    app.use(error_handler_1.default);
    server.listen(PORT, () => {
        if (isProduction) {
            logger_1.default.info(`Server running on port ${PORT}`);
        }
        else {
            logger_1.default.info(`Server running on http://localhost:${PORT}`);
        }
    });
    server.on("error", (error) => {
        logger_1.default.error("Server error", error);
        process.exit(1);
    });
    process.on("SIGINT", () => {
        server.close(() => {
            logger_1.default.info("Server closed.");
            process.exit(0);
        });
    });
}
main();
