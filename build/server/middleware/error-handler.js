import { HttpException } from "#src/lib/api/http";
import logger from "#src/utils/logger";
export default function errorHandler(err, req, res, next) {
    if (err instanceof HttpException) {
        res.status(err.statusCode).json(err.toJSON());
        return;
    }
    logger.error("Unhandled error:", err);
    /**
     * For production mode only
     * const serverError = HttpException.internal('Something went wrong');
     */
    const serverError = HttpException.internal(err.message);
    res.status(serverError.statusCode).json(serverError.toJSON());
}
