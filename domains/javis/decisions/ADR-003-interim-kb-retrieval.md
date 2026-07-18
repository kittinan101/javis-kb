---
title: "ADR-003: Phase 1 KB retrieval — whole-KB context ผ่าน GitHub API (interim)"
id: ADR-003
domain: javis
type: adr
status: approved
lang: th
owners: ["kittinan101"]
related: ["PLAN-002", "ADR-002", "DOM-003-javis-implementation-spec"]
tags: ["rag", "retrieval", "design-decision"]
updated: 2026-07-18
classification: internal
---

# ADR-003: Phase 1 KB retrieval — whole-KB context ผ่าน GitHub API (interim)

## Context

PLAN-002 T2.4 กำหนด retrieval = agentic search บน local clone (git pull บนเครื่อง n8n) ซึ่งต้องตั้ง volume/clone บน NAS (งานฝั่ง infra) ขณะที่ KB ปัจจุบันมีเพียง ~15 ไฟล์ (~75KB ≈ 20k tokens) — เล็กพอที่จะส่งทั้งคลังเข้า context ได้โดยตรง

## Decision

**Phase 1 (KB ≤ ~50 ไฟล์): ดึงทุกไฟล์ .md ผ่าน GitHub API (Trees + Blobs) แล้วส่งทั้งชุดเป็น document blocks เข้า Claude ต่อคำถาม** โดย:

- เรียงไฟล์ตาม path แบบ deterministic + วาง `cache_control: {type: "ephemeral"}` ที่ document block สุดท้าย → คำถามซ้ำใน 5 นาที hit cache (~10% ของ input price)
- เปิด `citations: {enabled: true}` ทุก document block — API การันตี citation ไม่ hallucinate
- system prompt โหลดจาก `prompts/qa-system.md` (ไฟล์ในคลังเดียวกัน — เปลี่ยน prompt = commit เดียว)
- Model: `claude-sonnet-5` ตาม routing ใน spec (Haiku = classify / Sonnet = Q&A)

## เหตุผล

1. **Zero infra เพิ่ม** — ใช้ GitHub credential ที่มีใน n8n อยู่แล้ว ไม่ต้องรอ clone/volume บน NAS
2. **Freshness ดีกว่าแผนเดิม** — อ่านสดจาก main ทุกคำถาม (แผนเดิม git pull ทุก 5 นาที)
3. **Accuracy สูงสุดที่ scale นี้** — ไม่มี retrieval miss เพราะเอกสารทั้งหมดอยู่ใน context; keyword search ที่ทำเองย่อมมี recall ต่ำกว่า
4. **Cache ทำให้ cost รับได้** — ~20k tokens/คำถาม, hit cache เหลือ ~2k เทียบเท่า

## Trade-offs ที่รับ

- Latency เพิ่ม ~3–6 วิ (ดึง blob ~17 ครั้ง/คำถาม) — ยังอยู่ในเป้า < 60 วิ สบาย; แก้ได้ด้วย blob cache ภายหลัง
- พึ่ง GitHub availability ต่อคำถาม (เดิมพึ่งแค่ตอน sync)
- Cost input สูงกว่า targeted retrieval — ยอมรับที่ scale ปัจจุบัน

## เงื่อนไขเปลี่ยนแผน (กลับไปตามแผนเดิม/ไปต่อ)

| เงื่อนไข | ทำอะไร |
|---|---|
| KB > ~50 ไฟล์ หรือ input > ~80k tokens/คำถาม | สลับเป็น local clone + keyword/frontmatter filter ตาม T2.4 เดิม |
| KB > 500 ไฟล์ หรือ accuracy < 70% | pgvector + embeddings ตาม threshold ใน PLAN-002 §7 |
| GitHub API rate limit เป็นปัญหา | local clone ทันที |

## ผลวัดจริง (2026-07-18 — workflow "Javis - QA Flow (test)")

- Context ทั้ง KB = **66,551 tokens** (มากกว่าที่ประเมิน — plans/ คือก้อนใหญ่) → ใกล้ threshold 80k แล้ว ต้อง monitor
- คำถามแรก (cache write): ~17.5 วิ / คำถามถัดไปใน 5 นาที (cache hit เต็ม 66,551 tokens): ~9.5 วิ
- ทดสอบ positive ("Javis มีฟีเจอร์อะไรบ้าง") → ตอบครบ 6 ฟีเจอร์ + citation ตรง expect_cite
- ทดสอบ negative ("เงินเดือนทีมเท่าไหร่") → "ไม่พบข้อมูลใน KB" + อ้าง Data Classification + ไม่เดา

## Consequences

- T2.4 checkbox "KB sync mechanism (local clone + git pull)" เปลี่ยนสถานะเป็น "deferred — ทำเมื่อชนเงื่อนไขข้างบน"
- Workflow Q&A ทดสอบแยก (ไม่เสียบ gateway) จนกว่า T2.3 RBAC จะพร้อม — กัน KB internal รั่วถึง user ที่ยังไม่ลงทะเบียน
