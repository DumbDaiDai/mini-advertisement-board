import { defineNuxtRouteMiddleware } from "#imports";
import { useAuthStore } from "~/stores/auth-store";

const NO_AUTH_ROUTE = ["/login"];

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return;
  }

  const { loggedIn } = useAuthStore();

  // 已登录状态自动进入
  if (loggedIn && to.path === "/login") {
    return navigateTo({ path: "/" });
  }

  // 未登录状态返回登录
  if (!loggedIn && !NO_AUTH_ROUTE.includes(to.path)) {
    return navigateTo({ path: "/login", query: { fromPath: encodeURIComponent(to.fullPath) } });
  }
});