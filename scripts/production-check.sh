#!/bin/bash
# Supabase Production Deployment Guide
# This script helps verify everything is ready for production

echo "🔒 SUPABASE PRODUCTION READINESS CHECK"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_count=0
pass_count=0

# Function to check environment variable
check_env() {
  local var_name=$1
  local required=$2
  check_count=$((check_count + 1))
  
  if [ -z "${!var_name}" ]; then
    if [ "$required" = "true" ]; then
      echo -e "${RED}✗ $var_name${NC} (MISSING - REQUIRED)"
    else
      echo -e "${YELLOW}⚠ $var_name${NC} (not set)"
    fi
  else
    echo -e "${GREEN}✓ $var_name${NC}"
    pass_count=$((pass_count + 1))
  fi
}

# Check required variables
echo "Environment Variables:"
echo "─────────────────────"
check_env "NEXT_PUBLIC_SUPABASE_URL" "true"
check_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "true"
check_env "SUPABASE_SERVICE_ROLE_KEY" "true"
check_env "ADMIN_SECRET" "true"
check_env "ADMIN_USERNAME" "true"
check_env "ADMIN_PASSWORD" "true"

echo ""
echo "Results: $pass_count/$check_count checks passed"
echo ""

# Additional checks
echo "Security Checks:"
echo "────────────────"

# Check if credentials are in git
if git rev-parse --git-dir > /dev/null 2>&1; then
  if git ls-files --cached | grep -E "\.env$|secrets|credentials" > /dev/null; then
    echo -e "${RED}✗ Sensitive files tracked in git${NC}"
  else
    echo -e "${GREEN}✓ No .env files in git track${NC}"
  fi
fi

# Check if .env is in .gitignore
if [ -f ".gitignore" ]; then
  if grep -q "\.env" .gitignore; then
    echo -e "${GREEN}✓ .env in .gitignore${NC}"
  else
    echo -e "${RED}✗ .env NOT in .gitignore${NC}"
  fi
fi

echo ""
echo "Next Steps:"
echo "──────────"
echo "1. [ ] Add all required environment variables"
echo "2. [ ] Run: npm run test:supabase"
echo "3. [ ] Execute: supabase/rls-production.sql in Supabase dashboard"
echo "4. [ ] Deploy: npm run build && npm run start"
echo "5. [ ] Monitor: Check logs in Supabase dashboard"
echo ""
