import { defineConfig } from "vite";
import Uni from "@uni-helper/plugin-uni";

export default defineConfig({
  plugins: [Uni()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: true,

    proxy: {
      "/auth": {
        target: "http://121.4.51.19:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      "/user": {
        target: "http://121.4.51.19:8080",
        changeOrigin: true,
        secure: false,
      },
      "/merchant": {
        target: "http://121.4.51.19:8080",
        changeOrigin: true,
        secure: false,
      },
      "/admin": {
        target: "http://121.4.51.19:8080",
        changeOrigin: true,
        secure: false,
      },
    },
    // proxy: {
    //   "/auth": {
    //     target: "http://localhost:8080",
    //     changeOrigin: true,
    //     secure: false,
    //     rewrite: (path) => path,
    //   },
    //   "/user": {
    //     target: "http://localhost:8080",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   "/merchant": {
    //     target: "http://localhost:8080",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   "/admin": {
    //     target: "http://localhost:8080",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
});
