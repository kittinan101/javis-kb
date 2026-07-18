---
title: "Javis AI — ภาพรวมระบบ (Vision & Features)"
id: DOM-002-javis
domain: javis
type: overview
status: approved
lang: mixed
owners: ["kittinan101"]
related: ["PLAN-001", "ADR-002", "DOM-003-javis-implementation-spec"]
tags: ["javis", "vision", "features", "architecture"]
updated: 2026-07-18
classification: internal
---

# Javis AI — ภาพรวมระบบ

> Import จาก Notion "🤖 Javis AI" (ปรับปรุงล่าสุด 2026-07-17) — สรุปเฉพาะแก่น รายละเอียด implementation ดู [DOM-003](implementation-spec.md) และ task breakdown ดู [PLAN-001](../../plans/PLAN-001-master-roadmap.md)

## Javis คืออะไร

ผู้ช่วย AI ของทีมพัฒนาซอฟต์แวร์ ใช้ **repo javis-kb (ที่นี่) เป็น source of truth เดียว** — ตอบคำถามทีม, วิเคราะห์ผลกระทบ, สร้างแผนงานและเอกสาร และ (phase ท้าย) เป็น dev agent ที่เขียนโค้ดจาก plan ที่ approve แล้ว

## Features ทั้ง 6

| # | Feature | สรุป | Phase |
|---|---|---|---|
| F1 | **Ask Javis (Q&A)** | ถามภาษาธรรมชาติผ่านแชท → ตอบจาก KB เท่านั้น พร้อม citation — ไม่รู้ต้องบอกว่าไม่รู้ ห้ามเดา | 1 |
| F2 | **Impact Analysis** | บอกผลกระทบก่อน build: component/API/DB ที่โดน, ความขัดแย้งกับ decision เดิม, ความเสี่ยง, ขนาดงาน | 2 |
| F3 | **Team Chat & Upload** | ทีม (รวม non-dev) ถาม + ส่งเนื้อหาเข้า KB ผ่านแชท — ระบบแปลงเป็น Markdown + เปิด PR ให้ | 2 |
| F4 | **Plan Generator** | requirement ในแชท → ถามเจาะ → plan ที่ ground กับ KB จริง → approve ผ่านปุ่มในแชท | 3 |
| F5 | **Autonomous Dev Agent** | agent อ่าน plan ที่ approve → เขียนโค้ด → PR → deploy → test — human gate ทุกจุดสำคัญ | 4 |
| F6 | **Document Generator** | BRD / API Spec / Data Dictionary / TDD เป็น PDF ไทย — เนื้อหาจาก KB + โค้ดจริงเท่านั้น | 3 |

## Knowledge Sources (3 แหล่ง)

1. **Docs repo (javis-kb)** — เอกสาร, decisions, plans, meeting notes → ฐานของ RAG
2. **Code repo** — โค้ดจริง (เกิด Phase 4) สำหรับ impact analysis / API spec / data dictionary
3. **Figma** — design context ผ่าน REST API + PAT (cache ลง `figma/` — ทีม design ทำงานปกติ Javis อ่านเอง)

## สถาปัตยกรรมหลัก

- **n8n** = hub กลาง: รับแชท (LINE + Telegram รอบแรก) → Normalizer → RBAC → Router ตาม intent → ตอบกลับ
- **Claude API** + citations + prompt caching — model routing: Haiku (classify) / Sonnet (Q&A, plan) / Opus (impact)
- **javis-core DB** (Postgres) — identity/RBAC, session, config, job queue, audit — แยกจาก product DB เด็ดขาด
- **Dev Agent = Option B: Self-hosted Mac mini** + Claude Code headless — cost คงที่, ออกแบบ portable ไป cloud (Option A) ได้
- **Branch strategy:** `develop` (Dev) → `uat` (UAT) → `main` (Prod) — ทุก protected branch ต้องผ่าน PR + human approval

## Governance (สรุป)

- **7 roles:** VIEWER / CONTRIBUTOR / DEVELOPER / LEAD_SA / PM_PO / QA / ADMIN — ทุก action เช็ค role
- **Approval gates:** plan (Lead+PO) → PR review (dev) → UAT sign-off (PO+QA) → prod (Lead+PO)
- **AI ห้ามเด็ดขาด:** push ตรง protected branch, รัน migration บน uat/prod, ลบข้อมูล, แตะ prod credentials
- **Data classification:** ห้าม credentials / PII / การเงิน-HR / เอกสารกฎหมายลับ เข้า KB (gitleaks บังคับ 3 ชั้น)
- **Success metrics:** accuracy > 80% (P1) → 90% (P4), hallucination < 10% → < 3%, adoption > 50% → 80%

## Roadmap

Phase 1 (Q&A) → Phase 2 (Upload + Impact + Figma) → Phase 3 (Plan + Doc Generator) → Phase 4 (Dev Agent) — เกณฑ์ผ่านและ task breakdown เต็มอยู่ใน [PLAN-001](../../plans/PLAN-001-master-roadmap.md) ถึง PLAN-005; ผล design review 9 มุมดู [ADR-002](decisions/ADR-002-design-review-round1.md)
