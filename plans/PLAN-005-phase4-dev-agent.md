---
title: "Phase 4 — Autonomous Dev Agent (Self-hosted Runner)"
id: PLAN-005
domain: javis
type: plan
status: draft
lang: th
owners: ["kittinan101"]
related: ["PLAN-001", "PLAN-004"]
has_migration: true
risk: high
tags: ["phase-4", "dev-agent", "claude-code", "self-hosted", "ci-cd", "guardrails"]
updated: 2026-07-18
classification: internal
---

# PLAN-005: Phase 4 — Autonomous Dev Agent (Self-hosted Runner)

> ระยะเวลา: 4–8 สัปดาห์ (ค่อยๆ เพิ่มสิทธิ์) | เริ่มได้เมื่อ PLAN-004 ผ่าน DoD
> อ้างอิง: Implementation Spec v1.1 §1, §4–6, §8–9 + Notion "Dev Agent Design Solutions — Option B"
> ⚠️ Phase ความเสี่ยงสูงสุด — ยึด governance เคร่งครัด: **เริ่มจากงานเล็กเสมอ, guardrail 3 ชั้น, human gate ทุกจุดสำคัญ**

## 1. Requirement Summary

Agent อ่าน plan ที่ approve แล้ว (จาก Phase 3) → เขียนโค้ดใน product repo → เปิด PR → deploy Dev → test → ไต่ระดับสู่ UAT/Prod โดยมี human checkpoint: approve plan → PR review → UAT sign-off → approve ขึ้น main

## 2. Scope (In / Out)

**In:** Mac mini self-hosted runner (Option B), Claude Code headless, DB-backed job queue, product repo ตั้งต้น (Next.js 15 + Prisma + PostgreSQL 16), CI/CD 3 environments (Railway dev/uat + Render prod), generator/evaluator แยก instance, kill-switch
**Out:** Cloud runner Option A (design พร้อม ย้ายได้เมื่องานล้นคิว), destructive migration โดย agent (มนุษย์เขียนเองเสมอ), multi-runner

## 3. Impact Analysis

- เกิด **code repo ใหม่** (product) + เครื่อง runner ที่ถือ credentials → attack surface ใหม่ทั้งชุด ควบคุมด้วย §8 ของ Spec (สรุปใน T5)
- Doc Generator (PLAN-004 T3.x) เริ่มใช้ได้จริงกับ code repo นี้
- Docs-drift alert (PLAN-003 T3.3) เริ่มทำงานกับ code repo จริง

## 4. Technical Approach

- **Runner:** Mac mini (RAM 16GB+) เปิด 24/7 + Bun service + launchd KeepAlive + Tailscale (ไม่ expose public)
- **Agent:** `claude -p` headless + `--allowedTools`/`--disallowedTools` + `--max-budget-usd` ต่อ job
- **Queue:** ตาราง `JobQueue` ใน javis-core DB (crash-safe) — claim แบบ atomic ด้วย `FOR UPDATE SKIP LOCKED`
- **Guardrail 3 ชั้น:** (1) disallowedTools (2) fine-grained PAT ไม่มีสิทธิ์ push protected branch (3) branch protection + CODEOWNERS

## 5. Task Breakdown + Acceptance Criteria

### สัปดาห์ 1–2 — Product repo + CI/CD (ยังไม่มี agent)

#### T1.1 ตั้ง product repo (Next.js 15 + Prisma)
- [ ] สร้าง repo ใหม่: Next.js 15 App Router + TypeScript strict + Prisma + PostgreSQL 16 + Vitest + Playwright + Node 22 (npm)
- [ ] วาง `CLAUDE.md` ที่ root ตาม Spec §5d เต็ม — Stack ห้ามเปลี่ยน / กฎเหล็ก 5 ข้อ (ห้าม migrate deploy, ห้าม push ตรง develop/uat/main, ห้าม hardcode secret, ห้าม commit PII, ทุกฟีเจอร์มี test) / conventions (kebab-case.ts, PascalCase.tsx, RESTful route.ts, PrismaClient singleton ที่ `src/lib/db.ts`, Conventional Commits) / หมายเหตุ Apple Silicon
- [ ] branch: `develop` (default), `uat`, `main` + Dockerfile multi-arch (arm64)
- **AC:** `npm ci && npm run build && npm test` ผ่านบนเครื่อง dev และใน Docker arm64

#### T1.2 CI — test.yml (ทุก PR เข้า develop/uat/main)
- [ ] job `test`: Postgres 16 service container → `npm ci` → `prisma generate` → `migrate deploy` (test DB ephemeral) → build → test → test:e2e
- [ ] job `security`: gitleaks-action + `npm audit --audit-level=high`
- [ ] job `migration-gate`: `git diff --name-only | grep '^prisma/migrations/'` → พบ = ติด label `db-migration` + warning ให้มนุษย์รัน
- **AC:** PR ที่มี migration ติด label อัตโนมัติ; PR ที่มี secret ปลอมถูก block

#### T1.3 CD — deploy 3 environments
- [ ] `deploy-develop.yml`: push develop → env `development` (auto) → migrate deploy (dev DB) → `railway up`
- [ ] `deploy-uat.yml`: push uat → env `uat` (**required reviewer 1 คน**) → migrate deploy หลัง approve → railway up
- [ ] `deploy-main.yml`: push main → env `production` (**2 reviewers + Prevent self-review ON**) → **`pg_dump` snapshot PROD DB ก่อนเสมอ** → migrate deploy → Render deploy hook
- [ ] Render prod: ใช้ Render Job รัน migrate ใน private network (ไม่เปิด DB allowlist สาธารณะ)
- [ ] Railway: ตั้ง spend alert วันแรก (ไม่มี hard cap)
- **AC:** merge เข้า develop → Dev env อัพเดตอัตโนมัติ; uat/main ต้องผ่าน reviewer ตามที่ตั้ง; snapshot prod เกิดก่อน migrate ทุกครั้ง

#### T1.4 Branch protection + CODEOWNERS
- [ ] uat/main: Require PR + status checks (test, security, migration-gate) + 2 approvals บน main + Restrict push (ไม่รวม runner PAT) + ไม่ให้ admin bypass
- [ ] `CODEOWNERS`: `/prisma/migrations/` → Lead+DBA, `/.github/workflows/` → Lead, `*` → dev-team
- **AC:** ลอง push ตรงเข้า main ด้วย PAT ของ runner → ถูกปฏิเสธ

### สัปดาห์ 3–4 — Runner + Job Queue

#### T2.1 เตรียมเครื่อง Mac mini
- [ ] ติดตั้ง: `brew install node@22 bun git gh jq typst pandoc gitleaks` + `brew install --cask docker tailscale`
- [ ] `npm install -g @anthropic-ai/claude-code` + `claude setup-token` (long-lived OAuth สำหรับ headless)
- [ ] Secrets เก็บใน **macOS Keychain เท่านั้น**: `security add-generic-password -s javis -a anthropic -w <key>` — script อ่านตอน start ห้าม plaintext ใน plist
- [ ] Tailscale: `sudo tailscale up --advertise-tags=tag:javis-runner --ssh` + ACL: n8n (tag:n8n) → runner เฉพาะ port 8787, SSH เฉพาะ admin
- [ ] fine-grained PAT: เฉพาะ 2 repo — Contents R/W, Pull requests R/W, Metadata Read, Workflows Read — **ไม่ให้ Administration/Secrets/Environments**
- [ ] disk encryption (FileVault) เปิด
- **AC:** `claude -p "hello" --output-format json` ทำงานจาก script ที่อ่าน key จาก Keychain; ยิง port 8787 จากเครื่องนอก Tailscale → ไม่ถึง

#### T2.2 Job Queue (DB-backed, crash-safe)
- [ ] ตาราง `JobQueue(id, status: queued|claimed|running|done|failed, payload Json, attempts, claimedAt, updatedAt)` ใน javis-core
- [ ] n8n เขียนงาน `status=queued` → poke runner ที่ `:8787/poke` (ผ่าน Tailscale, ตรวจ header `x-javis-token`)
- [ ] Runner (Bun service): เมื่อถูก poke หรือทุก 60 วิ claim ทีละงานแบบ atomic:
```sql
UPDATE job_queue SET status='claimed', claimed_at=now()
WHERE id = (SELECT id FROM job_queue WHERE status='queued'
            ORDER BY created LIMIT 1 FOR UPDATE SKIP LOCKED)
RETURNING *;
```
- [ ] จบงาน → update done/failed + callback n8n; งานค้าง claimed/running > 2 ชม. → n8n cron reset เป็น queued + attempts+1; เกิน 3 ครั้ง = failed + alert
- [ ] launchd `~/Library/LaunchAgents/ai.javis.runner.plist` (KeepAlive + RunAtLoad) + `/health` endpoint + heartbeat ping n8n ทุก 5 นาที (เงียบ > 10 นาที = alert)
- **AC:** สั่ง 3 งานพร้อมกัน → รันทีละงานตามคิว; kill runner กลางงาน → restart อัตโนมัติ + งานถูก reset กลับ queued ภายใน 2 ชม. ไม่มีงานหาย

#### T2.3 Job execution (runJob.ts)
- [ ] ลำดับต่องาน: (1) reset workspace ด้วย `reset.sh` (`git reset --hard && git clean -fdx && git checkout develop && git fetch && git reset --hard origin/develop; docker container prune -f && docker image prune -f`) → checkout `feature/{job_id}` (2) รัน claude -p ด้วย plan ที่ approve (3) test ใน Docker arm64: `npm ci && npm run build && npm test` — fail → agent วิเคราะห์+แก้ วนไม่เกิน 3 รอบ (4) `gitleaks git` scan ก่อน commit — เจอ secret = fail งานทันที (5) commit + push **feature branch เท่านั้น** (6) `gh pr create` base=develop ใส่สรุปงาน + cost ใน body (7) callback n8n: `{job_id, status, cost_usd, session_id, duration_ms}`
- [ ] คำสั่ง Claude Code ตาม Spec §4 (ยืนยัน flags กับ docs รุ่นล่าสุดก่อนใช้ — model id ในตัวอย่างเป็น placeholder):
```bash
claude -p "$(cat /tmp/job-prompt.md)" \
  --output-format json \
  --allowedTools "Read,Edit,Write,Bash(npm *),Bash(npx prisma generate),Bash(git *),Bash(docker *),Grep,Glob" \
  --disallowedTools "Bash(npx prisma migrate deploy*),Bash(git push origin uat*),Bash(git push origin main*)" \
  --permission-mode acceptEdits \
  --max-turns 40 \
  --max-budget-usd 8
```
  (ไม่ใช้ `--bare` เพราะต้องการให้อ่าน CLAUDE.md; `--max-budget-usd` อ่านค่าจาก `SystemConfig.max_budget_per_job_usd`)
- [ ] ก่อนเปิด PR: `git fetch && git rebase origin/develop` — conflict แก้ไม่ได้ = escalate เข้าแชท
- **AC:** งานทดสอบ (แก้ typo) จบครบ 7 ขั้น → PR โผล่พร้อม cost; งานที่ test ไม่ผ่าน 3 รอบ → failed + รายงานสาเหตุในแชท ไม่มี PR ขยะ

### สัปดาห์ 5–6 — QA Gate + Governance

#### T3.1 Evaluator agent (แยกจาก generator)
- [ ] หลัง generator เปิด PR → runner spawn Claude **instance ใหม่ (คนละ session)** เห็นเฉพาะ (1) plan (2) git diff (3) ผล test — ไม่เห็นเหตุผลของ generator
- [ ] ตอบ JSON ตาม Spec §5e: `verdict: approve|request_changes|reject`, `acceptance_criteria[]` (met + evidence), `issues[]` (severity/file/desc), `guardrail_violations[]`, `summary_th`
- [ ] เกณฑ์: AC ไม่ครบ = request_changes / พบ guardrail violation = reject ทันที / ห้าม approve เพียงเพราะ test ผ่าน — ตรวจว่า test ครอบคลุม AC จริง + ตรวจ SQL injection, missing authz, secret ใน diff
- [ ] ผล evaluator แปะเป็น comment ใน PR + สรุปในแชท — **มนุษย์ยังต้อง review เสมอ** (evaluator เป็นตัวกรองชั้นแรก ไม่ใช่คนอนุมัติ)
- **AC:** PR ที่จงใจใส่ SQL injection ปลอม → evaluator reject พร้อมชี้บรรทัด; PR ปกติ → รายงาน AC ครบทุกข้อ

#### T3.2 Migration gate (additive-only)
- [ ] agent สร้าง migration ได้ด้วย `prisma migrate dev --create-only` เท่านั้น
- [ ] CI ตรวจไฟล์ migration: พบ `DROP`/`RENAME` ของ column/table → fail + ต้องมนุษย์เขียนเอง review พิเศษ (CODEOWNERS: Lead+DBA)
- [ ] rollback policy Phase นี้: revert code อย่างเดียว ไม่ rollback schema (เพราะ additive)
- **AC:** PR ที่มี DROP COLUMN → CI fail; additive migration → ผ่านพร้อม label db-migration ให้มนุษย์รันเอง

#### T3.3 Kill-switch + Cost control
- [ ] `POST /webhook/killswitch {enabled:false}` (ปุ่มใน #javis-alerts หรือคำสั่งแชทจาก Admin) → เขียน `SystemConfig.agent_enabled=false` → runner เช็คก่อนรับงานทุกครั้ง → drain แล้วหยุด
- [ ] `total_cost_usd` จาก claude JSON output → `CostLog` ทุกงาน → cron รายเดือน: เกิน 80% budget = alert / เกิน 100% = trigger kill-switch อัตโนมัติ
- [ ] SEV1 runbook ลง `guides/GUIDE-xxx-incident-runbook.md`: kill-switch → revert PR/deploy → ตรวจ AuditLog ด้วย job_id → postmortem เป็น ADR → เปิดใหม่
- **AC:** กด kill-switch → งานใหม่ไม่ถูกรับภายใน 1 นาที งานที่รันอยู่จบปกติ; จำลอง cost เกิน budget → agent หยุดรับงานเอง

#### T3.4 Data retention (PDPA)
- [ ] n8n cron purge: ConversationSession หมด TTL / FeedbackLog + chat log เก็บ 90 วัน / AuditLog + CostLog เก็บ 1 ปี
- [ ] คำสั่ง Admin "ลบข้อมูลของ user X" → purge ทุกตารางด้วย javisUserId + บันทึกการลบลง AuditLog (right to erasure)
- **AC:** รัน purge แล้ว row เกินอายุหายครบ, การลบ user ทิ้ง audit trail ไว้

### สัปดาห์ 7–8 — Pilot (ค่อยๆ เพิ่มสิทธิ์)

#### T4.1 Pilot งานเล็ก (5 งานแรก)
- [ ] จำกัดประเภทงาน: แก้ typo, เพิ่ม unit test, เพิ่ม endpoint เล็กที่ไม่มี migration
- [ ] ทุกงาน: plan approve → agent ทำ → evaluator ตรวจ → มนุษย์ review PR → merge → วัดผล
- [ ] เก็บ metric ต่อ PR: % ที่ต้องแก้, cost, เวลา, ปัญหาที่เจอ → สรุปเป็น ADR "บทเรียน pilot"
- **AC:** 5 งานจบครบ loop โดยไม่มี guardrail violation

#### T4.2 เปิดงานขนาดกลาง
- [ ] เมื่อ pilot ผ่าน: เปิด feature เต็ม (มี migration additive ได้) — ยังคง human gate ทุกจุด
- [ ] ทบทวน retry limit / budget ต่อ job จากข้อมูล pilot จริง → อัพเดต `SystemConfig`
- **AC (= DoD Phase 4):** PR จาก agent ผ่าน review โดยแก้น้อย > 70%; ไม่มี incident จากโค้ด agent ใน prod; cost อยู่ใน budget

## 6. Migration Gate

- agent สร้าง migration ด้วย `prisma migrate dev --create-only` เท่านั้น — **additive-only** (ห้าม DROP/RENAME — destructive ต้องมนุษย์เขียนเอง + review Lead+DBA)
- ห้ามรัน `migrate deploy` บน uat/prod — มนุษย์รันผ่าน approved CI step (deploy-uat มี reviewer, deploy-main มี 2 reviewers + pg_dump snapshot ก่อน)
- Guardrail 3 ชั้นกันไว้: disallowedTools → PAT ไม่มีสิทธิ์ → branch protection

## 7. Risks & Rollback

| Risk | Mitigation |
|---|---|
| Agent ทำ prod พัง (SEV1) | human gate 3 จุด + kill-switch + revert PR + pg_dump ก่อน migrate เสมอ + pilot งานเล็กก่อน |
| เครื่อง runner ดับ/เน็ตหลุด | job queue ใน DB (งานไม่หาย รอเครื่องกลับ), heartbeat alert, launchd auto-restart |
| Credentials บนเครื่องหลุด | Keychain only + Tailscale ไม่เปิด port + fine-grained PAT ขอบเขตแคบ + FileVault |
| AI ตรวจงานตัวเองพลาดแบบเดียวกัน | generator/evaluator แยก instance + acceptance test หลักกำหนดโดยคนใน plan ก่อน approve |
| Cost บานปลาย | `--max-budget-usd` ต่อ job + budget รายเดือน + kill-switch อัตโนมัติที่ 100% |
| Claude Code flags เปลี่ยน | ตรวจ docs ก่อน deploy จริง (Spec caveat) — pin version ของ CLI บน runner |
| งานล้นคิว 1 เครื่อง | ย้าย/burst ไป Option A (GitHub Actions) — design พร้อมแล้วใน Notion |

Rollback ระดับ phase: kill-switch = ระบบกลับสู่ Phase 3 (มนุษย์เขียนโค้ดเอง) ได้ทันทีโดย pipeline อื่นไม่กระทบ

---
## Approvals
<!-- ระบบเติมอัตโนมัติ: ผู้ approve + เวลา -->
