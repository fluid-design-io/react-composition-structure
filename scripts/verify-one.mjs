import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = join(root, "fixtures", "one");

async function run(command) {
  const process = Bun.spawn(command, { cwd: fixture, stdout: "pipe", stderr: "pipe" });
  const [code, stdout, stderr] = await Promise.all([
    process.exited,
    new Response(process.stdout).text(),
    new Response(process.stderr).text()
  ]);
  assert.equal(code, 0, `${command.join(" ")} failed\n${stdout}\n${stderr}`);
}

async function javascript(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const text = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? javascript(path) : entry.name.endsWith(".js") ? readFile(path, "utf8") : "";
  }));
  return text.join("\n");
}

function check(label, value) {
  assert.ok(value, label);
  console.log(`pass  one: ${label}`);
}

await run(["bun", "install", "--frozen-lockfile"]);
await run(["bun", "run", "typecheck"]);
console.log("pass  one: route adapters and Android component props typecheck");
await run(["bun", "run", "build"]);

const build = JSON.parse(await readFile(join(fixture, "dist", "buildInfo.json"), "utf8"));
const routes = build.manifest.pageRoutes.filter((route) => route.file);
assert.deepEqual(routes.map((route) => route.file).sort(), [
  "./index.tsx", "./orders/[id]+ssr.tsx", "./orders/index.tsx"
].sort());
console.log("pass  one: custom route root discovers only the three route entries");
check("dynamic SSR route retains its loader", routes.some((route) => route.type === "ssr" && route.hasLoader));
const [client, server] = await Promise.all([
  javascript(join(fixture, "dist", "client")),
  javascript(join(fixture, "dist", "server"))
]);
check("private loader helper exists in server output", server.includes("ONE_FIXTURE_PRIVATE_SENTINEL"));
check("private loader helper is excluded from browser output", !client.includes("ONE_FIXTURE_PRIVATE_SENTINEL"));
check("Node-only loader import is excluded from browser output", !client.includes("node:assert"));

const reservation = createServer();
await new Promise((resolve, reject) => {
  reservation.once("error", reject);
  reservation.listen(0, "127.0.0.1", resolve);
});
const port = reservation.address().port;
await new Promise((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));
const serving = Bun.spawn([
  join(fixture, "node_modules", ".bin", "one"), "serve", "--host", "127.0.0.1", "--port", String(port)
], { cwd: fixture, stdout: "pipe", stderr: "pipe" });
const logs = Promise.all([new Response(serving.stdout).text(), new Response(serving.stderr).text()]);

try {
  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 30_000;
  while (true) {
    try {
      const response = await fetch(base, { signal: AbortSignal.timeout(1000) });
      if (response.ok) break;
    } catch {}
    assert.ok(Date.now() < deadline, "One production server did not become ready");
    await Bun.sleep(100);
  }
  const page = async (path) => {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200, `${path} responds successfully`);
    return (await response.text()).replace(/<!--[\s\S]*?-->/g, "");
  };
  check("thin re-export renders the shared index screen", (await page("/orders")).includes("Order index"));
  const ready = await page("/orders/42");
  check("loader payload reaches the external module provider", ready.includes("<h1>Order 42</h1>"));
  check("ready gate renders the list and action", ready.includes("<li>Tea</li>") && ready.includes("Quantity 1"));
  const empty = await page("/orders/empty");
  check("empty gate renders without the ready subtree", empty.includes("No items") && !empty.includes("Quantity 1"));
  check("private marker never appears in HTML payloads", !`${ready}${empty}`.includes("ONE_FIXTURE_PRIVATE_SENTINEL"));
} finally {
  serving.kill();
  await Promise.race([serving.exited, Bun.sleep(2000)]);
  if (serving.exitCode === null) serving.kill("SIGKILL");
  await serving.exited;
  const output = await logs;
  if (serving.exitCode && !serving.signalCode) console.log(output.join("\n"));
}

console.log("One web fixture passed. Android props were typechecked; native execution was not run.");
