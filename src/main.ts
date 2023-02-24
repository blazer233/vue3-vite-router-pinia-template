import { createApp } from "vue";
import App from "./App.vue";
import { setupRouter } from "./router";
import TDesign from "tdesign-vue-next";
import "tdesign-vue-next/es/style/index.css";
import { setupStore } from "./store";
import "./style.css";

const app = createApp(App);
app.config.errorHandler = (err, vm, info) => {
  console.log(err, vm, info, 999);
};
setupStore(app);
setupRouter(app);
app.use(TDesign);

app.mount("#app");
