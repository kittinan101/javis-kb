---
title: "AI Bot Assistant (Task Bot) — System Design Phase 1"
id: DOM-004-taskbot-phase1
domain: taskbot
type: overview
status: shipped
lang: mixed
owners: ["kittinan101"]
related: ["DOM-002-javis"]
tags: ["taskbot", "poc", "line-bot", "n8n", "system-design"]
updated: 2026-07-18
classification: internal
---

# AI Bot Assistant (Task Bot) — System Design Phase 1

> Import จาก Notion "📐 System Design — Phase 1 (Demo 9 ก.ค. 2026)" (POC Lab > AI Bot Assistant) — POC รุ่นก่อนหน้าของ Javis: bot บันทึก task ของทีมผ่าน LINE บน infra self-host (NAS) — **หลาย pattern ในนี้ถูกนำไปใช้ต่อใน Javis** (LINE HMAC verify, webhookEventId idempotency, privacy by design, template-based alert)

## Scope Phase 1

บันทึก task แบบเบา + daily alert — **ไม่เก็บเนื้อหางาน/credential** (privacy by design ตั้งแต่ระดับ schema)

## Design Decisions (จากการ review)

| หัวข้อ | ตัดสินใจ | เหตุผล |
|---|---|---|
| Daily alert | Template-based — ไม่เรียก LLM | deterministic, $0, ลด failure mode |
| raw_message | ไม่เก็บเลย | ตัด risk business data/credential ที่ระดับ schema — idempotency ใช้ webhookEventId แล้ว |
| Project | เก็บแค่ `project_tag` (TEXT) บน task | จัดกลุ่มหลวมๆ พอ ตาราง projects รอเฟส 2 |
| การถามกลับ | ไม่มีในเฟส 1 — AI ใช้ default (priority=medium, due=null) | ตัด state machine ทั้งชุด ผู้ใช้พิมพ์แก้ทีหลังได้ |

## Architecture

`LINE app → LINE Platform → Cloudflare Tunnel → n8n (Synology NAS) → Claude Haiku (tool use extract) ↔ Postgres 16 (container) → LINE Push API` + cron 09:00 จ–ศ

| Component | รันที่ | หน้าที่ |
|---|---|---|
| n8n | NAS (มีอยู่แล้ว) | Workflow A: LINE Intake (webhook → extract → save → push) / Workflow B: Daily Alert (cron → query → template → push) |
| Postgres 16 | Container ใหม่ (Portainer) | source of truth: `employees`, `tasks`, `processed_events` (3 ตารางเท่านั้น) |
| Claude API | claude-haiku (temperature 0, tool_choice บังคับ) | extract task จากภาษาธรรมชาติ — structured output ผ่าน tool use เท่านั้น |
| Cloudflare Tunnel | ตั้งไว้แล้ว | expose webhook โดยไม่เปิด port NAS |
| LINE OA | free tier | demo ใช้ tester 2–3 คนกัน quota |

## Key Flows

- **ลงทะเบียน:** invite code (`DEV-XXXX`/`LEAD-XXXX`) → ตรวจกับ `employees.invite_code` ที่ยังไม่ถูกใช้ → ผูก `line_user_id` + `verified_at`
- **บันทึก task:** webhook → ack 200 ทันที → verify HMAC → idempotency (`INSERT processed_events ON CONFLICT DO NOTHING`) → โหลด employee + open tasks → Claude tool `record_tasks` (คืน `{tasks[], reply}` — `existing_task_id` มีค่า = UPDATE งานเดิม, null = INSERT) → push ตอบ; error/timeout > 15s → push fallback
- **Daily alert 09:00 จ–ศ:** query open tasks ของทุกคนที่ verified → format template ต่อคน (ไม่เรียก LLM) → push เฉพาะคนมีงานค้าง; เรียง overdue → due ใกล้ → priority

## Database (DDL หลัก)

```sql
CREATE TABLE employees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL, team TEXT,
  role TEXT NOT NULL DEFAULT 'developer' CHECK (role IN ('developer','team_lead')),
  invite_code TEXT UNIQUE NOT NULL,
  line_user_id TEXT UNIQUE, verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE tasks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id),
  work_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Bangkok')::date,
  title TEXT NOT NULL,               -- สั้น ไม่มีรายละเอียด business/credential
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  due_date DATE, project_tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE processed_events (      -- idempotency: กัน LINE webhook retry
  webhook_event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Implementation Guidelines (บทเรียนที่ Javis นำไปใช้ต่อ)

- Webhook: เปิด **Raw Body** เพื่อ verify `x-line-signature` (HMAC-SHA256 base64) — ไม่ตรง = ทิ้ง event
- Idempotency key = `events[].webhookEventId` — LINE retry แล้วประมวลผลครั้งเดียว
- Timezone: ตั้ง `GENERIC_TIMEZONE=Asia/Bangkok` + `TZ` ที่ n8n container — ไม่งั้น cron 09:00 กลายเป็น 16:00
- Privacy ใน n8n: Save execution data = **errors only** / prune ≤ 7 วัน — ไม่งั้นข้อความดิบค้างใน log = เก็บ raw_message ทางอ้อม
- Claude call: timeout 15s, retry 1, temperature 0, บังคับ `tool_choice` — ไม่ parse JSON จาก text เอง
- Prompt rule: title ห้ามมี password/token/API key/ข้อมูลลูกค้า — ถ้ามีให้ตัดออก (test case คุม)
- Workflow JSON export เข้า GitHub (ลบ credentials ก่อน commit)
- Grafana dashboard ต่อ Postgres ด้วย read-only user (`grafana_ro`) ผ่าน Cloudflare Access — 4 panels: overview stat / งานต่อคน / done รายวัน / ตารางรายละเอียด

## Test Plan (12 เคส — สรุป)

ลงทะเบียน (รหัสถูก/ผิด/ซ้ำ), ยังไม่ verified ห้ามบันทึก, หลายงานในข้อความเดียว, update งานเดิมผ่าน existing_task_id, แปลงวันไทย ("ส่งศุกร์นี้"), priority จากบริบท ("ด่วน" = high), ข้อความไม่เกี่ยวกับงาน → ไม่บันทึก, LINE retry → ไม่ซ้ำ, Claude timeout → fallback, daily alert เรียงถูก, **ข้อมูลลับไม่หลุดเข้า DB**

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Haiku แปลงวันที่ไทยผิด | ส่ง {today} เข้า prompt + temperature 0 + test case คุม |
| Push quota เกิน free tier | demo จำกัด tester 2–3 คน (~60–90 push/เดือน) |
| NAS รีสตาร์ต/ไฟดับ | container `unless-stopped` — LINE retry webhook เอง + idempotency กันซ้ำ |
| คนพิมพ์ข้อมูลลับ | prompt ตัดออก + ไม่เก็บ raw_message + log errors only |
| Demo สดเน็ตล่ม | อัดคลิป backup ก่อนวัน demo |
