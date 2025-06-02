const authRoutes = [
  {
    path: "login",
    name: "login",
    component: () => import("@/app/pages/auth/login.vue")
  },
  {
    path: "register",
    name: "register",
    component: () => import("@/app/pages/auth/register.vue")
  },
  {
    path: "forgot-password",
    name: "forgot-password",
    component: () => import("@/app/pages/auth/forgot-password.vue")
  },
  {
    path: "email-verification",
    name: "email-verification",
    component: () => import("@/app/pages/auth/email-verification.vue")
  },
  {
    path: "password-reset",
    name: "password-reset",
    component: () => import("@/app/pages/auth/password-reset.vue")
  }
];

export default authRoutes;
