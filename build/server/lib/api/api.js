import internalOnly from "#src/middleware/internal-only";
export const api = (options, ...handlers) => {
    let { path = "" } = options;
    const { expose = true, method = "get", group = "", middleware = [] } = options;
    if (!path && !group)
        throw new Error("Path or group is required");
    if (path.trim() === "/")
        path = "";
    const allMiddleware = Array.isArray(middleware) ? middleware : [middleware];
    const allHandlers = [];
    if (allMiddleware.length)
        allHandlers.push(...allMiddleware);
    allHandlers.push(...handlers);
    if (!expose) {
        allHandlers.unshift(internalOnly);
    }
    const apiDefinition = {
        options: { path, expose, method, group },
        handlers: allHandlers
    };
    return apiDefinition;
};
