import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// Only load the dev platform plugin in non-CI / non-Vercel environments
const devPlugins = [];
if (!process.env.VERCEL && !process.env.CI) {
  try {
    const { miaodaDevPlugin } = await import("miaoda-sc-plugin");
    devPlugins.push(miaodaDevPlugin());
  } catch {
    // plugin not available — skip silently
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    ...devPlugins,
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
