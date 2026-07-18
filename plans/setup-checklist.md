---
title: "Javis AI — Setup Plan & Checklist"
id: PLAN-000
domain: javis
type: plan
status: in_progress
lang: th
owners: ["kittinan101"]
related: ["PLAN-001", "PLAN-002"]
tags: ["setup", "checklist", "living-document"]
updated: 2026-07-18
classification: internal
---

# Javis AI — Setup Plan & Checklist

> Living document — ทุกครั้งที่ทำ task เสร็จ ให้อัปเดตไฟล์นี้ (ติ๊ก checkbox + ใส่วันที่/หมายเหตุ)

## Phase 1 — Knowledge Base bootstrap ✅ เสร็จ (เหลือ optional 1 ข้อ)

- [x] สร้าง private repo `kittinan101/javis-kb` (2026-07-18, ผ่าน n8n + GitHub PAT)
- [x] Push starter 18 ไฟล์ — commit `75d2381` "chore: init javis-kb starter" (2026-07-18)
- [x] สร้าง n8n workflow ถาวร **"Javis KB - Push files (utility)"** (id: `qfYKrBJkXqKUlNyB`) สำหรับ push เอกสารเข้า KB (2026-07-18)
- [x] แก้บั๊ก utility workflow: เพิ่ม `base_tree` กันไฟล์เดิมหลุดจาก HEAD (2026-07-18)
- [x] Archive one-shot setup workflows ที่ซ้ำ 5 ตัวใน n8n (2026-07-18)
- [x] เพิ่มไฟล์ plan/checklist นี้เข้า repo (2026-07-18)
- [x] เพิ่ม `javis-kb` เข้า GitHub MCP installation + reconnect connector (2026-07-18)
- [x] ยืนยัน Claude **อ่าน** `javis-kb` ผ่าน GitHub MCP ได้ (2026-07-18)
- [ ] (optional) เปิดสิทธิ์ **เขียน** ผ่าน GitHub MCP — ตอนนี้เขียนติด 403 (read-only) ให้เข้า github.com/settings/installations > Configure แล้วดูว่ามี permission request ค้างอนุมัติไหม / Contents เป็น Read & write ไหม — ไม่บล็อกงาน เพราะเขียนผ่าน n8n utility ได้

**ช่องทางทำงานกับ KB ตอนนี้:** อ่าน = GitHub MCP | เขียน = n8n "Javis KB - Push files (utility)"

## แผนงานเต็มทุก Phase — ดู PLAN-001 ถึง PLAN-005

> 2026-07-18: ออกแบบ plan ล่วงหน้าครบทุก step แล้ว — task breakdown เต็มอยู่ในไฟล์เหล่านี้:

- [PLAN-001 — Master Roadmap](PLAN-001-master-roadmap.md) (ภาพรวม + dependency + เกณฑ์ผ่านทุก Phase)
- [PLAN-002 — Phase 1: Foundation + Q&A Bot](PLAN-002-phase1-foundation-qa.md) ← **ถัดไป: เริ่มที่นี่** (รวม content ingestion จาก Notion ใน T1.2)
- [PLAN-003 — Phase 2: Team Upload + Impact Analysis + Figma](PLAN-003-phase2-upload-impact-figma.md)
- [PLAN-004 — Phase 3: Plan Generator + Doc Generator](PLAN-004-phase3-plan-doc-generator.md)
- [PLAN-005 — Phase 4: Autonomous Dev Agent](PLAN-005-phase4-dev-agent.md)

---

## Log

| วันที่ | เหตุการณ์ |
|---|---|
| 2026-07-18 | Bootstrap repo + starter files + utility workflow |
| 2026-07-18 | พบบั๊ก utility workflow ไม่ใส่ base_tree ทำให้ commit `a64004e` ทำ starter หลุดจาก HEAD → แก้ workflow + commit กู้ไฟล์คืนครบ |
| 2026-07-18 | เพิ่ม plans/setup-checklist.md (ไฟล์นี้) |
| 2026-07-18 | GitHub MCP เชื่อม `javis-kb` สำเร็จ (อ่านได้; เขียนยัง 403 read-only) — Phase 1 ปิดจ๊อบ 🎉 |
| 2026-07-18 | ออกแบบ plan ทุก Phase ล่วงหน้า (PLAN-001..005) + แก้ frontmatter ไฟล์นี้ให้ผ่าน CI schema |
| 2026-07-18 | ติดตั้ง pre-commit hook (gitleaks 8.30.1 + validator) บนเครื่อง dev + เพิ่ม .gitignore |
| 2026-07-18 | Design review รอบ 1 — 9 มุม (dev/frontend/backend/uxui/QA/tech lead/dev lead/PM/BA) โดย reviewer อิสระ 5 กลุ่ม → blocker 13 + major ~30 → แก้เข้า plan ครบ ดู [ADR-002](../domains/javis/decisions/ADR-002-design-review-round1.md) — **ก่อนเริ่ม PLAN-002 ต้องเติม Roster/Capacity/Budget จริง (PLAN-001 §4)** |
| 2026-07-18 | เริ่ม PLAN-002: T1.1 glossary เสร็จ (+35 คำ), T1.2 import 2 ไฟล์แรก (DOM-002 vision, DOM-003 impl spec) — งานถัดไป: import System Design Phase 1 + เอกสารทีม, เติม Roster/Budget (T1.5) |
| 2026-07-18 | เพิ่ม Claude Code SessionStart hook (`.claude/settings.json`) inject standing workflow (review 9 มุม → แบ่ง commit → update status → ทำ task ต่อ) จาก `.claude/workflow-instructions.md` ทุก session |
| 2026-07-18 | T1.2 ต่อ: import System Design Phase 1 (→ `domains/taskbot/`) + Wiki ทีม 3 ไฟล์ (engineering standards, QA guidelines, onboarding — ยังเป็นโครง ⚠️ รอทีมเติม) — KB รวม 15 ไฟล์ผ่าน validation |
| 2026-07-18 | T1.6 draft: `templates/chat/message-catalog.md` — message catalog + flow diagram ครบ intent Phase 1 (qa/register/help) — **รอทีม review 1 รอบก่อนเริ่ม build สัปดาห์ 2** |
| 2026-07-18 | Groundwork เพิ่ม: `prompts/qa-system.md` v1 (T2.4) + `eval/qa-set.yaml` draft 30 คู่ (T4.1) — สำรวจ n8n ผ่าน MCP: credentials พร้อมครบ (Postgres, LINE bearer, Anthropic, GitHub) + taskbot workflows ยัง active → **T1.4 สร้าง javis-core ทำผ่าน n8n ได้ แต่ต้องทำผ่าน repo javis-core + prisma migrate ตาม ADR-002 (ห้ามรัน DDL มือ) — งานถัดไป** |
