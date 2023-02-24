import type { RouteRecordRaw } from "vue-router";
const HomePage = () => import("@/views/HomePage.vue");

// 路由规则
const routes: RouteRecordRaw[] = [
  {
    path: "/home",
    name: "home",
    component: HomePage,
    children: [
      {
        path: "/dashboard",
        name: "dashboard",
        meta: {
          title: "系统首页"
        },
        component: () => import("@/views/Dashboard.vue")
      }
    ]
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginPage.vue")
  }
];

export default routes;
