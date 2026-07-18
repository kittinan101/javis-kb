---
title: Javis AI — Setup Plan & Checklist
status: active
owner: kittinan101
updated: 2026-07-18
---

# Javis AI — Setup Plan & Checklist

> Living document — ทุกครั้งที่ทำ task เสร็จ ให้อัปเดตไฟล์นี้ (ติ๊ก checkbox + ใส่วันที่/หมายเหตุ)

## Phase 1 — Knowledge Base bootstrap

- [x] สร้าง private repo `kittinan101/javis-kb` (2026-07-18, ผ่าน n8n + GitHub PAT)
- [x] Push starter 18 ไฟล์ — commit `75d2381` "chore: init javis-kb starter" (2026-07-18)
- [x] สร้าง n8n workflow ถาวร **"Javis KB - Push files (utility)"** (id: `qfYKrBJkXqKUlNyB`) สำหรับ push เอกสารเข้า KB (2026-07-18)
- [x] แก้บั๊ก utility workflow: เพิ่ม `base_tree` กันไฟล์เดิมหลุดจาก HEAD (2026-07-18)
- [x] Archive one-shot setup workflows ที่ซ้ำ 5 ตัวใน n8n (2026-07-18)
- [x] เพิ่มไฟล์ plan/checklist นี้เข้า repo (2026-07-18)
- [ ] **[รอ user ทำเอง]** เพิ่ม `javis-kb` เข้า GitHub MCP installation ที่ github.com/settings/installations (เลือก repo เพิ่ม หรือเปลี่ยนเป็น All repositories)
- [ ] ยืนยันว่า Claude อ่าน/เขียน `javis-kb` ผ่าน GitHub MCP connector ได้

## Phase 2 — Content ingestion (ถัดไป)

- [ ] กำหนดรายการเอกสารทีมที่จะ import เข้า `domains/`, `guides/`, `features/` (TBD — รอคุยกัน)
- [ ] Import เอกสารชุดแรกผ่าน utility workflow

## Phase 3 — Javis Q&A wiring (TBD)

- [ ] ออกแบบ flow ให้ Javis ดึงความรู้จาก KB มาตอบคำถามทีม (รายละเอียดรอกำหนด)

---

## Log

| วันที่ | เหตุการณ์ |
|---|---|
| 2026-07-18 | Bootstrap repo + starter files + utility workflow |
| 2026-07-18 | พบบั๊ก utility workflow ไม่ใส่ base_tree ทำให้ commit `a64004e` ทำ starter หลุดจาก HEAD → แก้ workflow + commit กู้ไฟล์คืนครบ |
| 2026-07-18 | เพิ่ม plans/setup-checklist.md (ไฟล์นี้) |
