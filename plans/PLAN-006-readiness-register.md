---
title: "Readiness Register — ทะเบียนสิ่งที่ต้องเตรียมล่วงหน้าทุก Phase (กัน blocker)"
id: PLAN-006
domain: javis
type: plan
status: in_progress
lang: th
owners: ["kittinan101"]
related: ["PLAN-001", "PLAN-002", "PLAN-003", "PLAN-004", "PLAN-005"]
has_migration: false
risk: low
tags: ["readiness", "dependencies", "living-document", "prerequisites"]
updated: 2026-07-19
classification: internal
---

# PLAN-006: Readiness Register — ทะเบียนสิ่งที่ต้องเตรียมล่วงหน้า

> **หลักการ:** ห้ามให้ task ใดถึงวันเริ่มโดยที่ external need ยังไม่พร้อม — ทุก need ต้อง**พร้อมก่อน phase ที่ใช้เริ่มอย่างน้อย 1 สัปดาห์** (ของที่ lead time ยาว เช่น ฮาร์ดแวร์/งบ ให้เริ่มตั้งแต่ phase ก่อนหน้า)
>
> ที่มา: บทเรียนจาก Phase 1 ที่ Telegram token / บัญชีทดสอบ / Roster กลายเป็น blocker เพราะไม่ได้ขอไว้ล่วงหน้า
>
> **กติกา:** (1) เพิ่ม task ใหม่ใน plan ใด ถ้ามี external need ต้องเพิ่มแถวที่นี่ทันที (2) ทุกครั้งที่เริ่ม phase ใหม่ ให้เปิดไฟล์นี้เช็ค bucket ของ phase ถัดไปด้วย (3) สถานะ: ⬜ ยังไม่เริ่ม / 🔶 กำลังทำ / ✅ พร้อม / ⛔ ติดปัญหา

## 1. ต้องพร้อม "ตอนนี้" — ปิด Phase 1 ให้จบ

| # | สิ่งที่ต้องมี | เจ้าของ | Lead time | ใช้กับ | สถานะ | หมายเหตุ |
|---|---|---|---|---|---|---|
| 1.1 | Telegram bot token (BotFather: `/newbot`) + ชื่อ bot | คุณ | 10 นาที | P1 T3.1 | ✅ | 2026-07-19: @jarvis_holm_bot — token เป็น env var, webhook set + secret แล้ว, gateway v7 รองรับ |
| 1.2 | บัญชี LINE ที่ 2 (เพื่อนร่วมทีม 1 คน) add @422vjcem แล้วทัก | คุณ/ทีม | 5 นาที | ทดสอบ register/approve E2E | ⬜ | คุณจะได้ปุ่มอนุมัติในแชททันที |
| 1.3 | **Roster:** รายชื่อทีม + email + role ที่จะให้ (ADMIN/LEAD_SA/PM_PO/QA/DEVELOPER/CONTRIBUTOR/VIEWER) | คุณ | 30 นาที | P1 T1.5 → RBAC ทุก phase | 🔶 | 2026-07-19: **รอสรุปกับทีมก่อน — ตกลงเลื่อนได้** ไม่บล็อก build (กลไก role ทำรอไว้); เส้นตาย: ต้องมีก่อนชวนทีมใช้จริง + ก่อนเริ่ม P2 (upload ต้องรู้ว่าใครเป็น CONTRIBUTOR) |
| 1.4 | Capacity + Budget รายเดือน (Claude API + infra) | คุณ | 30 นาที | P1 T1.5, gate ทุก phase | ⬜ | ใช้ตั้ง alert 80% + `max_budget_per_job_usd` ใน P4 |
| 1.5 | ทีม review `templates/chat/message-catalog.md` | ทีม | 30 นาที | P1 T1.6 | ⬜ | ไม่ block build แต่ block "ประกาศใช้" |
| 1.6 | Rotate รหัส Postgres admin user บน NAS | คุณ | 5 นาที | ⚠️ security — **ยกระดับเป็นด่วน** | ⬜ | รหัสเดิมเคยผ่านแชทและเคยหลุดลงเอกสารนี้ 1 วัน (ลบแล้ว 2026-07-19 แต่ยังอยู่ใน git history) — **ต้อง rotate เท่านั้นถึงปิดความเสี่ยงจริง**; javis_app ไม่ได้ใช้รหัสนี้ rotate ได้ไม่กระทบระบบ |
| 1.7 | **ช่องทาง alert (#javis-alerts):** ตัดสินใจว่าใช้ LINE group / Telegram channel + สร้าง | คุณ (ตัดสินใจ) → ผม (ต่อ n8n) | 30 นาที | P1 T4.4, P4 kill-switch | ✅ | 2026-07-19: ช่อง Telegram "jarvis-alerts" — chat id เก็บใน `system_config.alert_telegram_chat_id`, workflow "Javis - Utils: Send alert" ทดสอบส่งสำเร็จ |
| 1.8 | UptimeRobot account (free) monitor webhook + n8n | คุณ (สมัคร) → ผม (ตั้ง monitor) | 15 นาที | P1 T4.4 | ⬜ | ใช้ email ทีมสมัคร |
| 1.9 | ที่เก็บ pg_dump backup (path บน NAS หรือ cloud) | คุณ (ตัดสินใจ) → ผม (ทำ cron) | ตัดสินใจ 5 นาที | P1 T4.4 → วิกฤตขึ้นตอน P2 เปิดเขียน | ⬜ | แนะนำ: โฟลเดอร์บน NAS คนละ volume กับ Postgres + สำเนาขึ้น cloud รายสัปดาห์ |
| 1.10 | งานฝั่ง build ที่ผมปิดเองได้ (classifier, role assignment, formatter, push fallback, eval runner) | ผม | 1–2 วันงาน | ก่อนขึ้น P2 | ✅ | 2026-07-19: ครบทุกตัวยกเว้น push fallback (ยังไม่จำเป็น — Q&A ตอบทัน reply token ตลอด; ทำเมื่อเจอ timeout จริงหรือก่อน Impact Analysis ใน P2) |
| 1.11 | สำรอง n8n workflow definitions (export JSON เข้าโฟลเดอร์ `n8n-exports/` ใน repo นี้เป็นระยะ) | ผม | 1 ชม. | disaster recovery ทุก phase | ✅ | 2026-07-19: ครบ 7 workflows + README วิธี restore — อัพเดตซ้ำเมื่อ workflow เปลี่ยน version สำคัญ |
| 1.12 | เติม Anthropic API credits + ตั้ง auto-reload/alert ยอดเครดิต | คุณ | 10 นาที | ทุก phase | 🔶 | 2026-07-19: เติมแล้ว ระบบกลับมาปกติ — **เหลือตั้ง auto-reload/alert ใน console** กันเกิดซ้ำ; ฝั่งระบบมี Cost Watch รายวัน + error message แทน fail เงียบแล้ว |

## 2. ต้องพร้อม "ก่อนเริ่ม Phase 2" (Upload + Impact + Figma)

| # | สิ่งที่ต้องมี | เจ้าของ | Lead time | ใช้กับ | สถานะ | หมายเหตุ |
|---|---|---|---|---|---|---|
| 2.1 | Figma PAT scope `file_content:read` + `file_metadata:read` | คุณ | 10 นาที | P2 T3.1 | ⬜ | สร้างจาก Figma account settings → วางใน n8n Credentials — ขอ read-only เท่านั้น |
| 2.2 | รายการ Figma file ที่ใช้จริง + designer ที่จะ map ไฟล์↔feature | ทีม design | 1 ชม. | P2 T3.1 | ⬜ | ไม่มี = Figma integration เลื่อนได้โดยไม่กระทบ upload/impact |
| 2.3 | **Host สำหรับ pandoc/pdftotext** (แปลง docx/PDF): container ข้าง n8n บน NAS | คุณ (สิทธิ์ NAS) + ผม (setup) | ครึ่งวัน | P2 T2.2 | ⬜ | n8n container ปกติไม่มี pandoc — ต้องมี sidecar หรือ image custom; ตัดสินใจก่อน P2 W2 |
| 2.4 | ผู้ทดสอบ non-dev 2 คน (นัดเวลา) | คุณ | นัดล่วงหน้า 1 สัปดาห์ | P2 W4 DoD | ⬜ | |
| 2.5 | SA/ผู้ review impact report (ระบุชื่อ) | คุณ | 5 นาที | P2 T3.2 AC | ⬜ | ถ้าคือคุณเอง ระบุใน Roster ว่า role LEAD_SA |
| 2.6 | ยืนยัน budget Opus (Impact Analysis ใช้ Opus — แพงกว่า Sonnet ~1.7 เท่า/token) | คุณ | 5 นาที | P2 T3.2 | ⬜ | ประเมินจาก eval: ~0.1–0.3 USD/รายงาน ที่ KB ขนาดปัจจุบัน |
| 2.7 | **แผนรับมือ KB โต:** เตรียม local clone + volume ให้ n8n เข้าถึง (threshold ADR-003: >50 ไฟล์ หรือ >80k tokens — ตอนนี้ 66.5k แล้ว) | คุณ (สิทธิ์ NAS) + ผม (build) | 1 วัน | กลาง P2 โดยประมาณ | ⬜ | P2 คือ phase ที่เพิ่มไฟล์เข้า KB → ชนแน่ ให้เตรียม volume ไว้ก่อน ไม่รอชนแล้วค่อยทำ |
| 2.8 | Eval baseline จาก P1 (accuracy > 80% = gate เข้า P2) | ผม (T4.2) + ทีมช่วยตรวจคำตอบ | 1 วัน | gate P2 | ✅ | 2026-07-19: **GATE ผ่าน 96.2%** บนชุดเต็ม 52 เคส — baseline ถาวร |
| 2.9 | Staging bots: LINE OA ตัวที่ 3 (staging) + Telegram bot ตัวที่ 2 (staging) | คุณ | 30 นาที | P1 T4.3 / ใช้จริงจัง P2+ | 🔶 | Telegram staging ✅ (@jarvis_holm_staging_bot, token ใน env แล้ว) — เหลือ LINE OA staging |

## 3. ต้องพร้อม "ก่อนเริ่ม Phase 3" (Plan Gen + PDF) — เริ่มเตรียมได้ตั้งแต่ P2

| # | สิ่งที่ต้องมี | เจ้าของ | Lead time | ใช้กับ | สถานะ | หมายเหตุ |
|---|---|---|---|---|---|---|
| 3.1 | **ADR: host ที่รัน typst/pandoc PDF** — container บน NAS หรือ Mac mini มาก่อนกำหนด | คุณ (ตัดสินใจ) | ตัดสินใจ 1 วัน, setup ครึ่งวัน | P3 T2.1 | ⬜ | ถ้าซื้อ Mac mini เร็ว (ดู 4.1) ตัวเลือกนี้จบเอง — ใช้เครื่องเดียวคุ้มกว่า |
| 3.2 | โลโก้องค์กร + รูปแบบ header เอกสารทางการ | คุณ/ทีม | 30 นาที | P3 T2.1 template | ⬜ | ไฟล์ PNG/SVG + สีองค์กร |
| 3.3 | ฟอนต์ Sarabun (SIL OFL — โหลดฟรี) ติดตั้งบน host PDF | ผม | 10 นาที | P3 T2.1 | ⬜ | ทำพร้อม 3.1 |
| 3.4 | ที่ host ไฟล์ PDF ให้ LINE โหลด (LINE แนบไฟล์ไม่ได้) — GitHub release หรือ NAS URL | คุณ (ตัดสินใจ) | ตัดสินใจ 15 นาที | P3 T2.2 | ⬜ | แนะนำ GitHub release ใน javis-kb (private → ต้อง token ดังนั้นอาจใช้ NAS ที่มี URL ภายใน) — ต้องคิดเรื่องสิทธิ์เข้าถึง |
| 3.5 | ตัวจริงของ approver: LEAD_SA ≥ 1 คน + PM_PO ≥ 1 คน + QA ≥ 1 คน ใน Roster และลงทะเบียนในระบบแล้ว | คุณ/ทีม | มาจาก 1.3 | P3 T1.3 approval | ⬜ | approval workflow ต้องการ 2 role จริงกดปุ่ม — คนเดียวเล่นหลาย role ได้แต่ต้อง map ชัด |

## 4. ต้องพร้อม "ก่อนเริ่ม Phase 4" (Dev Agent) — ⚠️ lead time ยาวสุด เริ่มขอ/สั่งตั้งแต่ P2–P3

| # | สิ่งที่ต้องมี | เจ้าของ | Lead time | ใช้กับ | สถานะ | หมายเหตุ |
|---|---|---|---|---|---|---|
| 4.1 | **Mac mini (RAM ≥ 16GB)** + จุดวางที่เปิด 24/7 + UPS/ปลั๊กเสถียร | คุณ (งบ + สั่งซื้อ) | **1–3 สัปดาห์** | P4 ทั้ง phase | ⬜ | ตัวยาวสุดของทั้งโปรเจกต์ — สั่งช่วง P3 เป็นอย่างช้า; ถ้าจะใช้เป็น PDF host (3.1) ด้วย ให้สั่งช่วง P2 |
| 4.2 | **GitHub Team plan** (branch protection + required reviewers บน private repo) | คุณ (งบ ~$4/คน/เดือน) | 1 วัน | P4 T1.1 guardrail ชั้น 3 | ⬜ | ไม่มี = guardrail หลักไม่มีจริง — เป็น prerequisite แข็งใน PLAN-005 |
| 4.3 | Railway account + billing (dev/uat) + ตั้ง spend alert | คุณ | 30 นาที | P4 T1.3 | ⬜ | Railway ไม่มี hard cap — alert ต้องตั้งวันแรก |
| 4.4 | Render account + billing (prod) | คุณ | 30 นาที | P4 T1.3 | ⬜ | |
| 4.5 | Tailscale account (free tier พอ) + ติดตั้งบน NAS/n8n + Mac mini | คุณ (account) + ผม (config ACL) | 1 ชม. | P4 T2.1 | ⬜ | |
| 4.6 | Claude Code สำหรับ headless: ตัดสินใจ Max plan vs API key + `claude setup-token` | คุณ (งบ) | 30 นาที | P4 T2.1 | ⬜ | คำนวณจาก pilot budget — API key คุม cost ต่อ job ง่ายกว่า |
| 4.7 | Fine-grained GitHub PAT สำหรับ runner (Contents R/W, PR R/W, Metadata R, Workflows R — 2 repo เท่านั้น) | คุณ | 15 นาที | P4 T2.1 | ⬜ | สร้างตอน P4 เริ่มจริง (อายุ token สั้นดีกว่า) แต่รู้ขั้นตอนไว้ก่อน |
| 4.8 | คนรับบท DBA (จาก LEAD_SA) สำหรับ CODEOWNERS `/prisma/migrations/` | คุณ | มาจาก 1.3 | P4 T1.4 | ⬜ | |
| 4.9 | ค่า `max_budget_per_job_usd` + budget รายเดือน agent | คุณ (ตัดสินใจ) | มาจาก 1.4 | P4 T3.3 kill-switch | ⬜ | ตั้งใน SystemConfig — เปลี่ยนทีหลังได้ |

## 5. หลัง POC ผ่านการนำเสนอ — ย้ายเข้า Environment กลางสำหรับทีม (บริบทจาก user 2026-07-19)

> ทุกอย่างที่รันบน NAS ตอนนี้เป็น **POC ชั่วคราว** — ถ้านำเสนอผ่าน จะเกิดงานย้ายชุดนี้ (ตอนนี้แค่จองรายการไว้ ยังไม่ตัดสินใจอะไร)

| # | สิ่งที่ต้องมี/ทำ | เจ้าของ | หมายเหตุ |
|---|---|---|---|
| 5.1 | ตัดสินใจ environment กลาง: เครื่อง/hosting ของทีม (server กลาง, cloud, หรือ NAS องค์กร) | ทีม/องค์กร | รอผลนำเสนอ |
| 5.2 | ย้าย n8n instance + workflows (มี `n8n-exports/` ครบ 7 ตัวแล้ว — restore ได้) + ผูก credentials ใหม่ | ผม + admin env กลาง | checklist restore อยู่ใน `n8n-exports/README.md` |
| 5.3 | ย้าย javis_core DB (`pg_dump` → restore; schema reproduce ได้จาก prisma migrations ใน javis-core repo) | ผม | |
| 5.4 | ชี้ webhook LINE/Telegram ไป URL ใหม่ + rotate secrets/credentials ทุกตัวตอน cutover | ผม + คุณ | โอกาสดีที่จะ rotate ทุกอย่างพร้อมกัน |
| 5.5 | ตัดสินใจว่า LINE OA / Telegram bot ใช้ตัวเดิมหรือสร้างใหม่ในนามองค์กร | คุณ/ทีม | ตัวเดิมย้ายได้ (แค่เปลี่ยน webhook URL) |

## 6. คิวตัดสินใจ (Decision Queue) — สรุปเฉพาะที่ต้อง "เลือก" พร้อมค่าแนะนำ

| ตัดสินใจเรื่อง | ตัวเลือกแนะนำ (default ถ้าไม่เลือกภายใน phase ที่ใช้) | เกี่ยวกับ |
|---|---|---|
| ช่องทาง #javis-alerts | Telegram channel (ฟรี ไม่กิน LINE quota, bot ส่งง่าย) | 1.7 |
| ที่เก็บ pg_dump | NAS คนละ volume + สำเนา cloud รายสัปดาห์ | 1.9 |
| Host pandoc (P2) / typst (P3) | ถ้าซื้อ Mac mini เร็ว → ใช้ Mac mini ตัวเดียว; ไม่งั้น container บน NAS | 2.3, 3.1 |
| ที่ host PDF ให้ LINE โหลด | NAS internal URL (ทีม intranet) — ปลอดภัยกว่า public release | 3.4 |
| Claude Code auth บน runner | API key + budget ต่อ job ที่ runner enforce | 4.6 |
| จังหวะซื้อ Mac mini | สั่งช่วง P2 ถ้าเอามาเป็น PDF host ด้วย (คุ้ม 2 งาน) | 4.1, 3.1 |

## 7. Log การอัพเดต

| วันที่ | รายการ |
|---|---|
| 2026-07-19 | สร้าง register ครั้งแรก — สกัดจาก PLAN-002..005 ทั้งหมด หลังเจอบทเรียน blocker ใน P1 (Telegram token, Roster, บัญชีทดสอบ ไม่ได้เตรียมล่วงหน้า) |
