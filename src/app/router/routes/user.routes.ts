import path from "path";

const userRoutes = [
  {
    path: "",
    name: "user-dashboard",
    component: () => import("@/app/pages/user/dashboard.vue")
  },
  {
    path: "account",
    name: "user-account",
    component: () => import("@/app/pages/user/account/account.vue")
  },
  {
    path: "account/change-password",
    name: "user-change-password",
    component: () => import("@/app/pages/user/account/password-change.vue")
  },
  {
    path: "wallet",
    name: "user-wallet",
    component: () => import("@/app/pages/user/wallet.vue")
  },
  {
    path: "transactions",
    name: "user-transactions",
    component: () => import("@/app/pages/user/transactions/transactions.vue")
  },
  {
    path: "transactions/:transaction_id/receipt",
    name: "user-transaction-receipt",
    component: () => import("@/app/pages/user/transactions/transaction-receipt.vue")
  },
  {
    path: "transactions/:transaction_id/gift-card-validation-report",
    name: "user-gift-card-validation-report",
    component: () => import("@/app/pages/user/transactions/gift-card-validation-report.vue")
  },
  {
    path: "investments",
    name: "user-investments",
    component: () => import("@/app/pages/user/investments/investments.vue")
  },
  {
    path: "investments/:investment_id",
    name: "user-investment-item",
    component: () => import("@/app/pages/user/investments/investment.vue")
  },
  {
    path: "investment-plans",
    name: "user-investment-plans",
    component: () => import("@/app/pages/user/investments/investment-plans.vue")
  },
  {
    path: "investment-plans/:investment_plan_id",
    name: "user-investment-plan-item",
    component: () => import("@/app/pages/user/investments/investment-plan.vue")
  },
  {
    path: "investment-history",
    name: "user-investment-history",
    component: () => import("@/app/pages/user/investments/investment-history.vue")
  },
  {
    path: "investment-purchase/:investment_plan_slug/:investment_plan_tier_name",
    name: "user-investment-purchase",
    component: () => import("@/app/pages/user/investments/investment-purchase.vue")
  },

  {
    path: "deposit/currencies",
    name: "user-deposit-currencies",
    component: () => import("@/app/pages/user/deposit/deposit-currencies.vue")
  },
  {
    path: "deposit/gift-card",
    name: "user-deposit-gift-card",
    component: () => import("@/app/pages/user/deposit/deposit-gift-card.vue")
  },
  {
    path: "deposit/initialize",
    name: "user-deposit-initialize",
    component: () => import("@/app/pages/user/deposit/deposit-initialize.vue")
  },
  {
    path: "deposit/preview",
    name: "user-deposit-preview",
    component: () => import("@/app/pages/user/deposit/deposit-preview.vue")
  },
  {
    path: "withdrawal/initialize",
    name: "user-withdrawal-initialize",
    component: () => import("@/app/pages/user/withdrawal/withdrawal-initialize.vue")
  },
  {
    path: "withdrawal/validate",
    name: "user-withdrawal-validate",
    component: () => import("@/app/pages/user/withdrawal/withdrawal-validate.vue")
  },
  {
    path: "settings",
    name: "user-settings",
    component: () => import("@/app/pages/user/settings.vue")
  },
  {
    path: "notifications",
    name: "user-notifications",
    component: () => import("@/app/pages/user/notifications.vue")
  },
  {
    path: "help-center",
    name: "user-help-center",
    component: () => import("@/app/pages/user/help/help-center.vue")
  },
  {
    path: "help-center/contact",
    name: "user-contact",
    component: () => import("@/app/pages/user/help/contact.vue")
  },
  {
    path: "help-center/risk-acknowledgment",
    name: "user-risk-acknowledgment",
    component: () => import("@/app/pages/user/help/risk-acknowledgment.vue")
  },
  {
    path: "help-center/faq",
    name: "user-faq",
    component: () => import("@/app/pages/user/help/faq.vue")
  },
  {
    path: "help-center/faq/:faq_item_slug",
    name: "user-faq-item",
    component: () => import("@/app/pages/user/help/faq-item.vue")
  }
];

export default userRoutes;
