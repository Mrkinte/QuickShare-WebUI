import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://127.0.0.1:5000",
        changeOrigin: true,
        // 其他可选配置
        secure: false, // 禁用 SSL验证（测试环境使用）
        ws: true, // 代理 WebSocket
      },
    },
  },
  build: {
    outDir: "../Assets/wwwroot",
  },
});
