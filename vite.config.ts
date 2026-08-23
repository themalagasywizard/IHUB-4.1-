import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { handleWatchProxy } from "./server/watchProxy";

const watchProxyPlugin = (): Plugin => ({
  name: "watch-proxy",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith("/watch-proxy/")) {
        next();
        return;
      }

      try {
        const host = req.headers.host || "localhost";
        const request = new Request(`http://${host}${req.url}`, {
          method: req.method,
          headers: req.headers as HeadersInit,
        });
        const response = await handleWatchProxy(request);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        const buffer = Buffer.from(await response.arrayBuffer());
        res.end(buffer);
      } catch (error) {
        console.error("Watch proxy failed:", error);
        res.statusCode = 502;
        res.end("Unable to reach the video host");
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), watchProxyPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
