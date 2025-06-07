import passport from "#src/config/passport.config";
export default function auth(role, strict = true) {
    return (req, res, next) => {
        passport.authenticate("jwt", (err, user) => {
            if (err) {
                res.status(401).json({
                    success: false,
                    message: `Authentication failed: ${err.message}`
                });
                return;
            }
            if (!user) {
                res.status(401).json({ success: false, message: "Unauthorized. Please, log in" });
                return;
            }
            if (strict && user.role !== role) {
                res.status(403).json({
                    success: false,
                    message: "You do not have permission to access this resource"
                });
                return;
            }
            req.user = user;
            next();
        })(req, res, next);
    };
}
