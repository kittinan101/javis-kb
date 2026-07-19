---
title: "F7: IDE Integration (Javis MCP) + Code-grounded Answers"
id: FEAT-007
domain: javis
type: feature
status: draft
lang: th
owners: ["kittinan101"]
related: ["PLAN-008", "PLAN-003", "PLAN-004", "PLAN-006"]
has_migration: false
risk: medium
tags: ["mcp", "ide-integration", "retrieval", "source-code", "read-only"]
updated: 2026-07-19
classification: internal
---

# F7: IDE Integration (Javis MCP) + Code-grounded Answers

> ที่มา: คำถาม user 2026-07-19 — "ทีม frontend เชื่อมต่อข้อมูล source code เพื่อตรวจสอบ spec ตอน integrate คล้ายต่อ MCP ของ Figma แต่ไม่แก้ API" + ข้อกำหนดเพิ่ม: **"ถ้าเป็น source code ต้องอ่านจาก repo จริงประกอบ ไม่ใช่ดูแค่ KB md อย่างเดียว"**

## หลักการ (สำคัญที่สุดของ feature นี้)

**Javis = interface (แชท/IDE) — ความรู้มี 2 ชั้น:**

| ชั้น | แหล่ง | ใช้ตอบ | ความน่าเชื่อถือ |
|---|---|---|---|
| 1. Curated docs | repo `javis-kb` (md + frontmatter) | ภาพรวม, decision, กติกา, how-to | คนเขียน/review — อาจ lag จาก code |
| 2. **Source code จริง** | **repo เดิมของ project (web, API ต่างๆ ที่มีอยู่แล้ว)** | spec/contract จริง, endpoint, schema, พฤติกรรม ณ ปัจจุบัน | **ground truth** |

กติกาการตอบ: คำถามเกี่ยวกับ code/spec/integration → ต้อง ground จาก **code จริงประกอบเสมอ** (ชั้น 2) โดยใช้ KB เป็นบริบท/คำอธิบาย — ถ้าสองชั้นขัดกัน ให้เชื่อ code + ชี้ว่าเอกสาร outdated (ต่อยอด docs-drift alert PLAN-003 T3.3)

## ส่วนประกอบ

1. **Multi-repo retrieval** — ขยาย targeted retrieval (PLAN-008 G1) ให้ค้นได้หลาย repo: local clones ของ `javis-kb` + code repos (web/API) + agentic search (grep/glob ตามแผน T2.4 เดิม) — **ออกแบบ G1 ให้รองรับ multi-repo ตั้งแต่แรก จะได้ไม่ทำสองรอบ**
2. **Javis MCP Server (read-only)** — dev ต่อจาก Claude Code/Cursor: `search_kb(query)` / `get_api_contract(domain)` / `search_code(repo, query)` / `get_doc(path)` — **ไม่มี write tools** (ไม่แก้ code/API/เอกสาร)
3. **RBAC ชั้น code** — เข้าถึง source code ผ่าน Javis ต้อง role `DEVELOPER` ขึ้นไป (เข้มกว่า KB ที่ VIEWER อ่านได้) + token ต่อคน
4. **เสริมกับ generated specs** (PLAN-004 T3.1: Zod→OpenAPI→md) — spec ที่ generate = fast path อ่านง่าย, code จริง = ground truth เมื่อต้องการความแม่น

## สิ่งที่ต้องมีก่อนเริ่ม (ลง PLAN-006 หมวด 5 แล้ว)

- รายชื่อ code repos จริง (web + API) + สิทธิ์อ่าน (GitHub PAT/installation ครอบคลุม repos เหล่านั้น) — **ฝั่ง user**
- Environment กลาง (MCP server + local clones ไม่ควรอยู่บน NAS ส่วนตัว)
- Targeted retrieval (G1) เสร็จก่อน — code repo ใหญ่เกินกว่า whole-context

## จังหวะ

หลังย้าย env กลาง (PLAN-008) — ทำคู่กับ P2 ได้ | แรงประมาณ: MCP server 1–2 วัน + multi-repo retrieval รวมอยู่ใน G1 ถ้าออกแบบเผื่อ

## ความปลอดภัย

- Read-only ทุก tool — แก้อะไรไม่ได้
- Code = classification สูงกว่า internal docs → ตรวจ role ทุก call + audit log
- Secrets ใน code repos: retrieval ต้อง exclude ไฟล์ env/secret patterns (gitleaks rules เดิมใช้ซ้ำได้)
