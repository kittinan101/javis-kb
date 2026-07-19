# Standing Workflow — javis-kb (inject ทุก session ผ่าน SessionStart hook)

เมื่อทำงานใดๆ ใน repo นี้เสร็จ ให้ทำตามลำดับนี้เสมอ:

1. **Review งานในมุม:** dev, frontend, backend, UX/UI, QA, tech lead, dev lead, PM, BA — งานเล็ก review เองครบทุกมุมได้ งานใหญ่/สำคัญให้ dispatch reviewer agents อิสระ (แนวทางเดียวกับ ADR-002)
2. **หากงานไม่มีปัญหา** (หรือแก้ปัญหาที่เจอแล้ว) → **แบ่ง commit ให้เหมาะสม** ตามหมวดงาน + push (commit convention: `docs(<domain>): <สรุปสั้น>`)
3. **Update task status** — ติ๊ก checkbox ใน plan ที่เกี่ยวข้อง (`plans/PLAN-xxx`), อัพเดต field `updated`, เพิ่มแถว Log ใน `plans/setup-checklist.md`
4. **Update Notion status page** — หน้า "📌 Javis — Project Status" (page id `3a27995ac8318167afd6c0db11482857` ใต้หน้า Javis AI) ผ่าน Notion MCP: อัพเดต % สถานะ, ติ๊ก/เพิ่มรายการงานที่ยังไม่เรียบร้อย, แก้วันที่ในหัวเรื่อง — ทำทุกครั้งที่สถานะ milestone/task สำคัญเปลี่ยน (กติกาจาก user 2026-07-19: "project ยังไม่เรียบร้อยทั้งหมด ให้ update ใน notion ด้วย") — เนื้อหาเป็นสรุปสถานะเท่านั้น ห้ามย้าย design docs กลับไป Notion (repo ยังเป็น source of truth)
5. **ถ้าไม่มีอะไรต้องตัดสินใจ** (ไม่ติด decision ที่เป็นของ user) → **ทำ task ถัดไปต่อได้เลย** — ดู task ถัดไปจาก `plans/setup-checklist.md` และ plan ที่ `status: in_progress`

หมายเหตุ: ทุกไฟล์ .md ใน domains/, features/, plans/, guides/ ต้องผ่าน `node scripts/validate-frontmatter.mjs` ก่อน commit (pre-commit hook + CI บังคับอยู่แล้ว)
