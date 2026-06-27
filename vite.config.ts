import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import type { IncomingMessage, ServerResponse } from "http";

const UPLOADS_DIR = path.resolve(__dirname, "uploads");

function uploadPlugin() {
  return {
    name: "kssi-upload-handler",
    configureServer(server: { middlewares: { use: (path: string, fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } }) {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }

      // POST /api/upload — save raw binary body to uploads/
      server.middlewares.use("/api/upload", (req, res) => {
        if (req.method !== "POST") { res.statusCode = 405; res.end(); return; }
        const rawName = decodeURIComponent((req.headers["x-filename"] as string) || "upload.xlsx");
        const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const dest = path.join(UPLOADS_DIR, safeName);
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", () => {
          try {
            fs.writeFileSync(dest, Buffer.concat(chunks));
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, name: safeName }));
          } catch {
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false }));
          }
        });
        req.on("error", () => { res.statusCode = 500; res.end(); });
      });

      // GET /api/uploads — list saved files
      server.middlewares.use("/api/uploads", (req, res) => {
        if (req.method !== "GET") { res.statusCode = 405; res.end(); return; }
        try {
          const files = fs.readdirSync(UPLOADS_DIR)
            .filter(f => /\.(xlsx|xls|csv)$/i.test(f))
            .map(f => {
              const stat = fs.statSync(path.join(UPLOADS_DIR, f));
              return { name: f, size: stat.size, modified: stat.mtimeMs };
            })
            .sort((a, b) => b.modified - a.modified);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(files));
        } catch {
          res.setHeader("Content-Type", "application/json");
          res.end("[]");
        }
      });

      // GET /api/file/:name — serve a saved file for reloading
      server.middlewares.use("/api/file", (req, res) => {
        if (req.method !== "GET") { res.statusCode = 405; res.end(); return; }
        const name = (req.url || "").replace(/^\//, "").replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = path.join(UPLOADS_DIR, name);
        if (!fs.existsSync(filePath)) { res.statusCode = 404; res.end(); return; }
        try {
          const buf = fs.readFileSync(filePath);
          res.setHeader("Content-Type", "application/octet-stream");
          res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
          res.end(buf);
        } catch {
          res.statusCode = 500;
          res.end();
        }
      });

      // DELETE /api/file/:name — delete a saved file
      server.middlewares.use("/api/delete", (req, res) => {
        if (req.method !== "DELETE") { res.statusCode = 405; res.end(); return; }
        const name = (req.url || "").replace(/^\//, "").replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = path.join(UPLOADS_DIR, name);
        try {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.statusCode = 500;
          res.end();
        }
      });
    },
  };
}

export default defineConfig(() => ({
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    react(),
    uploadPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: "public",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    copyPublicDir: true,
  },
}));
