import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";

export default api(
  { path: "investment-plans", method: "post" },
  defineHandler(async (req) => {
    const data = req.body;
    const plan = await prisma.investmentPlan.create({ data });
    return { plan };
  })
);

export const currency = api(
  { path: "currencies", method: "post" },
  defineHandler(async (req) => {
    const data = req.body;
    const plan = await prisma.currency.create({ data });
    return { plan };
  })
);
