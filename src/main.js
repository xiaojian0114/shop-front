import { createSSRApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";

export function createApp() {
  const app = createSSRApp(App);

  // ⭐ 注册 Pinia
  const pinia = createPinia();
  app.use(pinia);

  return {
    app,
  };
}
