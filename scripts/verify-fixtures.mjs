#!/usr/bin/env node
// Builds fixtures/next and fixtures/tanstack and checks the claims the skills
// make about each framework. Run it after a framework major version lands.
// Fixtures are not vendored into the installed skills.

import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function run(cwd, command) {
  return execSync(command, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function check(label, ok) {
  console.log(`${ok ? "pass" : "FAIL"}  ${label}`);
  if (!ok) failures.push(label);
}

function install(dir) {
  if (!existsSync(join(dir, "node_modules"))) run(dir, "npm install --no-audit --no-fund");
}

function verifyNext() {
  const dir = join(root, "fixtures", "next");
  install(dir);
  const out = run(dir, "npx next build");
  const routes = out
    .split("\n")
    .map((line) => line.match(/([○◐ƒ●])\s+(\/\S*)/))
    .filter(Boolean)
    .map((m) => `${m[1]} ${m[2]}`);

  const expected = [
    "○ /_not-found",
    "○ /benefits",
    "◐ /invite/[token]",
    "○ /invite/new",
    "○ /invite/old",
    "◐ /orders/[id]",
    "◐ /orders/1",
  ];
  check("next: colocated module files add no routes", routes.length === expected.length);
  for (const route of expected) check(`next: route table has "${route}"`, routes.includes(route));

  const html = (path) => readFileSync(join(dir, ".next", "server", "app", path), "utf8");
  check("next: generateMetadata re-exported from orders.metadata.ts", html("orders/1.html").includes("<title>Order 1</title>"));
  check("next: metadata re-exported from benefits.metadata.ts", html("benefits.html").includes("<title>Benefits</title>"));
  check("next: static shell holds the heading and the skeleton", html("orders/1.html").includes("Your order") && html("orders/1.html").includes("orders-skeleton"));
  check("next: streamed content stays out of the shell", !html("orders/[id].html").includes("Card reader"));
}

function verifyTanstack() {
  const dir = join(root, "fixtures", "tanstack");
  const routeFile = join(dir, "src", "routes", "checkout", "$id", "index.tsx");
  const hazard = join(dir, "src", "routes", "checkout", "checkout.summary.tsx");
  const tree = () => readFileSync(join(dir, "src", "routeTree.gen.ts"), "utf8");
  const original = readFileSync(routeFile, "utf8");
  install(dir);

  try {
    run(dir, "npx vite build");
    check("tanstack: the -checkout folder adds no routes", !tree().includes("-checkout"));
    check("tanstack: route tree has /checkout/$id/", tree().includes("id: '/checkout/$id/'"));
    run(dir, "npx tsc --noEmit");
    check("tanstack: getRouteApi, validateSearch and createServerFn typecheck", true);

    writeFileSync(routeFile, original.replace('createFileRoute("/checkout/$id/")', 'createFileRoute("/wrong/path")'));
    writeFileSync(hazard, "");
    run(dir, "npx vite build");
    check("tanstack: the generator rewrites a wrong createFileRoute path", readFileSync(routeFile, "utf8").includes('"/checkout/$id/"'));
    check("tanstack: an empty stem-dotted file becomes a live route", tree().includes("/checkout/checkout/summary"));
  } finally {
    writeFileSync(routeFile, original);
    rmSync(hazard, { force: true });
  }
}

for (const [name, verify] of [["next", verifyNext], ["tanstack", verifyTanstack]]) {
  try {
    verify();
  } catch (error) {
    check(`${name}: build completed`, false);
    console.error(String(error.stdout ?? error.message).split("\n").slice(-25).join("\n"));
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll fixture checks passed.");
