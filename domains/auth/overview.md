---
title: "Auth Domain Overview (ตัวอย่าง — แก้เป็นของจริง)"
id: DOM-001-auth
domain: auth
type: overview
status: draft
lang: th
owners: ["lead-sa@team"]
tags: ["auth", "example"]
updated: 2026-07-18
classification: internal
---

# Auth Domain — ภาพรวม

> ⚠️ **ไฟล์ตัวอย่าง** — แทนที่เนื้อหาด้วยข้อมูลระบบจริงของทีม แล้วเปลี่ยน status เป็น approved

## หน้าที่ของโดเมนนี้
จัดการการยืนยันตัวตน (login/logout), session, และ role ของผู้ใช้

## Components หลัก
- `src/app/api/auth/*` — auth endpoints
- `src/lib/session.ts` — session helper

## การเชื่อมกับโดเมนอื่น
- ทุกโดเมนเรียก `getSession()` เพื่อเช็คสิทธิ์ก่อนทำงาน
