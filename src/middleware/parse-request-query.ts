import { GET_REQUEST_DATA_LIMIT } from "#src/utils/constants";
import type { NextFunction, Request, Response } from "express";

export interface ParsedQuery<T extends Record<string, unknown> = Record<string, unknown>> {
  sort?: Partial<Record<keyof T, "desc" | "asc">>;
  select?: Partial<Record<keyof T, boolean>>;
  exclude?: Partial<Record<keyof T, boolean>>;
  populate?: Partial<Record<keyof T, boolean | { select: Record<string, boolean> }>>;
  where?: Partial<T>;
  take?: number;
  skip?: number;
}

export default function parseRequestQuery<T extends Record<string, unknown>>(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { where, sort, select, exclude, populate, skip, take } = req.query;

  const parsedQuery: ParsedQuery<T> = {};

  if (where) {
    const filters: Partial<T> = {};
    const conditions = Array.isArray(where) ? where : [where];

    conditions.forEach((condition) => {
      const [key, value] = condition.toString().split(",");
      if (key && value !== undefined) {
        const trimmedValue = value.trim();

        let parsedValue: unknown;
        if (trimmedValue === "false" || trimmedValue === "true") {
          parsedValue = trimmedValue === "true";
        } else if (!isNaN(Number(trimmedValue))) {
          parsedValue = Number(trimmedValue);
        } else {
          parsedValue = trimmedValue;
        }

        filters[key as keyof T] = parsedValue as T[keyof T];
      }
    });

    parsedQuery.where = filters;
  }

  if (sort) {
    let sortObj: ParsedQuery<T>["sort"] = {};
    const sortParams = Array.isArray(sort) ? sort : [sort];

    sortParams.forEach((sortItem) => {
      const parts = sortItem.toString().split(",");
      const field = parts[0]?.trim();
      const order = parts[1]?.trim().toLowerCase();
      if (field && (order === "asc" || order === "desc")) {
        (sortObj as Record<string, any>)[field] = order;
      }
    });

    parsedQuery.sort = sortObj;
  }

  if (select) {
    const selectParams = Array.isArray(select) ? select.join(",") : select.toString();
    parsedQuery.select = selectParams
      .split(",")
      .reduce<Partial<Record<keyof T, boolean>>>((acc, s) => {
        acc[s.trim() as keyof T] = true;
        return acc;
      }, {});
  }

  if (exclude) {
    const excludeParams = Array.isArray(exclude) ? exclude.join(",") : exclude.toString();
    parsedQuery.exclude = excludeParams
      .split(",")
      .reduce<Partial<Record<keyof T, boolean>>>((acc, s) => {
        acc[s.trim() as keyof T] = true;
        return acc;
      }, {});
  }

  if (populate) {
    const populateParams = Array.isArray(populate) ? populate : [populate];
    parsedQuery.populate = populateParams.reduce<NonNullable<ParsedQuery<T>["populate"]>>(
      (acc, popItem) => {
        const [path, ...fields] = popItem.toString().split(",");
        const key = path.trim() as keyof T;

        acc[key] = fields.length
          ? {
              select: fields.reduce<Record<string, boolean>>((selAcc, f) => {
                selAcc[f.trim()] = true;
                return selAcc;
              }, {})
            }
          : true;

        return acc;
      },
      {}
    );
  }

  if (take) {
    const parsed = Array.isArray(take) ? take[0].toString() : take.toString();
    parsedQuery.take = Math.min(parseInt(parsed, 10) || 0, GET_REQUEST_DATA_LIMIT);
  }

  if (skip) {
    const parsed = Array.isArray(skip) ? skip[0].toString() : skip.toString();
    parsedQuery.skip = parseInt(parsed, 10) || 0;
  }

  req.parsedQuery = parsedQuery;
  next();
}
