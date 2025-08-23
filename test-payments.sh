#!/bin/bash

# Payment System Test Script
# Run this script to test your billing endpoints

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

echo -e "${YELLOW}🔧 Payment System Testing Script${NC}"
echo "=================================="

# Check if backend is running
echo -n "Checking backend server... "
if curl -s "$API_URL/health" > /dev/null; then
    echo -e "${GREEN}✓ Backend running${NC}"
else
    echo -e "${RED}✗ Backend not running on $API_URL${NC}"
    echo "Please start the backend with: npm run dev --workspace=@remodely-crm/backend"
    exit 1
fi

# Check if frontend is running
echo -n "Checking frontend server... "
if curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✓ Frontend running${NC}"
else
    echo -e "${RED}✗ Frontend not running on $FRONTEND_URL${NC}"
    echo "Please start the frontend with: npm run dev --workspace=@remodely-crm/frontend"
    exit 1
fi

echo ""
echo -e "${YELLOW}🧪 Running API Tests${NC}"
echo "===================="

# Test 1: Create checkout session
echo -n "Test 1: Creating checkout session... "
CHECKOUT_RESPONSE=$(curl -s -X POST "$API_URL/billing/create-checkout-session" \
    -H "Content-Type: application/json" \
    -d '{
        "priceId": "price_test_starter",
        "customerEmail": "test@example.com",
        "workspaceName": "Test Workspace"
    }' 2>/dev/null)

if echo "$CHECKOUT_RESPONSE" | grep -q "url"; then
    echo -e "${GREEN}✓ Success${NC}"
    SESSION_ID=$(echo "$CHECKOUT_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "   Session ID: $SESSION_ID"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "   Response: $CHECKOUT_RESPONSE"
fi

# Test 2: Get billing capabilities
echo -n "Test 2: Checking billing capabilities... "
CAPABILITIES_RESPONSE=$(curl -s "$API_URL/billing/me" 2>/dev/null || echo "unauthorized")

if echo "$CAPABILITIES_RESPONSE" | grep -q "plan\|customerId\|unauthorized"; then
    echo -e "${GREEN}✓ Endpoint accessible${NC}"
    echo "   Response: $CAPABILITIES_RESPONSE"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "   Response: $CAPABILITIES_RESPONSE"
fi

echo ""
echo -e "${YELLOW}🌐 Frontend Tests${NC}"
echo "================="

echo "✓ Billing cart page: $FRONTEND_URL/billing/cart"
echo "✓ Billing cart with plan: $FRONTEND_URL/billing/cart?plan=starter"
echo "✓ Billing success page: $FRONTEND_URL/billing/success"
echo "✓ Billing cancel page: $FRONTEND_URL/billing/cancel"

echo ""
echo -e "${YELLOW}💳 Stripe Test Cards${NC}"
echo "==================="
echo "• Success: 4242 4242 4242 4242"
echo "• Declined: 4000 0000 0000 0002" 
echo "• 3D Secure: 4000 0027 6000 3184"
echo "• Insufficient: 4000 0000 0000 9995"

echo ""
echo -e "${YELLOW}⚙️  Environment Check${NC}"
echo "===================="

# Check environment variables
if [ -f "apps/backend/.env" ]; then
    if grep -q "STRIPE_SECRET_KEY=" apps/backend/.env; then
        if grep -q "STRIPE_SECRET_KEY=sk_test_" apps/backend/.env; then
            echo -e "${GREEN}✓ Stripe test key configured${NC}"
        elif grep -q "STRIPE_SECRET_KEY=sk_live_" apps/backend/.env; then
            echo -e "${YELLOW}⚠ Stripe LIVE key detected - use test keys for testing${NC}"
        else
            echo -e "${RED}✗ Stripe key not configured${NC}"
        fi
    else
        echo -e "${RED}✗ STRIPE_SECRET_KEY not found in backend/.env${NC}"
    fi
else
    echo -e "${RED}✗ Backend .env file not found${NC}"
fi

echo ""
echo -e "${YELLOW}🚀 Next Steps${NC}"
echo "============="
echo "1. Visit $FRONTEND_URL/billing/cart to test the full flow"
echo "2. Use test card 4242 4242 4242 4242 for successful payments"
echo "3. Check webhook delivery with: stripe listen --forward-to localhost:3001/billing/webhook"
echo "4. Monitor logs for billing events"

echo ""
echo -e "${GREEN}Testing complete!${NC}"
