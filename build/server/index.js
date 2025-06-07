import http from "node:http";
import express from "express";
import env from "#src/utils/env";
import logger from "#src/utils/logger";
import compression from "compression";
import helmet from "helmet";
import path from "node:path";
import sirv from "sirv";
import { generateRoutes } from "#src/lib/api/route-gen";
import errorHandler from "#src/middleware/error-handler";
import auth from "#src/middleware/auth";
import parseRequestQuery from "#src/middleware/parse-request-query";
import { profitDistributionJob } from "#src/cron/profit-distribution.cron";
const PORT = env.get("PORT", 8000);
const app = express();
const server = http.createServer(app);
const isProduction = env.get("NODE_ENV") === "production";
async function main() {
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use(compression());
    app.use(express.static("public"));
    profitDistributionJob.start();
    await generateRoutes(app, {
        globalPrefix: "/api",
        globalMiddleware: parseRequestQuery,
        groupMiddleware: {
            "/admins/me": auth("ADMIN"),
            "/users/me": auth("USER")
        }
    });
    if (!isProduction) {
        const { createServer } = await import("vite");
        const viteServer = await createServer({
            configFile: path.resolve("vite.config.ts"),
            server: { middlewareMode: true },
            root: path.resolve("src/app/"),
            base: "/",
            forceOptimizeDeps: true
        });
        await viteServer.restart(true);
        app.use(viteServer.middlewares);
    }
    else {
        app.use(helmet());
        app.use("/", sirv("build/client", { single: true }));
    }
    app.get("/api/{*all}", (req, res) => {
        res.status(404).json({ success: false, message: "not found" });
    });
    app.get("/{*all}", (req, res) => {
        const HTML_PATH = isProduction ? "build/client/index.html" : "src/app/index.html";
        res.sendFile(path.resolve(HTML_PATH));
    });
    app.use(errorHandler);
    server.listen(PORT, () => {
        if (isProduction) {
            logger.info(`Server running on port ${PORT}`);
        }
        else {
            logger.info(`Server running on http://localhost:${PORT}`);
        }
    });
    server.on("error", (error) => {
        logger.error("Server error", error);
        process.exit(1);
    });
    process.on("SIGINT", () => {
        server.close(() => {
            logger.info("Server closed.");
            process.exit(0);
        });
    });
}
main();
