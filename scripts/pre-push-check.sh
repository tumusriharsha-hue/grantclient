#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "🔍 Checking for secrets in source..."
if rg -i "sk_live_|sk_test_|eyJhbGciOiJ[A-Za-z0-9_-]{10,}|SUPABASE_SERVICE_ROLE_KEY=ey|GOOGLE_CLIENT_SECRET=[^y]" \
  --glob '!node_modules' --glob '!.next' --glob '!package-lock.json' --glob '!.env*' \
  --glob '!scripts/pre-push-check.sh' --glob '!.env.example' \
  app components lib services types data hooks 2>/dev/null; then
  echo "❌ Potential secrets found in source files"
  exit 1
fi

echo "🔐 Verifying env files are gitignored..."
for f in .env .env.local .env.production.local; do
  if [[ -f "$f" ]] && ! git check-ignore -q "$f" 2>/dev/null; then
    echo "❌ $f exists but is NOT gitignored"
    exit 1
  fi
done
echo "✅ Env files gitignore OK"

echo "📦 Running lint..."
npm run lint

echo "🏗️  Running production build..."
npm run build

echo "📝 Checking for console.log in app/components/lib..."
if rg "console\.(log|debug|info)\(" app components lib --glob '*.tsx' --glob '*.ts' 2>/dev/null; then
  echo "⚠️  Found console.log — review before pushing"
else
  echo "✅ No console.log in production paths"
fi

echo "🔒 Running npm audit (informational)..."
npm audit || true

echo ""
echo "✅ Pre-push checks passed!"
