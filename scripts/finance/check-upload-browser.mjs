// Offline interaction check using the installed Chrome and esbuild bundled with tsx.
import { createRequire } from "node:module";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("tsx"))("esbuild");
const directory = await mkdtemp(path.join(process.cwd(), ".wp2-browser-"));
try {
  await build({ entryPoints: ["scripts/finance/upload-browser-harness.tsx"], outfile: path.join(directory, "check.js"), bundle: true, jsx: "automatic", platform: "browser", plugins: [{ name: "host-auth-boundary", setup(plugin) {
    plugin.onResolve({ filter: /^(@clerk\/nextjs|@\/components\/providers\/UserProvider)$/ }, (args) => ({ path: args.path, namespace: "host-auth" }));
    plugin.onLoad({ filter: /.*/, namespace: "host-auth" }, () => ({ contents: "export const useAuth = () => { throw new Error('Host auth must not run in session harness'); }; export const useUser = useAuth;", loader: "js" }));
  } }], define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_API_URL": '""' } });
  await writeFile(path.join(directory, "index.html"), '<!doctype html><html><body><div id="root"></div><pre id="result">PENDING</pre><script src="check.js"></script></body></html>');
  const { stdout } = await promisify(execFile)(process.env.CHROME_BIN ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless", "--no-sandbox", "--disable-gpu", "--disable-background-networking", "--no-first-run", `--user-data-dir=${directory}/profile`, "--virtual-time-budget=15000", "--dump-dom", `file://${directory}/index.html`], { timeout: 30000, maxBuffer: 5 * 1024 * 1024 });
  const result = stdout.match(/<pre id="result">([^<]*)<\/pre>/)?.[1];
  console.log(result ?? "FAIL: no browser result");
  if (!result?.startsWith("PASS:")) process.exitCode = 1;
} finally { await rm(directory, { recursive: true, force: true }); }
