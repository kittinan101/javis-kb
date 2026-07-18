---
title: "Phase 2 — Team Upload ผ่านแชท + Impact Analysis + Figma"
id: PLAN-003
domain: javis
type: plan
status: draft
lang: th
owners: ["kittinan101"]
related: ["PLAN-001", "PLAN-002", "PLAN-004"]
has_migration: false
risk: medium
tags: ["phase-2", "upload", "impact-analysis", "figma", "rbac"]
updated: 2026-07-18
classification: internal
---

# PLAN-003: Phase 2 — Team Upload ผ่านแชท + Impact Analysis + Figma

> ระยะเวลา: 3–4 สัปดาห์ | เริ่มได้เมื่อ PLAN-002 ผ่าน DoD (accuracy > 80%, adoption > 50%)
> อ้างอิง: Notion Feature 2, Feature 3 + Implementation Spec v1.1 §2.B, §3

## 1. Requirement Summary

1. ทีม (รวม non-dev) ส่งเนื้อหา/ไฟล์เข้า KB ผ่านแชท — ระบบแปลงเป็น Markdown + frontmatter + scan secret → commit ให้อัตโนมัติ
2. Javis วิเคราะห์ impact ของฟีเจอร์ใหม่จาก KB: component ที่กระทบ, API, DB, ความขัดแย้งกับ decision เดิม
3. เชื่อม Figma เป็น knowledge source ที่ 3 (design context)

## 2. Scope (In / Out)

**In:** upload ข้อความ + ไฟล์ (PDF/docx) ผ่าน LINE/Telegram, permission model บังคับใช้จริง, Impact Analysis flow, Figma REST API + cache, docs-drift alert
**Out:** Plan Generator (Phase 3), การแก้เอกสารเดิมผ่านแชท (dev แก้ผ่าน git ตาม CONTRIBUTING.md), Slack/Discord

## 3. Impact Analysis

- เพิ่ม **สิทธิ์เขียน** เข้า repo จากแชท → ความเสี่ยงหลักของ phase นี้ คุมด้วย: RBAC (Contributor ขึ้นไป) + gitleaks scan ก่อน commit ทุกครั้ง + PR review flow (optional ต่อ config)
- Q&A flow เดิม (PLAN-002) ไม่ถูกแก้ — เพิ่ม intent ใหม่ที่ Router เท่านั้น
- เพิ่มการเรียก Figma API → ต้องมี PAT ใหม่ (scope read อย่างเดียว)

## 4. Technical Approach

- n8n Router (Switch ตาม intent จาก Haiku classifier): `qa` (เดิม) | `upload` | `impact` — เพิ่ม 2 branch ใหม่
- เขียนเข้า repo ใช้ n8n workflow **"Javis KB - Push files (utility)"** (id: `qfYKrBJkXqKUlNyB`) ที่มีอยู่แล้ว — มี `base_tree` กันไฟล์เดิมหลุด
- Figma: **REST API + PAT เท่านั้น** (official MCP รัน headless ไม่ได้ — ปฏิเสธ PAT) → cache JSON ลง `figma/` ใน repo นี้

## 5. Task Breakdown + Acceptance Criteria

### สัปดาห์ 1 — Permission model + Upload ข้อความ

#### T1.1 บังคับใช้ Permission Model
- [ ] ทุก intent เช็ค role ก่อนทำงานตามตาราง governance: ถาม Q&A = ทุก role / อัพโหลด KB = Contributor ขึ้นไป
- [ ] ไม่มีสิทธิ์ → ตอบสุภาพ + บอกว่าต้องขอสิทธิ์จากใคร (Admin)
- [ ] คำสั่ง Admin ในแชท: `javis role set <email> CONTRIBUTOR` (เช็ค role=ADMIN)
- **AC:** VIEWER ลอง upload → ถูกปฏิเสธพร้อมคำแนะนำ; Contributor ทำได้; Admin เปลี่ยน role ผ่านแชทได้ทันที

#### T1.2 Upload ข้อความ ("Javis เก็บ meeting note นี้หน่อย")
- [ ] Haiku classifier จับ intent `upload` → ถามยืนยันประเภทเอกสาร (meeting-note / guide / feature) ถ้าไม่ชัด
- [ ] Claude แปลงข้อความเป็น Markdown ตาม template ใน `templates/` + frontmatter ครบ (owners = ผู้ส่ง, updated = วันนี้, **`source: chat-upload` เป็น provenance** — flow ความเสี่ยงสูงเลือกกรองได้)
- [ ] **ID allocation กันชนกัน:** จองเลขจาก sequence ใน javis-core DB (`SELECT ... FOR UPDATE` + increment) — ห้ามอ่านจากโฟลเดอร์ (read-then-allocate race เมื่อ upload พร้อมกัน) + utility workflow ตั้ง concurrency=1 + retry-on-conflict เมื่อ push ชน
- [ ] Validate frontmatter ด้วย **script เดียวกับ CI** (`validate-frontmatter.mjs` — ห้าม duplicate logic ใน Code node แล้ว drift) — ไม่ผ่าน = แก้อัตโนมัติ 1 รอบ, ยังไม่ผ่าน = แจ้ง user เป็นภาษาคน + บอก action ถัดไป + เก็บ draft escalate หา Admin (**ห้ามทิ้งเนื้อหา user หาย**)
- [ ] Scan ด้วย gitleaks rules (Thai PII + secrets) + **injection-pattern scan** — เจอ = reject + แจ้งประเภทข้อมูลที่ติด
- [ ] **Preview ก่อน commit:** สรุป title/ประเภท/โฟลเดอร์ปลายทาง + ปุ่มยืนยัน/แก้ 1 ครั้งก่อน push
- [ ] Push ผ่าน utility workflow — **จำกัดโฟลเดอร์ปลายทางเฉพาะ `guides/`, `features/`, `domains/`, `figma/`** (ห้ามแตะ `plans/`, `scripts/`, `.github/` — กันปลอม plan/แก้ CI ผ่านแชท) + **ปฏิเสธการ overwrite ไฟล์ที่มีอยู่** → commit: `docs(<domain>): <สรุป> (via Javis, by <user>)` → ตอบลิงก์ไฟล์
- **AC (ทดสอบจริง):** ส่ง meeting note ไทยผ่าน LINE → เห็น preview → ยืนยัน → ไฟล์เข้าโฟลเดอร์ถูก ผ่าน CI; 2 คน upload ห่างกัน < 10 วิ → id ไม่ซ้ำ ทั้งคู่สำเร็จ; เบอร์โทรปลอม → reject; ลอง upload ทับไฟล์เดิม / ลง `plans/` → ถูกปฏิเสธ

#### T1.3 PR review flow (default **เปิด**)
- [ ] `SystemConfig.upload_requires_pr` **default `true`**: push เข้า branch `kb/<job_id>` + เปิด PR — ตรงกับ CONTRIBUTING.md ("ระบบเปิด PR ให้อัตโนมัติ") และเป็น defense หลักต่อ **KB poisoning**: เนื้อหาจากแชทถูกอ่านโดย Q&A/Impact/Plan Generator ทุกตัว ถ้าเข้า main ตรงโดยไม่มีคน review = ช่องฝัง instruction บิดคำตอบทั้งระบบ — ผ่อนเป็น `false` ได้เมื่อ pipeline นิ่ง + ทีม review ไหว
- **AC:** upload ปกติเกิดเป็น PR ไม่ใช่ push ตรง; เปลี่ยนค่าใน DB แล้วพฤติกรรมเปลี่ยนทันทีโดยไม่แก้ workflow

### สัปดาห์ 2 — Upload ไฟล์ (PDF / docx)

#### T2.1 รับไฟล์จากแชท
- [ ] LINE: ดึง binary ผ่าน `GET /v2/bot/message/{messageId}/content` / Telegram: `getFile` + download
- [ ] จำกัดขนาด ≤ 20MB + ชนิดไฟล์ pdf/docx/txt/md เท่านั้น — เกิน/ผิดชนิด = ตอบปฏิเสธพร้อมเหตุผล
- **AC:** ส่ง PDF ผ่านทั้ง 2 channel → ระบบได้ไฟล์ครบ; ส่ง .exe → ถูกปฏิเสธ

#### T2.2 แปลงไฟล์ → Markdown
- [ ] `pandoc` (docx) / pdf extractor (pdftotext หรือ Claude vision กับไฟล์สแกน) → Markdown
- [ ] เข้า pipeline เดียวกับ T1.2 (frontmatter + validate + gitleaks + push)
- [ ] แนบไฟล์ต้นฉบับ? **ไม่เก็บ binary ใน repo** — เก็บเฉพาะ Markdown (บันทึกชื่อไฟล์ต้นฉบับใน frontmatter `tags`)
- **AC:** ส่ง docx meeting note → ได้ Markdown อ่านรู้เรื่องใน repo, ตาราง/หัวข้อไม่เละ

### สัปดาห์ 3 — Impact Analysis + Figma

#### T3.1 Figma integration (REST API + PAT)
- [ ] สร้าง Figma PAT scope `file_content:read` + `file_metadata:read` → เก็บใน n8n Credentials
- [ ] **Mapping "Figma file key ↔ FEAT-id" มีเจ้าของ:** designer ลงทะเบียนผ่านแชท (วางลิงก์ Figma + ระบุ feature) หรือใส่ frontmatter `figma:` ใน FEAT doc → เก็บ mapping ใน javis-core DB (ไม่ใช่ magic ที่ไม่รู้ที่มา)
- [ ] n8n workflow `javis-figma-sync`: ดึง `GET /v1/files/:key` + `/nodes` → cache ลง `figma/<FEAT-id>-screens.json` — **commit เฉพาะเมื่อ content hash เปลี่ยน** (กัน commit noise)
- [ ] Sync **on-demand** เมื่อถูกถามและ cache อายุ > 1 วัน (ตัด cron รายวัน — ลด ops load)
- [ ] Design เปลี่ยน (hash เปลี่ยน) → แจ้ง owners ของ FEAT ที่เกี่ยว (กลไกเดียวกับ drift alert T3.3) — ปิด gap "dev ทำงานกับ design เก่า"
- **AC:** ถาม "หน้า login มี field อะไรบ้าง" → ตอบจาก cache พร้อมลิงก์ design; designer ลงทะเบียนไฟล์ใหม่ผ่านแชทได้เอง; design เปลี่ยน → owners ได้แจ้งเตือน

#### T3.2 Impact Analysis flow
- [ ] intent `impact` → ดึงเอกสารทั้ง domain ที่เกี่ยว + decisions ทั้งหมด + figma cache → เรียก Claude (**Opus** — งานวิเคราะห์ยาก) ด้วย prompt Spec §5b วิเคราะห์ 6 หัวข้อ:
  1. โมดูล/โดเมนที่กระทบ + citation
  2. API: breaking / non-breaking
  3. DB schema + migration (additive/destructive)
  4. Dependencies + Figma screens ที่กระทบ
  5. ความเสี่ยง + จุดที่ต้องทดสอบ
  6. ขนาดงาน S/M/L + open questions
- [ ] ข้อมูลไม่พอ → ตอบ "ต้องการข้อมูลเพิ่ม: ..." ห้ามเดา
- [ ] ผลลัพธ์ผ่าน Reply Formatter (PLAN-002 T2.5): **สรุปย่อในแชท + รายงานเต็มเป็นลิงก์/ไฟล์** (รายงาน 6 หัวข้อยาวเกิน limit ข้อความแชทแน่นอน) + option "เก็บเข้า KB ไหม?"
- **AC:** ทดสอบ 3 โจทย์จริง (เช่น "เพิ่ม file upload") → SA review ว่ารายงานถูกต้อง ≥ 2 ใน 3, ทุก claim มี citation, ไม่มีการเดา component ที่ไม่มีอยู่จริง

#### T3.3 Docs-drift alert
- [ ] n8n cron: เทียบ commit ล่าสุดของ code repo กับ `updated` ของเอกสาร domain ที่เกี่ยว — code เปลี่ยนแต่ docs ไม่เปลี่ยน > 14 วัน → แจ้งเตือน owners ในแชท
- [ ] (code repo จะเกิดจริงใน Phase 4 — ทำ logic รอไว้ + ทดสอบกับ repo นี้เอง)
- **AC:** จำลอง commit ใน repo ทดสอบ → owners ได้รับแจ้งเตือนพร้อมรายชื่อไฟล์ docs ที่ควรอัพเดต

### สัปดาห์ 4 — ทดสอบรวม + เก็บตก
- [ ] ทีม non-dev อย่างน้อย 2 คนทดลอง upload จริง (meeting note + ไฟล์) โดยไม่มี dev ช่วย
- [ ] อัพเดต eval set: เพิ่มคำถามที่ตอบได้จากเอกสารที่ upload ใหม่ + rerun eval → accuracy ต้องไม่ตกจาก Phase 1
- [ ] เขียน `guides/GUIDE-xxx-upload-via-chat.md` (วิธีใช้สำหรับทีม) + ประกาศในแชท
- **AC (= DoD Phase 2):** ทีม non-dev เพิ่มเนื้อหาเองได้; impact report ผ่าน SA review; eval accuracy ไม่ตก

## 6. Migration Gate

ไม่มี product DB migration — javis-core เพิ่มค่า config ใหม่ (`upload_requires_pr`) เท่านั้น

## 7. Risks & Rollback

| Risk | Mitigation |
|---|---|
| เนื้อหาขยะ/ผิดที่เข้า KB | frontmatter validate + ประเภทเอกสารยืนยันก่อน + `upload_requires_pr=true` ช่วงแรก |
| PII หลุดผ่านแชท | gitleaks scan ใน pipeline ก่อน push ทุกครั้ง (T1.2) — เจอแล้ว reject ตั้งแต่ต้นทาง |
| Figma PAT หลุด | scope read-only + เก็บใน n8n Credentials + rotate ได้จุดเดียว |
| Impact report มั่ว (hallucinate component) | prompt ห้ามเดา + AC บังคับ SA review ก่อนประกาศใช้ + ใช้ Opus |
| utility workflow ทำไฟล์เดิมหลุด | มี `base_tree` แล้ว (แก้เมื่อ 2026-07-18) + ทุก push ตรวจ diff file count ก่อน commit |

Rollback: ปิด intent `upload`/`impact` ที่ Router = กลับสู่ Q&A อย่างเดียวทันที; เนื้อหาที่ push ผิดลบด้วย revert commit ใน git

---
## Approvals
<!-- ระบบเติมอัตโนมัติ: ผู้ approve + เวลา -->
