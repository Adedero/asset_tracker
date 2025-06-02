const mainRoutes = [
  {
    path: "",
    name: "home",
    component: () => import("@/app/pages/main/home.vue")
  },
  {
    path: "about",
    name: "about",
    component: () => import("@/app/pages/main/about.vue")
  },
  {
    path: "contact",
    name: "contact",
    component: () => import("@/app/pages/main/contact.vue")
  },
  {
    path: "market",
    name: "market",
    component: () => import("@/app/pages/main/market.vue")
  },
  {
    path: "services",
    name: "services",
    component: () => import("@/app/pages/main/services/services.vue")
  },
  {
    path: "services/:service",
    name: "service-item",
    component: () => import("@/app/pages/main/services/service-item.vue")
  },
  {
    path: "legal/terms-of-use",
    name: "terms-of-use",
    component: () => import("@/app/pages/main/legal/terms-of-use.vue")
  },
  {
    path: "legal/privacy-policy",
    name: "privacy-policy",
    component: () => import("@/app/pages/main/legal/privacy-policy.vue")
  }
];

export default mainRoutes;
