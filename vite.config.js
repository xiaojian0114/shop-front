import { defineConfig } from "vite";
import Uni from "@uni-helper/plugin-uni";

export default defineConfig({
  plugins: [Uni()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: true,
    // 关键！正确的代理写法
    proxy: {
      // 所有接口都走代理
      "/auth": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // 保持路径不变
      },
      "/user": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/merchant": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/admin": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
