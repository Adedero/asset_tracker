import path from "path";
import fs from "fs";
import winston from "winston";
import "winston-daily-rotate-file";
class Logger {
    static instance;
    logger;
    logsDir = path.resolve("logs");
    customColors = {
        error: "red",
        warn: "yellow",
        info: "blue",
        debug: "green"
    };
    constructor() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
        winston.addColors(this.customColors);
        this.logger = winston.createLogger({
            level: "info",
            format: winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston.format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level.toUpperCase()}]: ${message}`;
            })),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston.format.printf(({ timestamp, level, message }) => {
                        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
                    }), winston.format.colorize({ all: true }))
                }),
                process.env.NODE_ENV === "production" &&
                    new winston.transports.DailyRotateFile({
                        filename: path.join(this.logsDir, "site-%DATE%.log"),
                        datePattern: "YYYY-MM-DD",
                        zippedArchive: true,
                        maxSize: 20 * 1024 * 1024,
                        maxFiles: 14,
                        level: "info"
                    })
            ].filter(Boolean)
        });
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    info(message) {
        this.logger.info(message);
    }
    error(message, error) {
        if (error) {
            if (error instanceof Error) {
                this.logger.error(`${message}\nError: ${error.message}\nStack Trace: ${error.stack}`);
                return;
            }
            this.logger.error(`${message}\nError: ${error.toString()}`);
        }
        else {
            this.logger.error(message);
        }
    }
    warn(message) {
        this.logger.warn(message);
    }
    debug(message) {
        this.logger.debug(message);
    }
}
const logger = Logger.getInstance();
export default logger;
