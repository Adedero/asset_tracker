"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profitDistributionJob = void 0;
const cron_1 = require("cron");
const profit_service_1 = require("#src/modules/user/services/profit.service");
exports.profitDistributionJob = new cron_1.CronJob("*/30 * * * *", async function () {
    await (0, profit_service_1.distributeProfit)();
}, null, // onComplete
false // start automatically
);
