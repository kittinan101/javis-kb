# n8n Workflow Exports (disaster recovery)

Export โครงสร้าง workflow จาก n8n (n8n.holmcloud.net) เก็บเป็น snapshot ใน repo — อัพเดตทุกครั้งที่ workflow เปลี่ยน version สำคัญ

**ข้อจำกัด:** export ไม่รวม credential mapping (n8n เก็บ credentials แยก) — restore แล้วต้องผูก credentials ใหม่เอง:
- `Postgres Javis App` (javis_core DB)
- `Auth LINE Holm Agents` (LINE bearer)
- `Header Auth account 2` (Anthropic x-api-key)
- `GitHub account`
- env vars บนเครื่อง n8n: `LINE_CHANNEL_SECRET_HOLM_AGENTS`, `TELEGRAM_BOT_TOKEN_JAVIS`, `TELEGRAM_BOT_TOKEN_JAVIS_STAGING`

| ไฟล์ | Workflow | id |
|---|---|---|
| javis-line-gateway.json | Javis - LINE Gateway (Holm Agents) — ตัวหลัก | eSdweQkHfSqrJEcb |
| javis-qa-flow-test.json | Javis - QA Flow (test) — eval/ทดลอง ไม่ publish | fbSMHTBhvofTXYo3 |
| javis-housekeeping.json | Javis - Housekeeping (cron) | baVvvprul4c5jqol |
| javis-eval-runner.json | Javis - Eval Runner (T4.2) | ThKX1un3jTqG6zxN |
| javis-utils-send-alert.json | Javis - Utils: Send alert | BcRwxkgyar1mrKHB |
| javis-utils-telegram-info.json | Javis - Utils: Telegram info | xFaeFx5SrhYYuesV |
| javis-kb-push-files.json | Javis KB - Push files (utility) | qfYKrBJkXqKUlNyB |
