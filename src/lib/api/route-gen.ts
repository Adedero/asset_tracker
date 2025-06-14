import { default as fg } from "fast-glob";
import { Express, RequestHandler, Router } from "express";
import path from "node:path";
import { promises as fs } from "node:fs";
import type { ApiDefinition, ApiRequestHandler } from "./api";
import type { RouteGroups } from "./generated";
import { pathToFileURL } from "url";
import { createRequire } from "node:module";

export interface GenerateRoutesOptions {
  globalMiddleware?: RequestHandler | RequestHandler[];
  groupMiddleware?: Partial<
    Record<RouteGroups, RequestHandler | ApiRequestHandler | ApiRequestHandler[]>
  >;
  globalPrefix?: string;
}

interface InternalApiInfo {
  api: ApiDefinition;
  file: string;
}

async function writeFileIfChanged(filePath: string, content: string) {
  try {
    const existing = await fs.readFile(filePath, "utf8");
    if (existing.trim() !== content.trim()) {
      await fs.writeFile(filePath, content, "utf8");
    }
  } catch {
    await fs.writeFile(filePath, content, "utf8");
  }
}

const addLeadingSlash = (str: string | undefined) => {
  if (!str) return "";
  return str.startsWith("/") ? str : `/${str}`;
};

const isCommonJS = typeof require !== "undefined" && typeof __filename !== "undefined";

const requireIfAvailable = isCommonJS ? createRequire(__filename) : null;

async function loadModule(entry: string) {
  if (isCommonJS && requireIfAvailable) {
    return requireIfAvailable(path.resolve(entry));
  } else {
    const url = pathToFileURL(path.resolve(entry)).href;
    return await import(url); // works in dev (ESM/TS)
  }
}

//const __filename = import.meta.filename;

export const generateRoutes = async (expressApp: Express, options: GenerateRoutesOptions = {}) => {
  const router: Router = Router();

  const { globalMiddleware = [], groupMiddleware = {}, globalPrefix = "" } = options;

  const allGlobalMiddleware = Array.isArray(globalMiddleware)
    ? globalMiddleware
    : [globalMiddleware];

  for (const mw of allGlobalMiddleware) {
    router.use(mw);
  }

  let entries: string[] = [];

  if (__filename.endsWith("ts")) {
    entries = await fg("src/modules/**/*.api.{ts,js}");
  } else {
    entries = await fg("build/server/modules/**/*.api.js");
  }

  if (entries.length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[⚠️ Warning] No API files found. Skipping route generation.");
    }
    return expressApp;
  }

  const groupedApis: Record<string, ApiDefinition[]> = {};
  const ungroupedApis: ApiDefinition[] = [];
  const allGroups = new Set<string>();

  const apis: InternalApiInfo[] = [];

  for (const entry of entries) {
    const module = (await loadModule(entry)) as Record<string, ApiDefinition>;

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
      } else {
        ungroupedApis.push(api);
      }
    }
  }

  const groupList =
    Array.from(allGroups)
      .map((g) => `"${g}"`)
      .join(" | ") || "never";

  const routesList = [
    ...Object.entries(groupedApis).flatMap(([group, apis]) =>
      apis.map((api) => ({
        group,
        path: `${group}${api.options.path}`,
        method: api.options.method
      }))
    ),
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
    ? path.resolve("src/lib/api/generated.ts")
    : path.resolve("routes.json");
  await writeFileIfChanged(outPath, output);

  const seenPaths = new Map<string, string>();
  for (const route of routesList) {
    const fullPath = `${route.method!.toUpperCase()}-${route.path}`;
    if (seenPaths.has(fullPath)) {
      console.warn(`[⚠️ Warning] Duplicate API path detected: ${fullPath}`);
    } else {
      seenPaths.set(fullPath, route.method!);
    }
  }

  const useApi = (api: ApiDefinition, basePath = "") => {
    const method = api.options.method;
    const fullPath = `${addLeadingSlash(basePath)}${api.options.path}`;
    const handlers: ApiRequestHandler[] = [];
    handlers.push(...api.handlers);
    // @ts-expect-error (dynamic method name)
    router[method](fullPath, ...handlers);
  };

  for (const api of ungroupedApis) {
    useApi(api, globalPrefix);
  }

  for (const [group, apis] of Object.entries(groupedApis)) {
    let middleware: ApiRequestHandler[] = [];
    //@ts-expect-error (dynamic access)
    if (Array.isArray(groupMiddleware[group])) {
      //@ts-expect-error (dynamic access)
      middleware = groupMiddleware[group];
      //@ts-expect-error (dynamic access)
    } else if (groupMiddleware[group]) {
      //@ts-expect-error (dynamic access)
      middleware = [groupMiddleware[group]];
    } else {
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
