import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const target = (process.env.TARGET_URL || "").replace(/\/+$/, "");
const port = Number(process.env.PORT || 8000);

if (!target) {
  throw new Error("TARGET_URL is required, for example http://YOUR_VPS_IP:8000");
}

const app = express();

app.disable("x-powered-by");

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use(
  "/",
  createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    xfwd: true,
    proxyTimeout: 60000,
    timeout: 60000,
    on: {
      proxyReq: (proxyReq) => {
        proxyReq.setHeader("x-animebot-proxy", "koyeb");
      },
      error: (err, _req, res) => {
        console.error("Proxy error:", err.message);
        if (!res.headersSent) {
          res.status(502).send("Proxy could not reach the origin server.");
        }
      }
    }
  })
);

app.listen(port, "0.0.0.0", () => {
  console.log(`AnimeBot proxy listening on ${port}`);
  console.log(`Forwarding requests to ${target}`);
});
