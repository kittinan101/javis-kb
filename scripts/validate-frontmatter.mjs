#!/usr/bin/env node
/**
 * validate-frontmatter.mjs
 * ตรวจ frontmatter ของทุกไฟล์ .md ใน domains/, features/, plans/, guides/
 * ตาม .frontmatter-schema.json — ใช้ทั้ง local และใน CI
 *
 * ต้องติดตั้ง: npm i js-yaml ajv ajv-formats  (CI ทำให้อัตโนมัติ)
 * รัน: node scripts/validate-frontmatter.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { load as yamlLoad } from "js-yaml";
import { Ajv } from "ajv";

const ROOT = new URL("..", import.meta.url).pathname;
const SCAN_DIRS = ["domains", "features", "plans", "guides"];
const schema = JSON.parse(readFileSync(join(ROOT, ".frontmatter-schema.json"), "utf8"));

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

/** เดินหาไฟล์ .md ทั้งหมดใน dir แบบ recursive */
function walk(dir) {
  let out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out = out.concat(walk(p));
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

/** ดึง frontmatter block ระหว่าง --- ... --- บรรทัดแรกสุด */
function extractFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : null;
}

let files = [];
for (const d of SCAN_DIRS) {
  try { files = files.concat(walk(join(ROOT, d))); } catch { /* dir ยังไม่มี = ข้าม */ }
}

const errors = [];
const seenIds = new Map();

for (const file of files) {
  const rel = relative(ROOT, file);
  const raw = readFileSync(file, "utf8");
  const fmText = extractFrontmatter(raw);

  if (!fmText) {
    errors.push(`${rel}: ไม่มี frontmatter (ต้องขึ้นต้นไฟล์ด้วย --- ... ---)`);
    continue;
  }

  let fm;
  try {
    fm = yamlLoad(fmText);
  } catch (e) {
    errors.push(`${rel}: YAML parse error — ${e.message.split("\n")[0]}`);
    continue;
  }

  if (!validate(fm)) {
    for (const err of validate.errors) {
      errors.push(`${rel}: ${err.instancePath || "(root)"} ${err.message}`);
    }
  }

  // id ห้ามซ้ำทั้ง repo
  if (fm?.id) {
    if (seenIds.has(fm.id)) {
      errors.push(`${rel}: id "${fm.id}" ซ้ำกับ ${seenIds.get(fm.id)}`);
    } else {
      seenIds.set(fm.id, rel);
    }
  }
}

console.log(`ตรวจแล้ว ${files.length} ไฟล์`);
if (errors.length) {
  console.error(`\n❌ พบปัญหา ${errors.length} รายการ:\n`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("✅ frontmatter ผ่านทุกไฟล์");
