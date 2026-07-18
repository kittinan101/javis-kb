---
title: "Phase 3 — Plan Generator + Document Generator (PDF ไทย)"
id: PLAN-004
domain: javis
type: plan
status: draft
lang: th
owners: ["kittinan101"]
related: ["PLAN-001", "PLAN-003", "PLAN-005"]
has_migration: false
risk: medium
tags: ["phase-3", "plan-generator", "doc-generator", "typst", "approval-workflow"]
updated: 2026-07-18
classification: internal
---

# PLAN-004: Phase 3 — Plan Generator + Document Generator (PDF ไทย)

> ระยะเวลา: 3–4 สัปดาห์ | เริ่มได้เมื่อ PLAN-003 ผ่าน DoD
> อ้างอิง: Notion Feature 4, Feature 6 + Implementation Spec v1.1 §5c, §7 + Governance §2 (Approval Workflow)

## 1. Requirement Summary

1. **Plan Generator:** บอก requirement ในแชท → Javis ถามเจาะ → วิเคราะห์กับ KB (ใช้ Impact Analysis จาก Phase 2) → สร้าง PLAN-xxx ลง `plans/` → ทีม approve ผ่านปุ่มในแชท
2. **Document Generator:** ขอเอกสารทางการในแชท ("ขอ BRD ของ feature login เป็น PDF") → gen จาก KB → ส่ง PDF ไทย (ฟอนต์ Sarabun) กลับในแชท + เก็บ Markdown ต้นฉบับเข้า repo

## 2. Scope (In / Out)

**In:** Plan Generator multi-turn + approval workflow (ปุ่มในแชท), PDF pipeline (Typst ผ่าน Pandoc + Sarabun), BRD generator, template องค์กร
**Out (รอ code repo เกิดจริงใน Phase 4 — ทำ pipeline รอไว้):** API Spec จาก Zod, Data Dictionary จาก Prisma schema — สร้าง script ไว้ก่อน ใช้จริงเมื่อมี product repo

## 3. Impact Analysis

- ใช้ Impact Analysis flow ของ PLAN-003 เป็น component ภายใน (ไม่แก้ ไม่ duplicate)
- Plan ที่ generate เข้าโฟลเดอร์ `plans/` ของ repo นี้ → ต้องรัน id ไม่ชนกับ plan ที่มีอยู่ (PLAN-001..005 ถูกจองแล้ว — generator ต้องอ่านเลขล่าสุดจากโฟลเดอร์เสมอ)
- Approval workflow เขียนสถานะกลับเข้าไฟล์ plan → เป็น audit trail ถาวร

## 4. Technical Approach

- intent ใหม่ที่ Router: `plan` | `gendoc`
- Plan Generator: Sonnet multi-turn (ConversationSession เดิม) → template `templates/plan.md` → push ผ่าน utility workflow (status: draft)
- Approval: ปุ่มในแชท → n8n เขียน Approvals section + เปลี่ยน status เป็น approved เมื่อครบ 2 role (Lead/SA + PM/PO)
- PDF: `pandoc <doc>.md -o <doc>.pdf --pdf-engine=typst --template=template.typ` + ฟอนต์ Sarabun (SIL OFL) — รันใน n8n execute node หรือเครื่อง runner

## 5. Task Breakdown + Acceptance Criteria

### สัปดาห์ 1 — Plan Generator

#### T1.1 Requirement gathering (multi-turn)
- [ ] intent `plan` → Javis ถามเจาะทีละข้อจนครบ: เป้าหมาย, user ที่ใช้, scope in/out, ข้อจำกัด — ใช้ ConversationSession เดิมจาก PLAN-002
- [ ] ระหว่างถาม รัน Impact Analysis (PLAN-003 T3.2) เบื้องหลังเพื่อเตรียมข้อมูล
- **AC:** บอก "อยากได้ Google login" → Javis ถามกลับอย่างน้อยเรื่อง roles และ existing users ก่อนสร้าง plan

#### T1.2 สร้างไฟล์ PLAN-xxx
- [ ] อ่านเลข PLAN ล่าสุดจาก `plans/` → รันต่อ (ห้าม hardcode)
- [ ] เติม template ตาม `templates/plan.md` ครบ 7 sections — Impact Analysis section มาจาก T1.1, Task Breakdown ทุกข้อต้องมี Acceptance Criteria ที่ทดสอบได้จริง
- [ ] frontmatter: `status: draft`, `has_migration` ตามผลวิเคราะห์, `risk` ตาม impact, `figma:` ลิงก์ design ที่เกี่ยว (ถ้ามีใน cache)
- [ ] push ผ่าน utility workflow → ตอบลิงก์ไฟล์ + สรุปในแชท
- **AC:** plan ที่ได้ผ่าน `node scripts/validate-frontmatter.mjs`, มี AC ทดสอบได้ทุก task, อ้างอิง component ที่มีจริงใน KB เท่านั้น

#### T1.3 Approval workflow (ปุ่มในแชท)
- [ ] plan ใหม่ → n8n ส่งข้อความหา role Lead/SA + PM/PO พร้อมปุ่ม Approve / Request changes (LINE Flex postback / Telegram inline_keyboard)
- [ ] เช็คสิทธิ์: เฉพาะ LEAD_SA และ PM_PO กด approve ได้ — ครบทั้ง 2 role = สถานะ approved
- [ ] เขียนกลับเข้าไฟล์: frontmatter `status: approved` + Approvals section เติม `<ผู้ approve> — <เวลา>` ทุกคน
- [ ] Request changes → กลับสู่ multi-turn แก้ plan → เปิด approve รอบใหม่
- [ ] ทุก action ลง `AuditLog`
- **AC:** Lead กดคนเดียว → ยัง draft; ครบ 2 role → ไฟล์ใน git เปลี่ยนเป็น approved + มีชื่อ+เวลาใน Approvals; QA ลองกด → ถูกปฏิเสธ

### สัปดาห์ 2 — PDF Pipeline + BRD

#### T2.1 PDF pipeline (Typst + Sarabun)
- [ ] ติดตั้ง `typst` + `pandoc` + ฟอนต์ Sarabun บนเครื่องที่รัน pipeline
- [ ] สร้าง `templates/pdf/template.typ`:
```typst
#set text(font: "Sarabun", size: 11pt, lang: "th")
#set page(paper: "a4", margin: 2.5cm, numbering: "1")
```
- [ ] ทดสอบ: `pandoc test.md -o test.pdf --pdf-engine=typst --template=template.typ` ด้วยเอกสารไทยที่มีตาราง + code block + หัวข้อซ้อน
- [ ] เพิ่ม header/logo องค์กร + เลข version + วันที่ ใน template
- **AC:** PDF ไทยสระ/วรรณยุกต์ไม่เพี้ยน, ตารางไม่ล้นหน้า, มี page number + version

#### T2.2 BRD Generator
- [ ] intent `gendoc` ประเภท BRD → รวบรวม requirement + plan + decisions ที่เกี่ยวกับ feature จาก KB → Claude gen ตาม BRD template (สร้าง `templates/brd.md`: Executive Summary, Business Objectives, Scope, Functional Requirements, Non-functional, Assumptions, Approval)
- [ ] เนื้อหามาจาก KB เท่านั้น — ข้อมูลไม่ครบให้ระบุ gap ชัดเจนในเอกสาร ("ยังไม่มีข้อมูล: ...") ห้ามเดา
- [ ] Markdown ต้นฉบับเก็บเข้า repo (`features/` หรือโฟลเดอร์ของ feature) + gen PDF ส่งกลับแชทเป็นไฟล์แนบ
- **AC:** ขอ BRD ของ feature ที่มีข้อมูลใน KB → ได้ PDF สมบูรณ์ + Markdown ใน repo; feature ที่ข้อมูลไม่ครบ → PDF ระบุ gap ไม่มีเนื้อหาเดา

### สัปดาห์ 3 — Doc Generator ที่ผูกกับ code (เตรียมรอ Phase 4)

#### T3.1 API Spec pipeline (script พร้อมใช้)
- [ ] เขียน script ใน code repo template: Zod schema → `@asteasolutions/zod-to-openapi` → `/api/openapi.json` → `widdershins` → Markdown → เข้า PDF pipeline
- [ ] ทดสอบกับ project ตัวอย่าง Next.js เล็กๆ 2 endpoints
- **AC:** รัน 1 คำสั่งจาก openapi.json → ได้ Markdown + PDF โครงสร้างถูก (endpoint, request/response, auth)

#### T3.2 Data Dictionary pipeline (script พร้อมใช้)
- [ ] script อ่าน `prisma/schema.prisma` ผ่าน `@prisma/internals` (getDMMF) → gen ตาราง Markdown: Field / Type / Attributes / Description (จาก `///` comment)
- [ ] ทดสอบกับ schema ตัวอย่าง (ใช้ javis-core schema ได้)
- **AC:** ทุก model/field ใน schema ปรากฏในตาราง, `///` comment มาเป็น Description ครบ

#### T3.3 Version tracking ของเอกสาร generate
- [ ] ทุกเอกสาร gen: frontmatter `updated` + tag `generated`, ชื่อไฟล์คงที่ (gen ซ้ำ = commit ทับ → ประวัติอยู่ใน git history)
- **AC:** gen BRD เดิมซ้ำ 2 ครั้ง → git log แสดง 2 versions diff ได้

### สัปดาห์ 4 — ทดสอบรวม
- [ ] ทดสอบ end-to-end: requirement จริง 2 เรื่องจากทีม → plan → approve → (mock) BRD PDF
- [ ] ทีม review plan ที่ generate: นับ % เนื้อหาที่ต้องแก้
- [ ] เขียน `guides/GUIDE-xxx-plan-generator.md` วิธีใช้ + ตัวอย่างคำสั่ง
- **AC (= DoD Phase 3):** plan ใช้งานได้จริงโดยแก้ < 20% ของเนื้อหา; approval workflow บันทึกผู้อนุมัติครบทุกครั้ง; PDF ไทยพร้อมใช้

## 6. Migration Gate

ไม่มี product DB migration ใน phase นี้ — field `has_migration` ใน plan ที่ generate เป็นตัวส่งสัญญาณให้ Phase 4 บังคับ gate

## 7. Risks & Rollback

| Risk | Mitigation |
|---|---|
| Plan generate มั่ว/อ้าง component ที่ไม่มี | ground ด้วย Impact Analysis + AC บังคับอ้างอิงเฉพาะสิ่งที่มีใน KB + human approve ก่อนใช้เสมอ |
| id ชนกันเมื่อ generate พร้อมกัน | generator อ่านเลขล่าสุด ณ ตอน push + utility workflow เป็น serial queue |
| PDF ไทยเพี้ยน (ฟอนต์/สระ) | ทดสอบ T2.1 ก่อนเปิดใช้ + ยึด Sarabun (ราชการไทย, SIL OFL) |
| Approve โดยคนไม่มีสิทธิ์ | เช็ค role ที่ n8n ทุก callback + ลง AuditLog ทุกการกด |
| widdershins/zod-to-openapi เลิก maintain | เป็น script แยก เปลี่ยนตัวได้โดยไม่กระทบ pipeline หลัก |

Rollback: ปิด intent `plan`/`gendoc` ที่ Router; plan ที่สร้างผิดเปลี่ยน `status: deprecated` (ไม่ลบไฟล์ — เก็บเป็นประวัติ)

---
## Approvals
<!-- ระบบเติมอัตโนมัติ: ผู้ approve + เวลา -->
