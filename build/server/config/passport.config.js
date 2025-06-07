"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const env_1 = __importDefault(require("#src/utils/env"));
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const JWT_ACCESS_SECRET = env_1.default.get("JWT_ACCESS_SECRET", "JWT_ACCESS_SECRET");
const jwtOptions = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_ACCESS_SECRET
};
passport_1.default.use(new passport_jwt_1.Strategy(jwtOptions, async (payload, done) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: payload.id }
        });
        if (!user)
            return done(null, false);
        const authenticatedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            verified: user.verified
        };
        return done(null, authenticatedUser);
    }
    catch (err) {
        return done(err, false);
    }
}));
exports.default = passport_1.default;
