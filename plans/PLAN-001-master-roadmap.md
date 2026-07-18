---
title: "Javis AI — Master Roadmap (ทุก Phase)"
id: PLAN-001
domain: javis
type: plan
status: approved
lang: th
owners: ["kittinan101"]
related: ["PLAN-002", "PLAN-003", "PLAN-004", "PLAN-005"]
has_migration: false
risk: medium
tags: ["roadmap", "master-plan", "javis"]
updated: 2026-07-18
classification: internal
---

# PLAN-001: Javis AI — Master Roadmap (ทุก Phase)

> Plan แม่ของทั้งโปรเจกต์ — สรุปลำดับงาน, dependency, เกณฑ์ผ่านแต่ละ Phase
> รายละเอียด task breakdown อยู่ใน plan ลูกของแต่ละ Phase (PLAN-002 ถึง PLAN-005)
> อ้างอิง: Notion "Javis AI" (vision + gap analysis) และ "Implementation Spec (Technical Design v1.1)"

## 1. Requirement Summary

สร้างระบบ Javis AI ครบทั้ง 6 features ตามลำดับความเสี่ยง — เริ่มจาก Q&A bot ที่พิสูจน์คุณค่าได้เร็ว แล้วค่อยเพิ่มสิทธิ์ให้ AI ทีละขั้นจนถึง Autonomous Dev Agent

| Feature | อยู่ใน Phase |
|---|---|
| F1: Ask Javis (Q&A + citations) | Phase 1 |
| F3: Team Chat & Content Upload | Phase 2 |
| F2: Impact Analysis (+ Figma) | Phase 2 |
| F4: Requirement → Plan Generator | Phase 3 |
| F6: Document Generator (BRD/API Spec/Data Dict) | Phase 3 |
| F5: Autonomous Dev Agent | Phase 4 |

## 2. Scope (In / Out)

**In:**
- Chat channel รอบแรก: **LINE + Telegram** เท่านั้น
- Dev Agent แบบ **Option B (Self-hosted Mac mini)** ตามข้อสรุปใน Notion
- Stack ตาม Implementation Spec: n8n hub, Claude API + citations, Next.js 15 + Prisma + PostgreSQL 16 (product), Typst + Sarabun (PDF ไทย)

**Out (เก็บเป็น phase ถัดไป — design มีแล้วใน Notion):**
- Slack / Discord channel
- pgvector semantic search (ทำเมื่อ docs > 500 ไฟล์ หรือ accuracy ตกเกณฑ์)
- Cloud runner (Option A) — ออกแบบให้ portable ไว้ ย้ายได้ทีหลัง

## 3. Impact Analysis

- โปรเจกต์ greenfield — ยังไม่มีระบบ production ที่จะกระทบ
- จุดพึ่งพิงหลัก: **n8n เป็น single point of failure** ของทุก flow → มี backup/health check ใน PLAN-002
- ข้อมูลภายในถูกส่งไป Claude API → บังคับใช้ Data Classification (ดู CONTRIBUTING.md) + gitleaks ทุกชั้น

## 4. Technical Approach — ลำดับและ Dependency

```
PLAN-002 (Phase 1: Foundation + Q&A, 2–4 สัปดาห์)
   │  ต้องผ่านเกณฑ์ก่อน จึงเริ่ม ↓
PLAN-003 (Phase 2: Upload + Impact Analysis + Figma, 3–4 สัปดาห์)
   │  permission model จาก Phase 2 เป็นฐานของ ↓
PLAN-004 (Phase 3: Plan Generator + Doc Generator, 3–4 สัปดาห์)
   │  plan ที่ approve แล้วคือ input ของ ↓
PLAN-005 (Phase 4: Dev Agent self-hosted, 4–8 สัปดาห์)
```

กติกาการทำงานกับ plan ลูก:
1. เริ่ม Phase → เปลี่ยน `status` ของ plan ลูกเป็น `in_progress`
2. ทำ task ตามลำดับ ติ๊ก checkbox + อัพเดต field `updated` ทุกครั้งที่แก้
3. จบ Phase → ตรวจ Definition of Done ของ plan นั้น → เปลี่ยน `status: done` → เริ่ม plan ถัดไป
4. ทุกการตัดสินใจที่เปลี่ยนจาก spec เดิม → เขียน ADR ลง `domains/javis/decisions/`

**Prerequisite ก่อนเริ่ม PLAN-002 (จาก design review — ดู [[ADR-002]]):**
- **Roster:** map คนจริง → ทุก role (LEAD_SA, PM_PO, QA, ADMIN + ผู้รับบท DBA) — approval gate ทุกตัวในทุก phase อ้าง role เหล่านี้ ถ้ากำลังคนไม่พอ **ปรับ gate ให้ตรงความจริง** (เช่น 1 reviewer + cooling period 24 ชม. แทน 2 reviewers) ก่อนตั้ง branch protection — gate ที่บังคับใช้ได้จริงดีกว่า gate สวยหรูที่ต้องแอบ bypass
- **Capacity assumption:** ระบุ ชม./สัปดาห์ ที่ลงได้จริง — timeline ในแผนคิดแบบ dedicated; ทำ part-time ให้คูณ ~1.5–2 เท่า
- **Budget รวม:** เอกสาร 1 หน้า (Mac mini + Claude API + Railway/Render + LINE OA + GitHub Team plan) + ผู้อนุมัติ + seed `SystemConfig.budget_monthly_usd`

**นโยบาย gate ระหว่าง phase (แก้จาก review):** accuracy = **hard gate** / adoption = **health metric** ที่ต้องมี action plan แต่ไม่ block phase ถัดไป — ไม่งั้นเกิด chicken-and-egg: ฟีเจอร์ที่ดึง non-dev เข้ามาใช้คือ upload ซึ่งอยู่ Phase 2 เอง; accuracy ช่วง 70–80% → remediation +2 สัปดาห์ (เพิ่ม doc coverage) แล้ววัดใหม่ / ต่ำกว่า 70% ซ้ำ → หยุดทบทวนแนวทาง

## 5. Task Breakdown + Acceptance Criteria

Breakdown เต็มอยู่ใน plan ลูก — ตารางนี้คือ milestone + เกณฑ์ผ่านระดับ Phase:

| Phase | Plan | เกณฑ์ผ่าน (Definition of Done) |
|---|---|---|
| 1 | [PLAN-002](PLAN-002-phase1-foundation-qa.md) | ถามไทยผ่าน LINE+Telegram ได้คำตอบ+citation, eval accuracy > 80%, ทีมใช้จริง > 50% |
| 2 | [PLAN-003](PLAN-003-phase2-upload-impact-figma.md) | ทีม non-dev เพิ่มเนื้อหาเองได้ผ่านแชท, impact report ถูกต้องจากการ review ของ SA |
| 3 | [PLAN-004](PLAN-004-phase3-plan-doc-generator.md) | plan ที่ generate ใช้จริงโดยแก้ < 20%, PDF ไทย (Sarabun) ออกจากระบบได้ |
| 4 | [PLAN-005](PLAN-005-phase4-dev-agent.md) | PR จาก agent ผ่าน review โดยแก้น้อย > 70%, ไม่มี incident จากโค้ด agent ใน prod |

**Success metrics ระยะยาว** (วัดอัตโนมัติ รายงานต้นเดือนในแชท):

| Metric | เป้า Phase 1 | เป้า Phase 4 |
|---|---|---|
| Answer accuracy (eval set รายสัปดาห์) | > 80% | > 90% |
| Hallucination rate | < 10% | < 3% |
| Adoption (active user/สัปดาห์) | > 50% ของทีม | > 80% |
| 👍 rate จาก feedback | > 70% | > 85% |
| เวลาที่ประหยัด/คน/สัปดาห์ | วัด baseline | > 5 ชม. |

หมายเหตุการวัด (จาก review): ทีมเล็ก % จะ noisy — รายงานตัวเลข absolute ควบคู่ (จำนวนคน/จำนวนคำถาม); denominator = จำนวน `User` ที่ลงทะเบียน, active = ถาม ≥ 1 ครั้ง/สัปดาห์ (จาก AuditLog); "เวลาที่ประหยัด" วัดด้วย survey (baseline ใน PLAN-002 T1.5 + ท้ายทุก phase) ไม่ใช่อัตโนมัติ

## 6. Migration Gate

- Phase 1–3 ไม่มี product DB migration (มีแต่ javis-core DB ซึ่ง Admin จัดการเอง)
- Phase 4: agent สร้าง migration ด้วย `prisma migrate dev --create-only` เท่านั้น — **additive-only**, ห้ามรัน `migrate deploy` บน uat/prod (มนุษย์รันผ่าน approved CI step) — รายละเอียดใน PLAN-005

## 7. Risks & Rollback

| Risk | Mitigation |
|---|---|
| n8n ล่ม = ทุก flow หยุด | export workflows รายสัปดาห์เข้า repo, uptime monitor, restore runbook (PLAN-002 T4.4) |
| ค่า Claude API บานปลาย | model routing (Haiku classify / Sonnet default / Opus งานยาก), prompt caching, budget alert 80% + kill-switch |
| Secret/PII หลุดเข้า KB | gitleaks 3 จุด (pre-commit, CI, runner) + custom Thai PII rules |
| เอกสาร drift จากโค้ด | n8n alert เมื่อ code repo เปลี่ยนแต่ docs ไม่เปลี่ยน (PLAN-003) |
| Vendor lock-in (Anthropic) | KB เป็น Markdown กลาง, abstraction layer ที่ n8n — เปลี่ยน model ได้ที่จุดเดียว |
| ทีมไม่ adopt | feedback loop 👍👎, Getting Started guide, วัด adoption ทุกสัปดาห์ |
| **Bus factor = 1** (Admin/เครื่อง/secrets ที่คนเดียว) | shared vault ของทีม, Admin คนที่ 2 ที่ซ้อม restore จริง (PLAN-002 T4.4), runbook ทั้งหมดใน repo |
| เครื่อง runner อยู่บ้าน (ไฟดับ/เน็ตหลุด) | UPS + เน็ตสำรอง, งานค้างคิวใน DB รอเครื่องกลับ (ไม่หาย), แผน burst ไป Option A |

Rollback ระดับ phase: ทุก phase เพิ่มความสามารถแบบ additive — ปิด flow ใหม่ใน n8n ได้ทันทีโดยไม่กระทบ phase ก่อนหน้า

---
## Approvals
<!-- ระบบเติมอัตโนมัติ: ผู้ approve + เวลา -->
- kittinan101 — 2026-07-18 (initial roadmap)
