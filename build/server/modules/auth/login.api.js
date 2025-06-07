"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const login_schema_1 = __importDefault(require("#src/shared/schemas/login.schema"));
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("#src/utils/env"));
const constants_1 = require("#src/utils/constants");
const check_ban_1 = require("#src/modules/auth/services/check-ban");
exports.default = (0, api_1.api)({
    group: "/auth",
    path: "/login",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", login_schema_1.default)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { email, password } = req.validatedBody;
    const user = await prisma_1.default.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            verified: true,
            role: true,
            password: true,
            ban: true
        }
    });
    const mockHash = "hashed_password";
    const isPasswordValid = await (0, bcrypt_1.compare)(password, user?.password || mockHash);
    if (!user || !isPasswordValid) {
        throw http_1.HttpException.badRequest("Invalid email or password");
    }
    if ((0, check_ban_1.isUserBanned)(user)) {
        throw http_1.HttpException.unauthorized("Your account has been banned. Please contact us if you think there has been a mistake.");
    }
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id }, env_1.default.get("JWT_ACCESS_SECRET", "secret_1"), {
        expiresIn: constants_1.JWT_ACCESS_TOKEN_EXPIRY
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, env_1.default.get("JWT_REFRESH_SECRET", "secret_2"), {
        expiresIn: constants_1.JWT_REFRESH_TOKEN_EXPIRY
    });
    const response = {
        success: true,
        message: "Login successful",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            verified: user.verified,
            role: user.role,
            accessToken,
            refreshToken
        }
    };
    return response;
}));
