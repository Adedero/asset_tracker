import passport from "passport";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import env from "#src/utils/env";
import prisma from "#src/lib/prisma/prisma";
import type { AuthUser } from "#src/types/user";

const JWT_ACCESS_SECRET = env.get("JWT_ACCESS_SECRET", "JWT_ACCESS_SECRET");

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_ACCESS_SECRET
};

export interface JWTPayload {
  id: string;
}

passport.use(
  new Strategy(jwtOptions, async (payload: JWTPayload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id }
      });

      if (!user) return done(null, false);

      const authenticatedUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified
      };
      return done(null, authenticatedUser);
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;
