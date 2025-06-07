import dotenv from "dotenv";
dotenv.config();
export class Env {
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
const env = new Env();
export default env;
