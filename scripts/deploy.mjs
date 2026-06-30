import { Client } from "basic-ftp";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile(path.join(root, ".env.deploy"));

const target = process.argv[2] || "preview";
if (!["preview", "production"].includes(target)) {
  console.error('Usage: node scripts/deploy.mjs <preview|production>');
  process.exit(1);
}

const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USER;
const FTP_PASSWORD = process.env.FTP_PASSWORD;
const REMOTE_BASE = process.env.FTP_REMOTE_BASE || "/domains/kssitech.com/public_html";

if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
  console.error(
    "Missing FTP credentials. Create a .env.deploy file in the project root (see .env.deploy.example) " +
      "or set FTP_HOST / FTP_USER / FTP_PASSWORD environment variables."
  );
  process.exit(1);
}

if (target === "production" && process.argv[3] !== "--yes") {
  console.error(
    "Production deploy clears the live public_html and replaces it. " +
      "Re-run with an extra --yes flag to confirm: npm run deploy -- production --yes"
  );
  process.exit(1);
}

const isPreview = target === "preview";
const base = isPreview ? "/preview/" : "/";
const outDir = isPreview ? "dist-preview" : "dist";
const remoteDir = isPreview ? `${REMOTE_BASE}/preview` : REMOTE_BASE;

console.log(`Building (base=${base}) -> ${outDir}/ ...`);
rmSync(path.join(root, outDir), { recursive: true, force: true });
execSync(`npx vite build --base=${base} --outDir ${outDir}`, {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, MSYS_NO_PATHCONV: "1" },
});

writeFileSync(
  path.join(root, outDir, ".htaccess"),
  `RewriteEngine On\nRewriteBase ${base}\nRewriteCond %{REQUEST_FILENAME} -f [OR]\nRewriteCond %{REQUEST_FILENAME} -d\nRewriteRule ^ - [L]\nRewriteRule ^ index.html [L]\n`
);

console.log(`Uploading ${outDir}/ -> ${remoteDir} ...`);
const client = new Client();
try {
  await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASSWORD });
  await client.ensureDir(remoteDir);
  await client.clearWorkingDir();
  await client.uploadFromDir(path.join(root, outDir));
  console.log(`Done. Live at: https://${FTP_HOST}${isPreview ? "/preview/" : "/"}`);
} finally {
  client.close();
}
