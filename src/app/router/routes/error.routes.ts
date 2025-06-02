const errorRoutes = [
  {
    path: "/not-found",
    name: "error-404",
    component: () => import("@/app/pages/error/error-404.vue")
  },
  {
    path: "/server-error",
    name: "error-500",
    component: () => import("@/app/pages/error/error-500.vue")
  }
];

export default errorRoutes;
