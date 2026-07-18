# Standing Workflow — javis-kb (inject ทุก session ผ่าน SessionStart hook)

เมื่อทำงานใดๆ ใน repo นี้เสร็จ ให้ทำตามลำดับนี้เสมอ:

1. **Review งานในมุม:** dev, frontend, backend, UX/UI, QA, tech lead, dev lead, PM, BA — งานเล็ก review เองครบทุกมุมได้ งานใหญ่/สำคัญให้ dispatch reviewer agents อิสระ (แนวทางเดียวกับ ADR-002)
2. **หากงานไม่มีปัญหา** (หรือแก้ปัญหาที่เจอแล้ว) → **แบ่ง commit ให้เหมาะสม** ตามหมวดงาน + push (commit convention: `docs(<domain>): <สรุปสั้น>`)
3. **Update task status** — ติ๊ก checkbox ใน plan ที่เกี่ยวข้อง (`plans/PLAN-xxx`), อัพเดต field `updated`, เพิ่มแถว Log ใน `plans/setup-checklist.md`
4. **ถ้าไม่มีอะไรต้องตัดสินใจ** (ไม่ติด decision ที่เป็นของ user) → **ทำ task ถัดไปต่อได้เลย** — ดู task ถัดไปจาก `plans/setup-checklist.md` และ plan ที่ `status: in_progress`

หมายเหตุ: ทุกไฟล์ .md ใน domains/, features/, plans/, guides/ ต้องผ่าน `node scripts/validate-frontmatter.mjs` ก่อน commit (pre-commit hook + CI บังคับอยู่แล้ว)
