"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class Env {
    constructor() { }
    get(key, defaultValue) {
        const value = process.env[key];
        if (value === undefined && defaultValue !== undefined) {
            return defaultValue;
        }
        if (value === undefined) {
            throw new Error(`Missing environment variable: ${key}`);
        }
        return value;
    }
    set(key, value) {
        process.env[key] = value;
    }
    has(key) {
        return Object.prototype.hasOwnProperty.call(process.env, key);
    }
}
exports.Env = Env;
const env = new Env();
exports.default = env;
