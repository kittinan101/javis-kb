# 📚 javis-kb — Team Knowledge Base

คลังความรู้กลางของทีม — เป็น **source of truth เดียว** ที่ Javis AI ใช้ตอบคำถาม, ทำ Impact Analysis และสร้างเอกสาร

## โครงสร้าง

```
javis-kb/
├── domains/            # ความรู้แยกตามโดเมนระบบ (auth, billing, ...)
│   └── <domain>/
│       ├── overview.md         # ภาพรวมโดเมน
│       ├── api-contracts.md    # สัญญา API ของโดเมน
│       └── decisions/          # ADR ของโดเมนนั้น
├── features/           # สเปกฟีเจอร์ FEAT-xxx
├── plans/              # แผนงานจาก Plan Generator PLAN-xxx
├── guides/             # how-to, setup, คู่มือ
├── glossary/           # ศัพท์ไทย↔อังกฤษ (สำคัญมากต่อการค้นหาภาษาไทย)
├── figma/              # cache design JSON จาก Figma API (generate อัตโนมัติ)
├── templates/          # เทมเพลตเอกสารแต่ละประเภท
└── scripts/            # validation scripts (ใช้ใน CI)
```

## กติกาสำคัญ

1. **ทุกไฟล์ `.md` ต้องมี frontmatter ครบ** ตาม `.frontmatter-schema.json` — CI จะ reject ถ้าไม่ผ่าน
2. **ห้ามเด็ดขาด:** credentials / API keys / ข้อมูลลูกค้า / PII / ข้อมูลการเงิน-HR — มี gitleaks สแกนทุก commit
3. เขียนไทยหรืออังกฤษก็ได้ (ระบุใน `lang`) — ศัพท์เทคนิคใช้อังกฤษ และเพิ่มคำแปลใน glossary เมื่อมีศัพท์ใหม่
4. อัพเดตเอกสารแล้วให้แก้ field `updated` เสมอ

## Quick Start

```bash
# ติดตั้ง pre-commit hook (สแกน secret ก่อน commit)
./scripts/install-hooks.sh

# validate frontmatter ทั้ง repo (เหมือนที่ CI รัน)
node scripts/validate-frontmatter.mjs
```

## เพิ่มเอกสารใหม่

1. copy template จาก `templates/` ไปยังโฟลเดอร์ที่ถูกต้อง
2. กรอก frontmatter ให้ครบ (id ห้ามซ้ำ — ดูเลขล่าสุดในโฟลเดอร์)
3. เปิด PR → CI ตรวจ frontmatter + secret scan → merge

ดูรายละเอียดใน [CONTRIBUTING.md](CONTRIBUTING.md)
