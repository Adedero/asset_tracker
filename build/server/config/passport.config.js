import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import env from "#src/utils/env";
import prisma from "#src/lib/prisma/prisma";
const JWT_ACCESS_SECRET = env.get("JWT_ACCESS_SECRET", "JWT_ACCESS_SECRET");
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_ACCESS_SECRET
};
passport.use(new Strategy(jwtOptions, async (payload, done) => {
    try {
        const user = await prisma.user.findUnique({
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
export default passport;
