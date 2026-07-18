---
title: "ADR-001: ใช้ session cookie แทน JWT (ตัวอย่าง)"
id: ADR-001
domain: auth
type: adr
status: draft
lang: th
owners: ["lead-sa@team"]
tags: ["decision", "example"]
updated: 2026-07-18
classification: internal
---

# ADR-001: ใช้ session cookie แทน JWT

> ⚠️ **ไฟล์ตัวอย่าง** — แสดงรูปแบบ ADR ที่ Javis ใช้ตอบคำถามและตรวจ conflict ใน Impact Analysis

## บริบท
ต้องเลือกกลไก session สำหรับ web app ภายใน

## ทางเลือกที่พิจารณา
1. JWT stateless
2. Session cookie + DB store

## การตัดสินใจ
เลือกข้อ 2 — revoke ได้ทันที เหมาะกับระบบภายในที่ต้องคุมสิทธิ์เข้มงวด

## ผลที่ตามมา
- ต้องมีตาราง session ใน DB
- Logout / ปลด role มีผลทันที
