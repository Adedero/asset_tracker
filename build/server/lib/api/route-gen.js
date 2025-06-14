"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoutes = void 0;
const fast_glob_1 = __importDefault(require("fast-glob"));
const express_1 = require("express");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = require("node:fs");
const url_1 = require("url");
const node_module_1 = require("node:module");
async function writeFileIfChanged(filePath, content) {
    try {
        const existing = await node_fs_1.promises.readFile(filePath, "utf8");
        if (existing.trim() !== content.trim()) {
            await node_fs_1.promises.writeFile(filePath, content, "utf8");
        }
    }
    catch {
        await node_fs_1.promises.writeFile(filePath, content, "utf8");
    }
}
const addLeadingSlash = (str) => {
    if (!str)
        return "";
    return str.startsWith("/") ? str : `/${str}`;
};
const isCommonJS = typeof require !== "undefined" && typeof __filename !== "undefined";
const requireIfAvailable = isCommonJS ? (0, node_module_1.createRequire)(__filename) : null;
async function loadModule(entry) {
    if (isCommonJS && requireIfAvailable) {
        return requireIfAvailable(node_path_1.default.resolve(entry));
    }
    else {
        const url = (0, url_1.pathToFileURL)(node_path_1.default.resolve(entry)).href;
        return await Promise.resolve(`${url}`).then(s => __importStar(require(s))); // works in dev (ESM/TS)
    }
}
//const __filename = import.meta.filename;
const generateRoutes = async (expressApp, options = {}) => {
    const router = (0, express_1.Router)();
    const { globalMiddleware = [], groupMiddleware = {}, globalPrefix = "" } = options;
    const allGlobalMiddleware = Array.isArray(globalMiddleware)
        ? globalMiddleware
        : [globalMiddleware];
    for (const mw of allGlobalMiddleware) {
        router.use(mw);
    }
    let entries = [];
    if (__filename.endsWith("ts")) {
        entries = await (0, fast_glob_1.default)("src/modules/**/*.api.{ts,js}");
    }
    else {
        entries = await (0, fast_glob_1.default)("build/server/modules/**/*.api.js");
    }
    if (entries.length === 0) {
        if (process.env.NODE_ENV === "development") {
            console.warn("[⚠️ Warning] No API files found. Skipping route generation.");
        }
        return expressApp;
    }
    const groupedApis = {};
    const ungroupedApis = [];
    const allGroups = new Set();
    const apis = [];
    for (const entry of entries) {
        const module = (await loadModule(entry));
        for (const key of Object.keys(module)) {
            const api = module[key];
            if (!api || api.options === undefined || api.handlers === undefined) {
                continue;
            }
            api.options.path = addLeadingSlash(api.options.path);
            apis.push({ api, file: entry });
            if (api.options.group) {
                const group = addLeadingSlash(api.options.group);
                allGroups.add(group);
                groupedApis[group] = groupedApis[group] || [];
                groupedApis[group].push(api);
            }
            else {
                ungroupedApis.push(api);
            }
        }
    }
    const groupList = Array.from(allGroups)
        .map((g) => `"${g}"`)
        .join(" | ") || "never";
    const routesList = [
        ...Object.entries(groupedApis).flatMap(([group, apis]) => apis.map((api) => ({
            group,
            path: `${group}${api.options.path}`,
            method: api.options.method
        }))),
        ...ungroupedApis.map((api) => ({
            group: null,
            path: api.options.path,
            method: api.options.method
        }))
    ];
    const routesArrayString = JSON.stringify(routesList, null, 2);
    const output = __filename.endsWith("ts")
        ? `// Auto-generated by generateRoutes
export type RouteGroups = ${groupList};

//Number of routes = ${routesList.length}
export const routes = ${routesArrayString} as const;
`
        : `{
  "count": ${routesList.length},
  "routes": ${routesArrayString}
}`;
    const outPath = __filename.endsWith("ts")
        ? node_path_1.default.resolve("src/lib/api/generated.ts")
        : node_path_1.default.resolve("routes.json");
    await writeFileIfChanged(outPath, output);
    const seenPaths = new Map();
    for (const route of routesList) {
        const fullPath = `${route.method.toUpperCase()}-${route.path}`;
        if (seenPaths.has(fullPath)) {
            console.warn(`[⚠️ Warning] Duplicate API path detected: ${fullPath}`);
        }
        else {
            seenPaths.set(fullPath, route.method);
        }
    }
    const useApi = (api, basePath = "") => {
        const method = api.options.method;
        const fullPath = `${addLeadingSlash(basePath)}${api.options.path}`;
        const handlers = [];
        handlers.push(...api.handlers);
        // @ts-expect-error (dynamic method name)
        router[method](fullPath, ...handlers);
    };
    for (const api of ungroupedApis) {
        useApi(api, globalPrefix);
    }
    for (const [group, apis] of Object.entries(groupedApis)) {
        let middleware = [];
        //@ts-expect-error (dynamic access)
        if (Array.isArray(groupMiddleware[group])) {
            //@ts-expect-error (dynamic access)
            middleware = groupMiddleware[group];
            //@ts-expect-error (dynamic access)
        }
        else if (groupMiddleware[group]) {
            //@ts-expect-error (dynamic access)
            middleware = [groupMiddleware[group]];
        }
        else {
            middleware = [];
        }
        for (const api of apis) {
            const method = api.options.method;
            const fullPath = `${addLeadingSlash(globalPrefix)}${group}${api.options.path}`;
            const handlers = [...middleware, ...api.handlers];
            // @ts-expect-error (dynamic method name)
            router[method](fullPath, ...handlers);
        }
    }
    expressApp.use(router);
    //console.log(listRoutes(router));
    return expressApp;
};
exports.generateRoutes = generateRoutes;
/* function listRoutes(router: Router) {
  const routes: { method: string, path: string }[] = [];

  router.stack.forEach((layer) => {
    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods);
      methods.forEach((method) => {
        routes.push({ method: method.toUpperCase(), path });
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      // If it's a nested router
      layer.handle.stack.forEach((nestedLayer) => {
        if (nestedLayer.route) {
          const path = nestedLayer.route.path;
          const methods = Object.keys(nestedLayer.route.methods);
          methods.forEach((method) => {
            routes.push({ method: method.toUpperCase(), path });
          });
        }
      });
    }
  });

  return routes;
} */
