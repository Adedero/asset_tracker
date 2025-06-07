const fs = require("node:fs");
const path = require("node:path");
const pluralize = require("pluralize")

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: npm run generate:routes <module> <model-name>");
    process.exit(1);
  }
  const moduleName = args[0]
  const modelName = args[1];
  generateRoutes(moduleName, modelName);
}

/**
 * @param {string} moduleName
 * @param {string} modelName
 */
function generateRoutes(moduleName, modelName) {
  const names = {
    kebabName: toKebabCase(modelName),
    kebabNamePlural: pluralize(toKebabCase(modelName)),
    camelName: toCamelCase(modelName),
    camelNamePlural: pluralize(toCamelCase(modelName)),
    pascalName: toPascalCase(modelName),
    pascalNamePlural: pluralize(toPascalCase(modelName)),
    snakeName: toKebabCase(modelName).replace("-", "_")
  };

  const dir = path.resolve(`src/modules/${moduleName}/${names.kebabNamePlural}`)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const schemas = fs.readFileSync(path.resolve("prisma/schema.prisma"), { encoding: "utf-8" });
  const modelRegex = new RegExp(`model\\s+${names.pascalName}\\s*{[\\s\\S]*?^}`, "m");
  const modelMatch = schemas.match(modelRegex);
  let modelBlock = [];
  if (modelMatch) {
    modelBlock = modelMatch[0].split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        return (
          !!trimmed &&
          !trimmed.startsWith("model") &&
          !trimmed.startsWith("//") &&
          !trimmed.startsWith("}") &&
          !trimmed.startsWith("@@") &&
          !trimmed.includes("@relation") &&
          !trimmed.startsWith("createdAt") &&
          !trimmed.startsWith("updatedAt")
        );
      })
      .map((line) => {
        return line
          .trim()
          .split(" ")
          .filter((l) => l !== "")
      })
      .filter((line) => !line[1].endsWith("[]"));
  } else {
    console.warn(`Model ${names.pascalName} not found in schema.prisma`);
    return;
  }

  const actions = ["get", "put", "post", "delete"];
  for (const action of actions) {
    const filename = `${names.kebabNamePlural}-${action}.api.ts`;
    const filepath = path.resolve(dir, filename);
    if (fs.existsSync(filepath)) {
      console.warn(`File ${filename} already exists. Skipping`)
      continue;
    }

    let data = "";

    if (action === "get") {
      data = generateGet(names, moduleName)
    }
    if (action === "put") {
      data = generatePost(names, moduleName, modelBlock, schemas)
    }
    if (action === "post") {
      //
    }
    if (action === "delete") {
      data = generateDelete(names, moduleName);
    }

    if (!data) {
      console.warn(`Could not generate data for roue: ${action.toUpperCase()}`)
    }

    fs.writeFileSync(filepath, data);
  }
}

/**
 *
 * @returns {string}
 */
function generateGet(names, moduleName) {
  const data = `
import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { ${names.pascalName} } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";

export interface ${names.pascalNamePlural}GetApiResponse extends ApiResponse {
  ${names.camelNamePlural}: ${names.pascalName}[];
}

export interface ${names.pascalName}GetApiResponse extends ApiResponse {
  ${names.camelName}: ${names.pascalName};
}

export default api(
  {
    group: "/${moduleName}/me",
    path: "/${names.kebabNamePlural}{/:${names.snakeName}_id}",
  },
  defineHandler(async (req) => {
    const { ${names.snakeName}_id } = req.params;

    const parsedQuery: ParsedQuery<${names.pascalName}> | undefined = req.parsedQuery;

    if (${names.snakeName}_id) {
      const ${names.camelName} = await prisma.${names.camelName}.findUnique({
        where: { id: ${names.snakeName}_id },
      });

      if (!${names.camelName}) {
        throw HttpException.notFound("${names.pascalName} not found");
      }

      const payload: ${names.pascalName}GetApiResponse = {
        success: true,
        message: "Successful",
        ${names.camelName}
      };

      return payload;
    }

    const ${names.camelNamePlural} = await prisma.${names.camelName}.findMany({
      //@ts-ignore
      where: { ...(parsedQuery?.where || {}) },
      /*  //@ts-ignore
      select: {
        ...(parsedQuery?.select || {}),
        ...(parsedQuery?.populate || {}),
        ...(parsedQuery?.exclude || {})
      }, */
      orderBy: parsedQuery?.sort,
      take: parsedQuery?.take,
      skip: parsedQuery?.skip
    });

    const payload: ${names.pascalNamePlural}GetApiResponse = {
      success: true,
      message: "Successful",
      ${names.camelNamePlural}
    };

    return payload;
  })
)
`;

  return data;
}

/**
 * @param {object} names
 * @param {string} moduleName
 * @param {Array<Array<string>>} modelBlock
 * @param {string} Schema
 * @returns {string}
 */
function generatePost(names, moduleName, modelBlock, Schema) {
  return "";
  const data = `
import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { ${names.pascalName} } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";

export interface ${names.pascalNamePlural}GetApiResponse extends ApiResponse {
  ${names.camelNamePlural}: ${names.pascalName}[];
}

export interface ${names.pascalName}GetApiResponse extends ApiResponse {
  ${names.camelName}: ${names.pascalName};
}

export default api(
  {
    group: "/${moduleName}/me",
    path: "/${names.kebabNamePlural}{/:${names.snakeName}_id}",
  },
  defineHandler(async (req) => {
    const { ${names.snakeName}_id } = req.params;

    const parsedQuery: ParsedQuery<${names.pascalName}> | undefined = req.parsedQuery;

    if (${names.snakeName}_id) {
      const ${names.camelName} = await prisma.${names.camelName}.findUnique({
        where: { id: ${names.snakeName}_id },
      });

      if (!${names.camelName}) {
        throw HttpException.notFound("${names.pascalName} not found");
      }

      const payload: ${names.pascalName}GetApiResponse = {
        success: true,
        message: "Successful",
        ${names.camelName}
      };

      return payload;
    }

    const ${names.camelNamePlural} = await prisma.${names.camelName}.findMany({
      //@ts-ignore
      where: { ...(parsedQuery?.where || {}) },
      /*  //@ts-ignore
      select: {
        ...(parsedQuery?.select || {}),
        ...(parsedQuery?.populate || {}),
        ...(parsedQuery?.exclude || {})
      }, */
      orderBy: parsedQuery?.sort,
      take: parsedQuery?.take,
      skip: parsedQuery?.skip
    });

    const payload: ${names.pascalNamePlural}GetApiResponse = {
      success: true,
      message: "Successful",
      ${names.camelNamePlural}
    };

    return payload;
  })
)
`;

  return data;
}


/**
 *
 * @returns {string}
 */
function generateDelete(names, moduleName) {
  const data = `
import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { ${names.pascalName} } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";
import { HttpException } from "#src/lib/api/http";

export interface ${names.pascalName}DeleteApiResponse extends ApiResponse {
  ${names.camelName}: ${names.pascalName};
}

export default api(
  {
    group: "/${moduleName}/me",
    path: "/${names.kebabNamePlural}{/:${names.snakeName}_id}",
    method: "delete"
  },
  defineHandler(async (req) => {
    const { ${names.snakeName}_id } = req.params;

    const ${names.camelName} = await prisma.${names.camelName}.delete({
      where: { id: ${names.snakeName}_id },
    });

    if (!${names.camelName}) {
      throw HttpException.notFound("${names.pascalName} not found");
    }

    const payload: ${names.pascalName}DeleteApiResponse = {
      success: true,
      message: "${names.pascalName} deleted successfully,"
      ${names.camelName}
    };

    return payload;
  })
)
`;

  return data;
}


/**
 *
 * @param {string} name
 * @returns {string}
 */
function toKebabCase(name) {
  return name
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

/**
 *
 * @param {string} name
 * @returns {string}
 */
function toPascalCase(name) {
  return toKebabCase(name)
    .split("-")
    .map((word) => word.toLowerCase())
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 *
 * @param {string} name
 * @returns {string}
 */
function toCamelCase(name) {
  const pascalName = toPascalCase(name);
  return pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
}

main();
