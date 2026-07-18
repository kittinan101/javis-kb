#!/usr/bin/env bash
# install-hooks.sh — ติดตั้ง pre-commit hook: gitleaks scan + frontmatter validate
set -euo pipefail

HOOK=".git/hooks/pre-commit"

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "⚠️  ยังไม่มี gitleaks — ติดตั้งด้วย: brew install gitleaks"
  exit 1
fi

cat > "$HOOK" <<'EOF'
#!/usr/bin/env bash
set -e
echo "🔍 gitleaks: สแกน secret/PII ในไฟล์ที่ stage..."
gitleaks protect --staged --config .gitleaks.toml

echo "🔍 validate frontmatter..."
if command -v node >/dev/null 2>&1 && [ -d node_modules/js-yaml ]; then
  node scripts/validate-frontmatter.mjs
else
  echo "   (ข้าม — รัน 'npm install --no-save js-yaml ajv ajv-formats' เพื่อเปิดใช้ local validation, CI ตรวจให้อยู่ดี)"
fi
EOF

chmod +x "$HOOK"
echo "✅ ติดตั้ง pre-commit hook แล้วที่ $HOOK"
