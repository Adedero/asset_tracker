export const mainLinks = [
  {
    label: "Home",
    route: { name: "home" }
  },
  {
    label: "Company",
    items: [
      { label: "About", route: { name: "about" } },
      { label: "Contact", route: { name: "contact" } }
    ]
  },
  {
    label: "Market",
    route: { name: "market" }
  },
  {
    label: "Services",
    route: { name: "services" }
  },
  {
    label: "Legal",
    items: [
      { label: "Terms of Use", route: { name: "terms-of-use" } },
      { label: "Privacy Policy", route: { name: "privacy-policy" } }
    ]
  }
];

export const userLinks = [
  {
    label: "Dashboard",
    icon: "pi pi-box",
    route: { name: "user-dashboard" }
  },
  {
    label: "Investments",
    icon: "pi pi-chart-line",
    route: { name: "user-investments" }
  },
  {
    label: "Wallet",
    icon: "pi pi-wallet",
    route: { name: "user-wallet" }
  },
  {
    label: "Account",
    icon: "pi pi-user",
    route: { name: "user-account" }
  },
  {
    label: "Help Center",
    icon: "pi pi-question-circle",
    route: { name: "user-help-center" }
  },
  {
    label: "Notifications",
    icon: "pi pi-bell",
    route: { name: "user-notifications" }
  },
  {
    label: "Settings",
    icon: "pi pi-cog",
    route: { name: "user-settings" }
  }
];

export const adminLinks = [
  {
    label: "Dashboard",
    icon: "pi pi-box",
    route: { name: "admin-dashboard" }
  },
  {
    label: "Users",
    icon: "pi pi-user",
    route: { name: "admin-users" }
  },
  {
    label: "Account Groups",
    icon: "pi pi-users",
    route: { name: "admin-account-groups" }
  },
  {
    label: "Investments",
    icon: "pi pi-chart-line",
    route: { name: "admin-investments" }
  },
  {
    label: "Transactions",
    icon: "pi pi-wallet",
    route: { name: "admin-transactions" }
  },
  {
    label: "KYC Applications",
    icon: "pi pi-id-card",
    route: { name: "admin-kyc-applications" }
  },
  {
    label: "Email Service",
    icon: "pi pi-envelope",
    route: { name: "admin-email-service" }
  },
  {
    label: "Currencies",
    icon: "pi pi-bitcoin",
    route: { name: "admin-currencies" }
  },
  {
    label: "Investment Plans",
    icon: "pi pi-table",
    route: { name: "admin-investment-plans" }
  },
  {
    label: "FAQs",
    icon: "pi pi-question-circle",
    route: { name: "admin-faq" }
  },
  {
    label: "Account",
    icon: "pi pi-shield",
    route: { name: "admin-account" }
  },
  {
    label: "Database",
    icon: "pi pi-database",
    route: { name: "admin-database" }
  }
];
