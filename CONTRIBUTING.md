# การเพิ่มเนื้อหาเข้า KB

## ใครเพิ่มได้บ้าง
- **ทีม dev:** แก้ไฟล์ตรงผ่าน git → เปิด PR
- **ทีม non-dev:** ส่งผ่าน Javis ในแชท ("Javis, save this meeting note") — ระบบแปลงเป็น Markdown + เปิด PR ให้อัตโนมัติ (Phase 2)

## ขั้นตอน (สำหรับ dev)
1. copy template ที่ตรงประเภทจาก `templates/` ไปวางในโฟลเดอร์ที่ถูกต้อง
2. ตั้งชื่อไฟล์: `<ID>-<slug>.md` เช่น `FEAT-042-sso-login.md`
3. กรอก frontmatter ให้ครบ — โดยเฉพาะ `id` (ห้ามซ้ำ), `domain`, `owners`, `updated`
4. เปิด PR → CI ตรวจ frontmatter + gitleaks → ให้เพื่อน review 1 คน → merge

## ห้ามเด็ดขาด (Data Classification)

| ✅ เข้าได้ | ❌ ห้าม |
|---|---|
| Architecture, design docs | Credentials, API keys, passwords |
| Meeting notes (งาน) | ข้อมูลลูกค้า / PII (ชื่อจริง, เบอร์, เลขบัตร) |
| Requirements, plans | ข้อมูลการเงิน / HR / เงินเดือน |
| ตัวอย่างโค้ด (ไม่มี secrets) | สัญญา / เอกสารกฎหมายลับ |

พบว่า commit หลุด → แจ้ง Admin ทันทีเพื่อ purge history + rotate credential

## Commit convention
`docs(<domain>): <สรุปสั้น>` เช่น `docs(auth): add ADR-002 session strategy`
