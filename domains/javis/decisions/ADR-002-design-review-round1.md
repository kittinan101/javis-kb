---
title: "ADR-002: Design Review รอบ 1 — ผล review 9 มุม + การแก้ไข"
id: ADR-002
domain: javis
type: adr
status: done
lang: th
owners: ["kittinan101"]
related: ["PLAN-001", "PLAN-002", "PLAN-003", "PLAN-004", "PLAN-005"]
tags: ["design-review", "governance", "security"]
updated: 2026-07-18
classification: internal
---

# ADR-002: Design Review รอบ 1 (2026-07-18)

## Context

Plan ทั้งชุด (PLAN-001..005) ถูก review โดย reviewer อิสระ 5 กลุ่ม ครอบคลุม 9 มุมมอง: Dev, Frontend, Backend, UX/UI, QA, Tech Lead, Dev Lead, PM, BA — reviewer แต่ละตัวเป็น AI agent แยก session ที่ไม่เห็นเหตุผลของผู้เขียน plan (หลักการ generator ≠ evaluator เดียวกับที่ระบบนี้จะใช้เอง)

ผลรวม: **blocker 13, major ~30, minor ~20** — ทุก blocker และ major เชิง design ถูกแก้เข้า plan แล้วใน commit ชุดเดียวกับ ADR นี้

## Blockers ที่แก้แล้ว (แก้ที่ไหน)

| # | Finding | มุม | แก้ที่ |
|---|---|---|---|
| 1 | ไม่มี conversation design spec — copy/flow จะถูก improvise กระจายใน n8n | UX | PLAN-002 T1.6 (templates/chat/ catalog) |
| 2 | Failure path หลัง ack ไม่ออกแบบ = fail เงียบต่อผู้ใช้ | UX | PLAN-002 T2.5 (timeout + error ถึง user เสมอ) |
| 3 | Hallucination rate เป็น gate metric แต่ไม่มีนิยามวิธีวัด | QA | PLAN-002 T4.2 (นิยาม groundedness + negative ≥ 15) |
| 4 | Keyword matching ตัดสินคำตอบ LLM → false pass/fail | QA | PLAN-002 T4.2 (LLM-judge + rubric, keyword = smoke) |
| 5 | Acceptance test ไม่มีเจ้าของฝั่งคน (AI เขียน AC เอง-ตรวจเอง) | QA | PLAN-004 T1.3 + PLAN-005 T3.4 (QA review AC) |
| 6 | Governance ต้องการคน 3–4 คนแต่ owner มีคนเดียว | PM | PLAN-001 §4 + PLAN-002 T1.5 (Roster ก่อนเริ่ม) |
| 7 | ไม่มี budget รวม + ผู้อนุมัติ | PM | PLAN-001 §4 + PLAN-002 T1.5 |
| 8 | ไม่มี task map คนจริง → role (และ "DBA" ไม่อยู่ใน enum) | BA | PLAN-002 T1.5 + PLAN-005 T1.4 |
| 9 | n8n "Respond Immediately" ขัดกับ AC ตอบ 403 + HMAC ต้องใช้ raw body | Dev | PLAN-002 T2.1 (Respond to Webhook node + raw body) |
| 10 | LINE แนบไฟล์ PDF ไม่ได้ — AC "ส่ง PDF ในแชท" เป็นไปไม่ได้บน LINE | Frontend | PLAN-004 T2.2 (LINE = ลิงก์, Telegram = sendDocument) |
| 11 | SQL claim งานอ้าง column `created` ที่ไม่มี + camelCase/snake_case ปน | Backend | PLAN-005 T2.2 (createdAt + @@map + index) |
| 12 | Chain of trust: `status: approved` ในไฟล์ปลอมได้ → agent ทำงานตาม plan เถื่อน | Tech Lead | PLAN-004 T1.3 (approval ใน DB) + PLAN-005 T2.2 (ตรวจ DB) + PLAN-003 T1.2 (จำกัดโฟลเดอร์ upload) |
| 13 | Agent push ตรงเข้า `develop` ได้ (guardrail คุมแค่ uat/main) | Tech Lead | PLAN-005 T1.4 (protect develop) + T2.3 (agent ไม่มีสิทธิ์ push เลย — runner push แทน) |

## Majors สำคัญที่แก้แล้ว (สรุป)

- **LINE push quota:** redesign เป็น reply-token-first (ลด push ~90%) — PLAN-002 T2.5
- **Message limits + Markdown rendering ต่อ channel:** Reply Formatter กลาง — PLAN-002 T2.5
- **Webhook duplicate delivery:** dedup ด้วย webhookEventId/update_id — PLAN-002 T2.2
- **Register flow เป็น dead end + user แปลกหน้าเข้าถึง KB internal ได้:** unmapped user ห้ามเข้า Q&A + register flow ครบวงจร — PLAN-002 T2.3
- **KB sync mechanism ไม่นิยาม (n8n เข้าถึงไฟล์ยังไง):** local clone + git pull — PLAN-002 T2.4
- **ไม่มี staging ของ bot:** workflow `-dev` + test bots + promote process — PLAN-002 T4.4
- **javis-core DB ไม่มี schema ownership/migrations/index/backup:** repo javis-core + prisma migrate + pg_dump รายวัน — PLAN-002 T1.4, T4.4
- **PDPA purge เริ่ม Phase 4 ทั้งที่เก็บข้อมูลตั้งแต่ Phase 1:** ย้าย purge crons มา Phase 1 — PLAN-002 T4.4
- **upload_requires_pr default false ขัด CONTRIBUTING + เปิดช่อง KB poisoning:** default `true` — PLAN-003 T1.3
- **ID allocation race:** DB sequence + FOR UPDATE — PLAN-003 T1.2
- **Approval state ในไฟล์ git มี race:** state ใน DB, ไฟล์เป็น mirror — PLAN-004 T1.3
- **pandoc/typst ไม่มี host ใน Phase 2–3 (Mac mini มา Phase 4):** กำหนด host + Thai PDF spike ก่อน — PLAN-004 T2.1
- **pandoc template ตัวอย่างผิด (ไม่มี $body$):** แก้แล้ว — PLAN-004 T2.1
- **widdershins เลิก maintain โดยพฤตินัย:** gen Markdown เอง — PLAN-004 T3.1
- **`--max-budget-usd` อาจไม่มีจริง:** budget enforcement ที่ runner — PLAN-005 T2.3
- **allowedTools ขัดกับ migration task + `Bash(npm *)` bypass ได้:** แก้ allowlist + env runner ไม่มี uat/prod secrets — PLAN-005 T2.3
- **Job lease 2 ชม. ฆ่างานที่ยังรัน:** lease renewal heartbeat — PLAN-005 T2.2
- **Evaluator ไม่ถูก validate + ไม่ fail-closed:** seeded-defect calibration + JSON เสีย = request_changes — PLAN-005 T3.1
- **UAT ไม่มี entry/exit/timebox:** protocol ครบ — PLAN-005 T3.4
- **Kill-switch พึ่ง n8n ทางเดียว:** direct SSH path — PLAN-005 T3.3
- **GitHub Free ไม่มี branch protection บน private repo:** prerequisite ยืนยัน plan/งบ — PLAN-005 T1.1
- **Hard gate adoption สร้าง chicken-and-egg:** adoption เป็น health metric ไม่ block phase — PLAN-001 §4
- **Bus factor = 1 + เครื่องอยู่บ้าน:** risk rows + shared vault + Admin คนที่ 2 — PLAN-001 §7
- **Baseline survey / privacy notice ไม่มี task:** PLAN-002 T1.5
- **Group chat ไม่ตัดสินใจ:** ประกาศ Phase 1 = 1:1 เท่านั้น — PLAN-002 §2

## Deferred (รับทราบ — จัดการตอน execution ไม่แก้ plan)

- Flex Message layout spec ละเอียด (ทำใน T1.6 catalog ตอนลงมือ)
- Intent regression set แยก (`eval/intent-set.yaml`) — เพิ่มเมื่อเข้า Phase 2 ที่มีหลาย intent จริง
- Load test / SLO ตัวเลข P95 — ตั้งใน Phase 1 สัปดาห์ 4 ตามข้อมูลจริงหลังมี latency log
- Persona ต่อ role ใน eval set — เพิ่มตอนขยายชุด eval
- Mini admin page (แทน chat command + DB ตรง) — ประเมินหลัง Phase 2 ถ้า ops load สูงจริง
- Voice input (อยู่ใน vision) — ยังไม่กำหนด phase, บันทึกไว้ว่า defer โดยตั้งใจ
- ROI/business case ฉบับเต็ม + hands-on training ต่อ phase — งานฝั่ง business นอก build plans (budget 1 หน้าอยู่ใน T1.5 แล้ว)
- คำแนะนำตัด Bun เหลือ Node / รวม PaaS เดียว — พิจารณาตอนเริ่ม Phase 4 (บันทึกเป็น open question)

## Decision

แก้ blocker + major ทั้งหมดเข้า plan ทันที (commit ชุดนี้) — ไม่เริ่ม PLAN-002 จนกว่า Prerequisite ใน PLAN-001 §4 (Roster, Capacity, Budget) จะถูกเติมด้วยข้อมูลจริงจากทีม

## Consequences

- Plan ชุดนี้ผ่านการ review อิสระ 9 มุมแล้ว — จุดที่เหลือเป็นการตัดสินใจเชิง org (คน/งบ) ที่ต้องการข้อมูลจากทีม ไม่ใช่ gap เชิง design
- Timeline per phase ควรอ่านเป็น "dedicated effort" — ทำ part-time ให้คูณ 1.5–2 เท่า (บันทึกใน PLAN-001 §4)
