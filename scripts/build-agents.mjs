#!/usr/bin/env node
// Generates one AGENTS.md per skill from metadata.json, templates/<skill>.head.md,
// and skills/<skill>/rules/*.md. rules/ is the source of truth; do not edit
// AGENTS.md by hand. The build also lints each skill for terms that belong to
// another framework's skill.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// Shippable skill files live in skills/<name>/ so `npx skills add` vendors each
// whole folder. Build inputs (metadata.json, templates/) stay at the repo root
// and are not vendored.
const skillsDir = join(root, "skills");

const SHARED = "react-composition-structure";

// Terms that would leak one framework's tree into another skill. A rule file
// with `lint: framework-names-allowed` in its frontmatter skips the check.
const FORBIDDEN = {
  [SHARED]: /(?<![.\w])page\.tsx|createFileRoute|\bexpo\b|_layout|routeTree|use client|getRouteApi|next\.js/i,
  [`${SHARED}-nextjs`]: /\bexpo\b|createFileRoute|routeTree|react-native|screens\/|getRouteApi|_layout|tanstack/i,
  [`${SHARED}-expo`]: /(?<![.\w])page\.tsx|createFileRoute|use client|routeTree|next\.js|tanstack/i,
  [`${SHARED}-tanstack-start`]: /\bexpo\b|(?<![.\w])page\.tsx|use client|_layout|next\.js/i,
};

// Punctuation the prose style bans everywhere.
const BANNED_PUNCTUATION = /—|–|→/;

function githubSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseRule(rulesDir, file) {
  const raw = readFileSync(join(rulesDir, file), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing frontmatter in ${file}`);

  const meta = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[kv[1]] = value;
  }

  // Drop the standalone title heading; the generator re-emits it with a number.
  let body = match[2].replace(/^\s+/, "");
  body = body.replace(/^#{1,6} .*\n+/, "").trimEnd();

  return { file, meta, body };
}

function buildToc(rules) {
  const lines = [];
  let currentGroup = null;
  for (const { meta } of rules) {
    if (meta.groupNumber !== currentGroup) {
      currentGroup = meta.groupNumber;
      const groupHeading = `${meta.groupNumber}. ${meta.group}`;
      lines.push(
        `${meta.groupNumber}. [${meta.group}](#${githubSlug(groupHeading)}) (${meta.impact})`
      );
    }
    const ruleHeading = `${meta.section} ${meta.title}`;
    lines.push(`  - ${meta.section} [${meta.title}](#${githubSlug(ruleHeading)})`);
  }
  return lines.join("\n");
}

function buildBody(rules) {
  const parts = [];
  let currentGroup = null;
  for (const { meta, body } of rules) {
    if (meta.groupNumber !== currentGroup) {
      currentGroup = meta.groupNumber;
      parts.push(`## ${meta.groupNumber}. ${meta.group}`);
      if (meta.groupIntro) parts.push(meta.groupIntro);
    }
    parts.push(`### ${meta.section} ${meta.title}`);
    parts.push(body);
  }
  return parts.join("\n\n");
}

function lint(skill, name, text, { frameworkNamesAllowed = false } = {}) {
  const problems = [];
  text.split("\n").forEach((line, i) => {
    const where = `${skill}/${name}:${i + 1}`;
    if (BANNED_PUNCTUATION.test(line)) {
      problems.push(`${where} banned punctuation: ${line.trim()}`);
    }
    const hit = !frameworkNamesAllowed && line.match(FORBIDDEN[skill]);
    if (hit) problems.push(`${where} "${hit[0]}" belongs to another skill`);
  });
  return problems;
}

const metadata = JSON.parse(readFileSync(join(root, "metadata.json"), "utf8"));
const problems = [];

for (const [skill, { title }] of Object.entries(metadata.skills)) {
  const skillDir = join(skillsDir, skill);
  const rulesDir = join(skillDir, "rules");
  const head = readFileSync(join(root, "templates", `${skill}.head.md`), "utf8").trim();

  const rules = readdirSync(rulesDir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => parseRule(rulesDir, f))
    .sort((a, b) =>
      a.meta.section.localeCompare(b.meta.section, undefined, { numeric: true })
    );

  for (const rule of rules) {
    problems.push(
      ...lint(skill, `rules/${rule.file}`, rule.body, {
        frameworkNamesAllowed: rule.meta.lint === "framework-names-allowed",
      })
    );
  }
  // The shared SKILL.md holds the router table, so it may name frameworks.
  problems.push(
    ...lint(skill, "SKILL.md", readFileSync(join(skillDir, "SKILL.md"), "utf8"), {
      frameworkNamesAllowed: skill === SHARED,
    })
  );
  problems.push(...lint(skill, "head.md", head, { frameworkNamesAllowed: true }));

  const out =
    [
      `# ${title}`,
      `${metadata.organization}  \n${metadata.date}  \nVersion ${metadata.version}`,
      head,
      "## Table of Contents",
      buildToc(rules),
      buildBody(rules),
    ].join("\n\n") + "\n";

  writeFileSync(join(skillDir, "AGENTS.md"), out);
  console.log(`${skill}: generated AGENTS.md from ${rules.length} rules.`);
}

if (problems.length > 0) {
  console.error(`\nLint failed:\n${problems.join("\n")}`);
  process.exit(1);
}
