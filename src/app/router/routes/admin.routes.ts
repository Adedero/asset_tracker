const adminRoutes = [
  {
    path: "",
    name: "admin-dashboard",
    component: () => import("@/app/pages/admin/dashboard.vue")
  },
  {
    path: "users",
    name: "admin-users",
    component: () => import("@/app/pages/admin/users/users.vue")
  },
  {
    path: "users/:user_id",
    name: "admin-user-item",
    component: () => import("@/app/pages/admin/users/user.vue")
  },
  {
    path: "kyc/applications",
    name: "admin-kyc-applications",
    component: () => import("@/app/pages/admin/users/kyc-applications.vue")
  },
  {
    path: "kyc/review/:account_id",
    name: "admin-kyc-review",
    component: () => import("@/app/pages/admin/users/kyc-review.vue")
  },
  {
    path: "transactions",
    name: "admin-transactions",
    component: () => import("@/app/pages/admin/transactions/transactions.vue")
  },
  {
    path: "transactions/:transaction_id",
    name: "admin-transaction-item",
    component: () => import("@/app/pages/admin/transactions/transaction.vue")
  },
  {
    path: "transactions/:transaction_id/gift-card/validate",
    name: "admin-gift-card-validate",
    component: () => import("@/app/pages/admin/transactions/gift-card-validate.vue")
  },
  {
    path: "transactions/:transaction_id/gift-card/validation-report",
    name: "admin-gift-card-validation-report",
    component: () => import("@/app/pages/admin/transactions/gift-card-validation-report.vue")
  },
  {
    path: "investments",
    name: "admin-investments",
    component: () => import("@/app/pages/admin/investments/investments.vue")
  },
  {
    path: "investments/:investment_id",
    name: "admin-investment-item",
    component: () => import("@/app/pages/admin/investments/investment.vue")
  },
  {
    path: "investment-plans",
    name: "admin-investment-plans",
    component: () => import("@/app/pages/admin/investments/investment-plans.vue")
  },
  {
    path: "investment-plans/edit/:investment_plan_id?",
    name: "admin-investment-plan-editor",
    component: () => import("@/app/pages/admin/investments/investment-plan-editor.vue")
  },
  {
    path: "account-groups",
    name: "admin-account-groups",
    component: () => import("@/app/pages/admin/account-groups.vue")
  },
  {
    path: "email-service",
    name: "admin-email-service",
    component: () => import("@/app/pages/admin/email-service.vue")
  },
  {
    path: "currencies",
    name: "admin-currencies",
    component: () => import("@/app/pages/admin/currencies.vue")
  },
  {
    path: "faqs",
    name: "admin-faq",
    component: () => import("@/app/pages/admin/faq/faq.vue")
  },
  {
    path: "faqs/edit/:faq_id?",
    name: "admin-faq-item",
    component: () => import("@/app/pages/admin/faq/faq-item.vue")
  },
  {
    path: "account",
    name: "admin-account",
    component: () => import("@/app/pages/admin/account/account.vue")
  },
  {
    path: "account/change-password",
    name: "admin-change-password",
    component: () => import("@/app/pages/admin/account/password-change.vue")
  }
];

export default adminRoutes;
