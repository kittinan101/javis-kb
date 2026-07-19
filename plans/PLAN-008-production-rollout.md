---
title: "แผนใช้งานจริง (Production Rollout) — ประเมินจากตัวเลข POC จริง"
id: PLAN-008
domain: javis
type: plan
status: draft
lang: th
owners: ["kittinan101"]
related: ["PLAN-006", "PLAN-007", "PLAN-003"]
has_migration: false
risk: medium
tags: ["production", "rollout", "cost-estimate", "migration"]
updated: 2026-07-19
classification: internal
---

# PLAN-008: แผนใช้งานจริง (Production Rollout)

> หลักการประเมิน: **ทุกตัวเลขต่อยอดจากค่าที่วัดจริงใน POC** (context 80–83k tokens/คำถาม, cache hit $0.04–0.05, cache write $0.32, ตอบ 15–25 วิ) — ไม่ใช่ตัวเลขการตลาด
> เริ่มเมื่อ: POC นำเสนอผ่านตามเกณฑ์ PLAN-007 §5

## 1. สมมติฐานการใช้งานจริง (ปรับได้ — ทุกสูตรผูกกับตัวแปรนี้)

| ตัวแปร | ค่าตั้งต้น | หมายเหตุ |
|---|---|---|
| จำนวนผู้ใช้ | 10 คน | ทีม dev + PM/BA/QA |
| คำถาม/คน/วันทำการ | 5 | ช่วงแรกอาจสูงกว่า (ของใหม่) แล้วนิ่ง |
| รวม/เดือน | ~1,100 คำถาม | 10 × 5 × 22 วัน |
| ขนาด KB | โต 2–3 เท่าใน 6 เดือน | P2 เปิดให้ทีม upload |

## 2. ค่าใช้จ่ายรายเดือนโดยประมาณ

### 2.1 Claude API — ก้อนใหญ่สุดและผันตามการใช้

การกระจายคำถามจริงของทีมไม่ได้มาติดกันทุก 5 นาที → คาด cache write ~40% ของคำถาม:

| Scenario | สูตร | ต่อเดือน |
|---|---|---|
| **วันนี้ (whole-KB retrieval)** | 1,100 × (0.4×$0.32 + 0.6×$0.045) | **~$170** |
| KB โต 2 เท่า (ยัง whole-KB) | ~2 เท่าของบน | ~$340 ❌ ไม่ยั่งยืน |
| **หลังทำ targeted retrieval** (ADR-003 แผนเดิม: local clone + ค้นเฉพาะไฟล์เกี่ยว ~10–15k tokens/คำถาม) | input ลด ~6 เท่า | **~$30–50** ✅ |

**ข้อสรุปสำคัญ: targeted retrieval เป็นงานบังคับก่อน production จริง** (ตอนนี้ KB 83k tokens — เกิน threshold 80k ของ ADR-003 แล้ว) — ไม่ใช่แค่เรื่อง cost แต่เรื่อง scale

### 2.2 ก้อนอื่น

| รายการ | ต่อเดือน | หมายเหตุ |
|---|---|---|
| n8n (self-host บน env กลาง) | $0 | ใช้เครื่ององค์กร |
| Postgres | $0–15 | รวมในเครื่องเดียวกันได้ / managed ~$15 |
| LINE OA | $0 (฿0) | reply-token-first ใช้ push น้อยมาก — ถ้าทีมโต >30 คนค่อยดู paid plan (~฿1,200/เดือน) |
| Telegram | $0 | ฟรีตลอด |
| Eval (quality gate) | ~$10 | ~4 รอบ/เดือน × $2.5 |
| Haiku intent classify | ~$1 | ~$0.0002/ข้อความ |
| **รวมช่วงแรก (ก่อน targeted retrieval)** | **~$180–200/เดือน** | |
| **รวมหลัง targeted retrieval** | **~$45–75/เดือน** | เป้าที่ควรไปให้ถึงใน 1 เดือนแรก |

> Phase 2+ เพิ่ม: Impact Analysis (Opus) ~$0.10–0.30/รายงาน; Phase 4 เพิ่ม: budget/job ของ Dev Agent (~$1–8) + Railway/Render + GitHub Team — ประเมินละเอียดใน PLAN-003/005 เมื่อถึงเวลา

## 3. Environment กลาง — สเปกขั้นต่ำ

- เครื่องเดียวพอสำหรับ Phase 1–3: **2–4 vCPU / 8GB RAM / 50GB disk** (n8n + Postgres 16 + local KB clone) — VM องค์กร, Docker host กลาง, หรือ cloud VM (~$20–40/เดือน ถ้าไม่มีของเดิม)
- Network: HTTPS webhook เข้าถึงได้จากภายนอก (Cloudflare Tunnel แบบเดียวกับ POC ใช้ได้)
- สิทธิ์: admin ของ environment ต้องเป็นคนในทีม (ไม่ใช่เครื่องส่วนตัวใคร)

## 4. Gap ที่ต้องปิดก่อนเปิดใช้จริง (POC → Production)

| # | งาน | ทำไมบังคับ | แรง |
|---|---|---|---|
| G1 | **Targeted retrieval** (local clone + keyword/frontmatter filter ตาม ADR-003) — **ออกแบบรองรับ multi-repo ตั้งแต่แรก** (KB + source code repos ของ project จริง ตาม features/FEAT-007 — คำตอบเรื่อง code ต้อง ground จาก code จริง) | cost ยั่งยืน + KB เกิน threshold + ปูทาง F7 | 1–2 วัน |
| G2 | **n8n hardening** (PLAN-002 T1.3 ที่ค้าง): encryption key ใหม่, Postgres backend, export cron | production-grade | 0.5 วัน |
| G3 | **Backup ครบวงจร**: pg_dump cron + n8n export cron + ทดสอบ restore จริง 1 ครั้ง | ไม่มี backup = ไม่ใช่ production | 0.5 วัน |
| G4 | **Rotate secrets ทั้งชุดตอน cutover** (LINE, Telegram, Anthropic, DB, GitHub PAT) | POC เคยมี secret ผ่านแชท/history | 0.5 วัน |
| G5 | Monitoring: UptimeRobot + error alert (มีแล้ว) ชี้ env ใหม่ | | 0.25 วัน |
| G6 | PDPA: privacy notice แจ้งทีม + retention cron (90 วัน chat, 1 ปี audit) | กติกาองค์กร | 0.5 วัน |
| G7 | เก็บตก UX: push fallback เมื่อตอบเกิน reply token, Telegram typing action | กันคำตอบหายเมื่อช้า | 0.5 วัน |
| G8 | Onboarding ทีม: Roster + seed roles + guide การใช้ + ประกาศ | | 0.5 วัน + ฝั่งทีม |

**รวมแรงฝั่ง build: ~4–6 วันทำการ** (ไม่รวมรอ approve/จัดหาเครื่อง)

## 5. แผนย้าย (cutover)

1. ตั้ง env กลาง (Docker: n8n + Postgres) + Tunnel — 1 วัน
2. Restore: n8n workflows จาก `n8n-exports/` + javis_core จาก prisma migrations + config seed — 0.5 วัน
3. ปิด gap G1–G7 บน env ใหม่ (ทำบน env ใหม่เลย ไม่แตะ POC) — 3–4 วัน
4. ทดสอบด้วย **staging bots** (@jarvis_holm_staging_bot + LINE OA staging) จน eval ผ่าน ≥ baseline 96.2% — 0.5 วัน
5. **Cutover**: เปลี่ยน webhook LINE/Telegram ชี้ env ใหม่ + rotate secrets — 0.5 ชม. (ย้อนกลับได้ใน 5 นาทีถ้าพัง: ชี้ webhook กลับ NAS)
6. รัน parallel 2–3 วัน (NAS standby) → ปลดระวาง POC

**Timeline รวม: ~1.5 สัปดาห์หลังได้เครื่อง** | **Rollback: เปลี่ยน webhook URL กลับ = จบ**

## 6. คน/การดูแลต่อเนื่อง

| บทบาท | แรงต่อสัปดาห์ |
|---|---|
| Ops (ดู alert, เครดิต API, backup) | ~1–2 ชม. — ส่วนใหญ่อัตโนมัติแล้ว (cost watch, error alert, housekeeping) |
| Content owner (คุมคุณภาพ KB, review PR เอกสาร) | ~2–3 ชม. — สำคัญสุดต่อ accuracy ระยะยาว |
| Admin (อนุมัติ user, ปรับ config) | ~15 นาที — ผ่านปุ่มในแชททั้งหมด |

## 7. เกณฑ์ตัดสินใจ & ความเสี่ยง

**Go-live เมื่อ:** POC ผ่าน + งบ ~$50–200/เดือนอนุมัติ + เครื่อง env กลางพร้อม + G1–G6 เสร็จ + eval บน env ใหม่ ≥ baseline

| ความเสี่ยง | รับมือ |
|---|---|
| ค่า API บานถ้าทีมใช้เยอะกว่าคาด | rate limit ต่อคน (มีแล้ว) + cost watch รายวัน + งบ alert 80% |
| KB โตจน accuracy ตก | eval gate ทุกการเปลี่ยนใหญ่ + threshold ใน ADR-003 |
| คนดูแลคนเดียว (bus factor) | ทุกอย่างอยู่ใน git (KB, schema, workflow exports, แผน) — ใครก็ restore ได้ตาม README |
| Anthropic outage/credit | error message + alert (พิสูจน์แล้วจากเหตุจริง 19 ก.ค.) |
