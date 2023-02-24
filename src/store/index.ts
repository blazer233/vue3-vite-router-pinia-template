import { createPinia } from "pinia";
import useDemoStore from "./modules/demo";
import useUserStore from "./modules/user";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import type { App } from "vue";

const store = createPinia();
store.use(piniaPluginPersistedstate);

export const setupStore = (app: App<Element>) => app.use(store);
export { useUserStore, useDemoStore };
export default store;
