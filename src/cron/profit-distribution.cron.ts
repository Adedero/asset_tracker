import { CronJob } from "cron";
import { distributeProfit } from "#src/modules/user/services/profit.service";

export const profitDistributionJob = new CronJob(
  "*/30 * * * *",
  async function () {
    await distributeProfit();
  },
  null, // onComplete
  false // start automatically
);
