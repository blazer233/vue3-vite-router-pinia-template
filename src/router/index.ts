import {
  createRouter,
  createWebHashHistory,
  createWebHistory
} from "vue-router";
import type { App } from "vue";
import routes from "./routes/index";
import nProgress from "nprogress";
import { storeToRefs } from "pinia";
import "nprogress/nprogress.css";
import { useUserStore } from "@/store";
nProgress.configure({ showSpinner: false });

const isHash = !!import.meta.env.VITE_USE_HASH;
const router = createRouter({
  history: isHash ? createWebHashHistory("/") : createWebHistory("/"),
  routes,
  scrollBehavior() {
    return {
      el: "#app",
      top: 0,
      behavior: "smooth"
    };
  }
});

router.beforeEach((to, from, next) => {
  nProgress.start();
  const user = useUserStore();
  const { login } = storeToRefs(user);
  console.log(user, to, from);
  if (!login && to.path !== "/login") {
    next("/login");
  } else {
    next();
  }
});
router.afterEach(() => {
  nProgress.done(true);
});
/**
 * 路由初始化函数
 * @param app
 */
export const setupRouter = (app: App<Element>) => app.use(router);

export default router;
