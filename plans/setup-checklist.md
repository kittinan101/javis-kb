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
updated: 2026-07-19
classification: internal
---

# Javis AI — Setup Plan & Checklist

> Living document — ทุกครั้งที่ทำ task เสร็จ ให้อัปเดตไฟล์นี้ (ติ๊ก checkbox + ใส่วันที่/หมายเหตุ)

## 🎯 แผนปิด Phase 1 (วางเมื่อ 2026-07-19 — ทำตามลำดับ M1→M3)

**สถานะตั้งต้น:** Q&A ใช้จริง 2 channels + RBAC + eval 86.7% (ชุด 30) | เหลือ: ความเสถียร, eval ครบชุด, เปิดทีม

### M1 — เก็บความเสถียร (ผม, ~1–2 วันงาน, ไม่ติดใคร)
- [x] M1.1 (2026-07-19) Error alert: n8n error workflow ของ gateway → แจ้งเข้า jarvis-alerts เมื่อ execution ล้ม (จะได้ไม่ต้องรอ user บอกว่า "เงียบ")
- [x] M1.2 (2026-07-19) Cost watch: cron รายวัน สรุป cost จาก `audit_logs` + จำนวนคำถาม → ส่งเข้า jarvis-alerts (กันเหตุ credit หมดเงียบซ้ำ)
- [x] M1.3 (2026-07-19) Reply Formatter: strip markdown (bold/heading/code/link/bullet→•) ใน QA Msg (gateway v13) — ความยาว cap 3900 มีอยู่แล้ว
- [x] M1.4 (2026-07-19) Citation hardening: prompt v2.1 — eval รอบ 6 = 86.7% เท่าเดิม (n=30 เล็กเกินจะชี้ขาด ±1-2 เคส = noise) → คงไว้ + ย้ายการจูนไปหลัง M2 ขยายชุด

### M2 — Eval ครบชุด + วัด gate จริง (ผม draft + คุณ/ทีม review ~15 นาที)
- [ ] M2.1 เติม eval set 30 → ≥50 (positive +13, negative +7 → ≥15, multi-turn +2) — ผม draft จาก KB จริง, ทีมช่วยตรวจว่าคำถามสมจริง
- [ ] M2.2 รัน eval ชุดเต็ม → **วัด gate Phase 1 (≥80%) อย่างเป็นทางการ** + บันทึกเป็น baseline ถาวร
- 📏 กติกา eval (~$2/รอบ): รันเฉพาะ (ก) ก่อน deploy การแก้ prompt/retrieval (ข) หลัง KB โต ~10 ไฟล์ (ค) วัด gate — ไม่รันสุ่ม

### M3 — เปิดทีม + ปิด Phase 1 (คุณเป็นหลัก ผม support)
- [ ] M3.1 Roster สรุปกับทีม (1.3 — เลื่อนได้ตามตกลง แต่เป็นประตูของ M3 ทั้งก้อน)
- [ ] M3.2 ชวนทีม 2–3 คนแรก register ผ่านปุ่มอนุมัติจริง + ใช้งาน 1 สัปดาห์ + เก็บ feedback (👍👎 มีระบบแล้ว)
- [ ] M3.3 ทีม review `templates/chat/message-catalog.md` + เติม Wiki stubs ที่ว่าง (ยิ่งเติม accuracy ยิ่งขึ้น)
- [ ] M3.4 Ops ปิดท้าย: UptimeRobot (1.8), pg_dump backup (รอ decision 1.9), LINE OA staging (2.9)
- [ ] **DoD Phase 1:** eval ≥80% บนชุด ≥50 ✚ ทีม ≥50% ลองใช้ ✚ ops ครบ → ประกาศปิด phase + เช็ค readiness bucket 2 (P2) ใน PLAN-006

**ค้างฝั่งคุณที่ไม่ผูก milestone:** rotate รหัส Postgres NAS (1.6 ด่วน) · ตั้ง auto-reload/alert เครดิต Anthropic (1.12) · ตัดสินใจที่เก็บ backup (1.9)

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

**LINE OA mapping (แยกกันเด็ดขาด — ยืนยันด้วย `GET /v2/bot/info` ทั้งคู่ 2026-07-18):**

| OA | basicId | ใช้กับ | n8n credential |
|---|---|---|---|
| Holmcloud | `@212oeopz` | taskbot (AI Bot Assistant — POC ที่รันอยู่) | `Bearer Auth LINE` |
| Holm Agents | `@422vjcem` | **Javis** (Phase 1 Q&A เป็นต้นไป) | `Auth LINE Holm Agents` |

กติกา: workflow ของ Javis ห้ามแตะ credential/webhook ของ Holmcloud และกลับกัน — channel secret ก็แยก env คนละตัว (`LINE_CHANNEL_SECRET_HOLM_AGENTS` สำหรับ Javis)

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
| 2026-07-18 | **ตัดสินใจ:** สร้าง javis-core เลย + Javis ใช้ LINE OA ใหม่ (แยกจาก taskbot) → สร้าง repo `kittinan101/javis-core` สำเร็จผ่าน n8n one-shot (schema 9 ตาราง + seed + README) แล้ว archive workflow — **ค้างฝั่ง user: (1) CREATE DATABASE + prisma migrate + seed ตาม README ของ javis-core (2) สร้าง LINE OA ใหม่ใน LINE Developers Console + เก็บ channel secret/token ลง n8n Credentials** |
| 2026-07-18 | Build "Javis - LINE Gateway (Holm Agents)" ใน n8n (T2.1–T2.2): rawBody + HMAC verify (pattern จาก taskbot ที่พิสูจน์แล้ว) → 403/200 ผ่าน Respond node → Normalizer (schema กลาง + job_id + reply_token) → dedup placeholder — smoke test ผ่าน | Webhook URL: `https://n8n.holmcloud.net/webhook/javis-line` |
| 2026-07-18 | env `LINE_CHANNEL_SECRET_HOLM_AGENTS` ยืนยันโหลดแล้ว + **AC "signature ปลอม → 403" ผ่านจริง** → **publish gateway แล้ว (production URL live)** + สร้าง utility ถาวร "Javis - Utils: LINE bot info" ไว้เช็คสถานะ OA — เช็คล่าสุด OA ยังเป็น `chatMode: chat` → เหลือปิด Chat ใน OA Manager + กด Verify ใน Developers Console |
| 2026-07-18 | **T2.1 ผ่านครบทุก AC:** OA เป็น `chatMode: bot` แล้ว + request จริงจาก LINE (ปุ่ม Verify) เข้า production URL → **HMAC จริงผ่าน (`valid: true` → 200)** — เพิ่ม **bootstrap reply** เข้า gateway (ตอบผ่าน reply token ไม่กิน quota: follow → welcome / message → "กำลังติดตั้งระบบ") + publish v2 — **ทดสอบถัดไป: ทักหา @422vjcem จาก LINE จริง ต้องได้ข้อความตอบกลับ** |
| 2026-07-18 | 🎉 **E2E loop แรกสำเร็จ:** user ทัก bot จาก LINE จริง → verify → Normalizer ออกครบทุก field → bot ตอบกลับผ่าน reply token สำเร็จ (LINE คืน message id) — **T2.1 ปิดจ๊อบ, T2.2 เหลือแค่ dedup (รอ javis_core DB)** — ถัดไป: T2.3 register/RBAC ทันทีที่ DB + credential พร้อม |
| 2026-07-18 | **T1.4 DB จบ:** apply `javis_core` บน Postgres NAS (:5433) ผ่าน `prisma migrate dev` จากเครื่อง dev — 9 ตาราง + seed 5 ค่า verify ด้วย query จริง, migration push เข้า javis-core แล้ว (connection string อยู่ใน `.env` local เท่านั้น ไม่เข้า git) — **เหลือขั้นเดียว: เพิ่ม credential "Postgres javis-core" ใน n8n UI (host/port/db/user เดิม, database `javis_core`) → ปลดล็อก dedup + T2.3** |
| 2026-07-18 | 🎉 **F1 Q&A แกนหลักทำงานแล้ว:** credential "Postgres Javis App" เข้า n8n + สร้าง workflow "Javis - QA Flow (test)" ตาม ADR-003 (whole-KB 66.5k tokens ผ่าน GitHub API → claude-sonnet-5 + citations + prompt cache) — ทดสอบผ่านทั้ง positive (6 ฟีเจอร์ + cite ตรง) และ negative (ไม่เดา + อ้าง policy) / cache hit เต็มรอบสอง (9.5 วิ) — **ยังไม่เสียบ gateway จนกว่า T2.3 register/RBAC เสร็จ (กัน KB รั่ว)** — งานถัดไปของ build: dedup จริง + T2.3 |
| 2026-07-18 | **T2.2 ปิดจ๊อบ:** สลับ dedup placeholder → Postgres จริง (`webhook_events` + xmax trick, SQL พิสูจน์แล้ว insert ซ้ำ → inserted=false) + publish gateway v3 — และ **seed admin**: kittinanonta@gmail.com (ADMIN) ผูก LINE identity (approved) ใน javis_core เตรียม T2.3 — **ยืนยัน E2E: ทัก bot 1 ข้อความแล้วเช็ค row ใน webhook_events** |
| 2026-07-19 | ⛔ **Incident: Anthropic credit หมด — Javis down ทั้ง 2 channels** (เจอตอน eval รอบ 4 ทุก call ตอบ credit too low) → เพิ่ม register 1.12 เติมเครดิต+ตั้ง alert (ฝั่ง user) + เผยจุดอ่อน T2.5: QA Call Claude fail เงียบเมื่อ API error — จะแก้เป็นข้อความขอโทษ+job_id |
| 2026-07-19 | 🏁 **M1 ครบทั้ง 4 ข้อ:** (1) Error Alert workflow ใหม่ (a0eUNCG7ORnwUdCN, published — เหลือคลิกผูกใน UI: workflow Settings → Error Workflow) (2) Cost Watch cron 09:00 (HVgF45VEhqgQrVOO — test จริงส่งรายงานเข้า jarvis-alerts แล้ว: 3 คำถาม/$0.41) (3) strip markdown ใน QA Msg (v13) (4) prompt v2.1 eval รอบ 6 = 86.7% flat → บทเรียน: n=30 แยกแยะการจูนไม่ได้ ต้องขยายชุดก่อน (M2) |
| 2026-07-19 | 🛡️ **Failure path (T2.5) เข้า gateway v12:** QA Call Claude เพิ่ม neverError → API ล่ม user ได้ข้อความขอโทษ + job_id แทน fail เงียบ (ไม่แนบปุ่ม feedback ตอน error) — ทดสอบจริงได้ทันทีระหว่างเครดิตหมด |
| 2026-07-19 | 🧪 **Prompt v2 ผ่าน pre-deploy eval (รอบ 3):** 86.7% เท่า v1 แต่ **negative 8/8 เต็ม** (v1 ได้ 5/8) — hallucination guard สมบูรณ์ แลก positive ตกเป็น 16/19 เรื่อง citation ไม่ครบ (เนื้อหาถูก) → ตัดสินใจใช้ v2; calibrate eval set 2 จุด (cite ทางเลือก, เกณฑ์ semantic) |
| 2026-07-19 | 📊 **Eval runner (T4.2) ใช้งานจริง + baseline 86.7%:** workflow "Javis - Eval Runner" ถาม 30 เคส + LLM-judge → รอบ 1 = 73.3% และ**จับ security leak จริง**: รหัส Postgres admin เคยหลุดดิบใน PLAN-006 (ฝีมือผมเอง, gitleaks ไม่จับเพราะเป็นคำธรรมดา) → purge (`729c49a`) + ยกระดับ 1.6 rotate เป็นด่วน; แก้ judge max_tokens + ขยาย expect_cite → รอบ 2 = **86.7%** (positive 19/19) — failures ที่เหลือชี้ทาง prompt v2 (แยกแผน/ของจริง) ดู `eval/results-2026-07-19.md` |
| 2026-07-19 | 💾 **n8n exports ครบ 7 workflows** เข้า `n8n-exports/` (register 1.11 ✅) — disaster recovery พร้อม (เหลือผูก credentials ใหม่ตอน restore ตาม README) |
| 2026-07-19 | 🎭 **Role assignment ตอนอนุมัติ (gateway v11):** ปุ่มอนุมัติเปลี่ยนจาก confirm 2 ปุ่ม → buttons template 3 ปุ่ม [อนุมัติ VIEWER / อนุมัติ CONTRIBUTOR / ปฏิเสธ] — SQL เดียวทำครบ: update identity + สร้าง User (email placeholder @chat.javis.local, ON CONFLICT → update role) + link javis_user_id (โครงสร้าง CTE ระวังกฎ Postgres ห้าม UPDATE row เดียวกัน 2 CTE); ทดสอบครบ approve/dup/reject กับ DB จริง; backfill: Telegram identity ของ Admin ผูกกับ User ADMIN เดิม — **ปิด gap RBAC ของ Phase 2 แล้ว** |
| 2026-07-19 | 🧠 **Haiku intent classifier (gateway v10, 47 nodes):** ทุกข้อความ approved → claude-haiku-4-5 จำแนก `qa`/`help`/`smalltalk` — help/smalltalk ตอบ canned ทันที (ไม่กิน rate limit/ไม่เรียก Sonnet ประหยัด ~$0.04-0.32/ครั้ง), จำแนกพลาด/ API ล่ม = fail-open เป็น qa (`neverError`+timeout 8s) — เป็นเสาหลักรอรับ intent `upload`/`impact` Phase 2; Roster (1.3) ตกลงเลื่อนรอสรุปทีม — ไม่บล็อก build |
| 2026-07-19 | 🏆 **Telegram full E2E ผ่าน (v9):** register → อนุมัติจาก LINE → Q&A 3 คำถาม (21–30 วิ/คำถาม) — audit ลงครบ 3 แถว channel=telegram, session 6 turns (multi-turn ข้ามคำถามทำงาน), cost พิสูจน์ cache: $0.32 แรก → $0.04 ถัดไป; bugfix v9: LINE Loading ต้อง gate ด้วย IF channel=line (onError ใน addNode op ไม่ถูกบันทึก — ระวังใน op ถัดไป) — **DoD สัปดาห์ 3 เหลือแค่กดปุ่ม 👍👎 ฝั่ง TG** |
| 2026-07-19 | 🐛 **Bugfix v8:** กดปุ่มอนุมัติใน LINE แล้วเงียบ — `URLSearchParams is not defined` ใน Code node sandbox (task runner ไม่มี global นี้) ทำ Parse Approval/Parse Feedback พังทั้งคู่ → เปลี่ยนเป็น parser split('&') ธรรมดา — บทเรียน: **อย่าใช้ Web API globals ใน n8n Code node** (มีแค่ Node built-ins ที่ require ได้) |
| 2026-07-19 | ✅ **Telegram E2E ครึ่งแรกผ่าน + alert channel พร้อม:** DM `/start` → pending identity + ปุ่มอนุมัติเด้งเข้า LINE Admin จริง; ข้อความถัดไป → route เส้น pending ถูกต้อง; forward จากช่อง jarvis-alerts → ดึง chat id สำเร็จ เก็บใน `system_config.alert_telegram_chat_id` (ค่าอยู่ใน DB — ไม่ใส่เลขดิบในเอกสาร: chat id 13 หลักชน gitleaks rule เลขบัตร ปชช. พอดี) + workflow "Javis - Utils: Send alert" ยิงทดสอบเข้าช่องสำเร็จ — เหลือ: Admin กดอนุมัติ + ถามคำถามใน Telegram |
| 2026-07-19 | 📱 **Telegram เข้า gateway (v7, 42 nodes) — T3.1+T3.2:** bot @jarvis_holm_bot + @jarvis_holm_staging_bot (getMe ยืนยัน), webhook set พร้อม secret (SHA-256 ของ token), TG Verify→TG Normalizer→Dedup ร่วมกับ LINE; **refactor สำคัญ:** Dedup ส่ง msg ผ่าน jsonb passthrough + SQL ทุกตัว channel-aware (identity/register/approval/session/audit) + Send Router route ตาม channel + Msg builders 2 ภาษา channel; feedback TG = inline_keyboard + answerCallbackQuery — regression LINE 403 ผ่าน; รอ E2E: DM @jarvis_holm_bot |
| 2026-07-19 | 📋 **PLAN-006 Readiness Register สร้างแล้ว** — ทะเบียน external needs ทั้ง 4 phases (33 รายการ) พร้อม lead time/เจ้าของ/deadline + Decision Queue 6 ข้อ — กติกาใหม่: task ที่มี external need ต้องลง register ทันที + เช็ค bucket ของ phase ถัดไปทุกครั้งที่เริ่ม phase | 
| 2026-07-19 | 🧹 **Housekeeping cron ใหม่** — workflow "Javis - Housekeeping (cron)" (`baVvvprul4c5jqol`, published): ทุกชั่วโมงลบ `webhook_events` > 24 ชม. (AC TTL ของ T2.2) + session หมดอายุ > 1 วัน + rate counters > 2 วัน — test run ผ่าน; ระวัง: auto-assign ผูก credential ผิดเป็นของ taskbot ต้อง set เป็น `Postgres Javis App` เอง |
| 2026-07-19 | ⏳ **Loading animation (T2.5) เข้า gateway v6:** ระหว่างรอ Q&A (~15 วิ) user เห็น loading indicator ใน LINE — `POST /chat/loading/start` หลังผ่าน rate gate, `onError: continue` ไม่บล็อกคำตอบ |
| 2026-07-19 | ✅ **Q&A E2E บน LINE ยืนยันแล้ว:** 3 คำถามจริงผ่าน gateway v4 (executions 476–478, ~14–19 วิ/คำถาม, success ทั้งหมด) + dedup E2E ยืนยัน (3 ข้อความ = 3 rows ใน `webhook_events`) — **F1 Ask Javis ใช้งานจริงบน LINE แล้ว** |
| 2026-07-19 | 🚀 **Week-3 batch เข้า gateway (v5 published, 37 nodes):** T3.4 rate limit (อ่าน config สด → แก้ DB มีผลทันที) + T3.3 multi-turn (docs turn แรกรักษา cache prefix, history 10 turns, TTL จาก config) + T3.6 audit log stage qa-flow (question/answer/citations + cost_usd จาก usage) + T3.5 feedback 👍👎 (quickReply postback → FeedbackLog join จาก audit, กดซ้ำ=update) — SQL ทุกตัวพิสูจน์กับ DB จริงก่อน build; แก้ bug ระหว่าง review: rule admin_action จับเฉพาะ `reg&cid=` ไม่งั้นกิน feedback ของ Admin |
| 2026-07-18 | 🚀 **T2.3 + เสียบ Q&A เข้า gateway (v4 published):** Identity Lookup → Route 6 ทาง — admin postback (อนุมัติ/ปฏิเสธผ่านปุ่ม confirm), follow → welcome, approved+message → **Q&A จริง (citations + cache)**, approved+ปุ่ม → ignore, pending → รอ, unknown → สร้าง pending + แจ้ง Admin พร้อมปุ่ม — reply ผ่าน reply token / push เฉพาะ notify — **รอยืนยัน E2E: admin ถามคำถามจริงใน LINE** |
| 2026-07-18 | **Least-privilege role:** สร้าง `javis_app` (owner ของ javis_core เท่านั้น — NOSUPERUSER/NOCREATEDB/NOCREATEROLE, password สุ่มอยู่ใน `.env` local ไม่ผ่านแชท/git) + โอน ownership DB/ตาราง 10 ตัว — verify: read/write ผ่าน, CREATE DATABASE ถูก block, `migrate status` ผ่านใต้ role ใหม่ — **เลิกใช้ admin connection กับโปรเจกต์นี้แล้ว** (แนะนำ rotate password admin เพราะเคยผ่านแชท) — n8n credential ให้ใช้ user `javis_app` |
| 2026-07-18 | LINE OA ใหม่ **"Holm Agents"** (@422vjcem) พร้อมแล้ว — credential `Auth LINE Holm Agents` (bearer token) ใน n8n ผ่านการทดสอบจริง (`GET /v2/bot/info` สำเร็จ) — **ค้าง 2 จุดก่อน build gateway: (1) สลับ OA เป็น bot mode: ปิด chat/auto-reply + เปิด Use webhook (ตอนนี้ `chatMode: chat` = webhook ยังไม่ทำงาน) (2) เพิ่ม channel secret เป็น env `LINE_CHANNEL_SECRET_HOLM_AGENTS` บน n8n container สำหรับ verify HMAC** |
