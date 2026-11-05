// Servidor estático mínimo para o build do Vite (sem dependências).
// Uso interno (rede local): serve dist/ e devolve index.html para rotas do SPA.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const PORT = Number(process.env.PORT) || 8080;
const ROOT = join(import.meta.dirname, "dist");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

async function resolveFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const file = normalize(join(ROOT, decoded));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return null; // path traversal
  try {
    const info = await stat(file);
    if (info.isFile()) return file;
    if (info.isDirectory()) {
      const index = join(file, "index.html");
      if ((await stat(index)).isFile()) return index;
    }
  } catch {
    /* não existe */
  }
  return null;
}

createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  const urlPath = new URL(req.url ?? "/", "http://localhost").pathname;
  let file = await resolveFile(urlPath);

  if (!file) {
    // Arquivo de asset inexistente = 404; qualquer outra rota cai no SPA
    if (urlPath.startsWith("/assets/")) {
      res.writeHead(404).end();
      return;
    }
    file = join(ROOT, "index.html");
  }

  try {
    const body = await readFile(file);
    const headers = {
      "Content-Type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
      "Content-Length": body.length,
      "X-Content-Type-Options": "nosniff",
      // Assets do Vite têm hash no nome: cache longo; index.html nunca em cache
      "Cache-Control": file.startsWith(join(ROOT, "assets") + sep)
        ? "public, max-age=31536000, immutable"
        : "no-store",
    };
    res.writeHead(200, headers);
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(500).end();
  }
}).listen(PORT, "0.0.0.0", () => {
  console.log(`farmacia-front servindo ${ROOT} na porta ${PORT}`);
});
