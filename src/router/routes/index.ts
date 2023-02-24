import type { RouteRecordRaw } from "vue-router";
const modules = import.meta.globEager("./modules/**/*.ts");
// modules路由规则
const routes: RouteRecordRaw[] = [];

Object.keys(modules).forEach((key) => {
  console.log(modules[key].default);
  const modulesRoutes = modules[key].default || {};

  let modRoutesList = [];
  if (Array.isArray(modulesRoutes)) {
    modRoutesList = [...modulesRoutes];
  } else {
    modRoutesList = [modulesRoutes];
  }

  routes.push(...modRoutesList);
});

// 根目录路由规则
const rootRoute: RouteRecordRaw = {
  path: "/",
  name: "root",
  redirect: "/login"
};

// 404页面路由规则
const notFoundPage: RouteRecordRaw = {
  path: "/:pathMatch(.*)*",
  name: "404",
  component: () => import("@/views/404Page.vue")
};

export default [rootRoute, ...routes, notFoundPage];
