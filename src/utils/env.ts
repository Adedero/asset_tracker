import dotenv from "dotenv";

dotenv.config();

export class Env {
  constructor() {}

  get<T = string>(key: keyof NodeJS.ProcessEnv, defaultValue?: T): T {
    const value = process.env[key];
    if (value === undefined && defaultValue !== undefined) {
      return defaultValue;
    }
    if (value === undefined) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value as T;
  }

  set(key: keyof NodeJS.ProcessEnv, value: string): void {
    process.env[key] = value;
  }

  has(key: keyof NodeJS.ProcessEnv): boolean {
    return Object.prototype.hasOwnProperty.call(process.env, key);
  }
}

const env = new Env();
export default env;
