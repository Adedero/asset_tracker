import { GET_REQUEST_DATA_LIMIT } from "#src/utils/constants";
export default function parseRequestQuery(req, res, next) {
    const { where, sort, select, exclude, populate, skip, take } = req.query;
    const parsedQuery = {};
    if (where) {
        const filters = {};
        const conditions = Array.isArray(where) ? where : [where];
        conditions.forEach((condition) => {
            const [key, value] = condition.toString().split(",");
            if (key && value !== undefined) {
                const trimmedValue = value.trim();
                let parsedValue;
                if (trimmedValue === "false" || trimmedValue === "true") {
                    parsedValue = trimmedValue === "true";
                }
                else if (!isNaN(Number(trimmedValue))) {
                    parsedValue = Number(trimmedValue);
                }
                else {
                    parsedValue = trimmedValue;
                }
                filters[key] = parsedValue;
            }
        });
        parsedQuery.where = filters;
    }
    if (sort) {
        let sortObj = {};
        const sortParams = Array.isArray(sort) ? sort : [sort];
        sortParams.forEach((sortItem) => {
            const parts = sortItem.toString().split(",");
            const field = parts[0]?.trim();
            const order = parts[1]?.trim().toLowerCase();
            if (field && (order === "asc" || order === "desc")) {
                sortObj[field] = order;
            }
        });
        parsedQuery.sort = sortObj;
    }
    if (select) {
        const selectParams = Array.isArray(select) ? select.join(",") : select.toString();
        parsedQuery.select = selectParams
            .split(",")
            .reduce((acc, s) => {
            acc[s.trim()] = true;
            return acc;
        }, {});
    }
    if (exclude) {
        const excludeParams = Array.isArray(exclude) ? exclude.join(",") : exclude.toString();
        parsedQuery.exclude = excludeParams
            .split(",")
            .reduce((acc, s) => {
            acc[s.trim()] = true;
            return acc;
        }, {});
    }
    if (populate) {
        const populateParams = Array.isArray(populate) ? populate : [populate];
        parsedQuery.populate = populateParams.reduce((acc, popItem) => {
            const [path, ...fields] = popItem.toString().split(",");
            const key = path.trim();
            acc[key] = fields.length
                ? {
                    select: fields.reduce((selAcc, f) => {
                        selAcc[f.trim()] = true;
                        return selAcc;
                    }, {})
                }
                : true;
            return acc;
        }, {});
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
