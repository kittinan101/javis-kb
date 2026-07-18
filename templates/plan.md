---
title: "<ชื่อแผนงาน>"
id: PLAN-000
domain: <domain>
type: plan
status: draft   # draft → approved → in_progress → done
lang: th
owners: ["<owner@team>"]
related: []
has_migration: false
risk: low
tags: []
updated: 2026-01-01
classification: internal
---

# PLAN-000: <ชื่อแผนงาน>

## 1. Requirement Summary

## 2. Scope (In / Out)

## 3. Impact Analysis

## 4. Technical Approach
ไฟล์ที่แก้, schema changes

## 5. Task Breakdown + Acceptance Criteria
ทุกข้อต้องทดสอบได้จริง — AC หลักกำหนดโดยคนก่อน approve

## 6. Migration Gate
- agent สร้างด้วย `prisma migrate dev --create-only` เท่านั้น
- ห้ามรัน migrate deploy บน uat/prod — มนุษย์รันผ่าน approved CI step

## 7. Risks & Rollback

---
## Approvals
<!-- ระบบเติมอัตโนมัติ: ผู้ approve + เวลา -->
