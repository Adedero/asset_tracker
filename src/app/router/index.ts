import { createRouter, createWebHistory } from "vue-router";

import mainRoutes from "./routes/main.routes";
import authRoutes from "./routes/auth.routes";
import errorRoutes from "./routes/error.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import useStore from "../stores/store";

const router = createRouter({
  //@ts-ignore
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return {
        top: 0,
        behavior: "smooth"
      };
    }
  },
  routes: [
    {
      path: "/",
      children: [...authRoutes, ...mainRoutes, ...errorRoutes]
    },
    {
      path: "/user",
      children: userRoutes,
      meta: { requiresAuth: true, role: "USER" }
    },
    {
      path: "/admin",
      children: adminRoutes,
      meta: { requiresAuth: true, role: "ADMIN" }
    },
    {
      path: "/:pathMatch(.*)*",
      component: () => import("@/app/pages/error/error-404.vue")
    }
  ]
});

router.onError((error, to) => {
  if (error.message.includes("Failed to fetch dynamically imported module")) {
    //window.location.href = to.fullPath
  }
});

router.beforeEach((to, from, next) => {
  const store = useStore();

  if (!to.matched.some((record) => record.meta.requiresAuth)) {
    return next();
  }
  if (!store.user.id || !store.user.accessToken) {
    return next({ name: "login", query: { redirect: to.fullPath } });
  }
  if (store.user.role !== to.meta.role) {
    return next({ name: "login" });
  }
  next();
});

export default router;
