#!/bin/bash

echo "=== COMPREHENSIVE CRM DEPLOYMENT READINESS TEST ==="
echo "Testing all core CRM workflow features..."
echo ""

BASE_URL="http://localhost:3000"
TEST_RESULTS=""

# Function to test API endpoint
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo "Testing: $description"
    if [ -z "$data" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint" -H "Content-Type: application/json" -d "$data")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "204" ]; then
        echo "✅ PASS: $description (HTTP $response)"
        TEST_RESULTS="$TEST_RESULTS✅ $description\n"
    else
        echo "❌ FAIL: $description (HTTP $response)"
        TEST_RESULTS="$TEST_RESULTS❌ $description (HTTP $response)\n"
    fi
    echo ""
}

# Test 1: Client Management
echo "=== 1. CLIENT MANAGEMENT TESTING ==="
test_api "GET" "/api/clients" "" "Get all clients"
test_api "POST" "/api/clients" '{"firstName":"Test","lastName":"User","email":"test@example.com","contactType":"client"}' "Create new client"

# Test 2: Project Management  
echo "=== 2. PROJECT MANAGEMENT TESTING ==="
test_api "GET" "/api/projects" "" "Get all projects"
test_api "POST" "/api/projects" '{"name":"Test Project","status":"active","priority":"medium"}' "Create new project"

# Test 3: Estimates Management
echo "=== 3. ESTIMATES MANAGEMENT TESTING ==="
test_api "GET" "/api/estimates" "" "Get all estimates"
test_api "POST" "/api/estimates" '{"title":"Test Estimate","status":"draft","subtotal":1000,"total":1000,"items":[]}' "Create new estimate"

# Test 4: Appointments Management
echo "=== 4. APPOINTMENTS MANAGEMENT TESTING ==="
test_api "GET" "/api/appointments" "" "Get all appointments"
test_api "POST" "/api/appointments" '{"title":"Test Appointment","startTime":"2025-09-10T10:00:00Z","endTime":"2025-09-10T11:00:00Z","status":"scheduled","type":"consultation"}' "Create new appointment"

# Test 5: Health Check
echo "=== 5. HEALTH CHECK TESTING ==="
test_api "GET" "/api/health" "" "System health check"

echo "=== TEST SUMMARY ==="
echo -e "$TEST_RESULTS"

echo "=== DEPLOYMENT READINESS ASSESSMENT ==="
if echo "$TEST_RESULTS" | grep -q "❌"; then
    echo "❌ SYSTEM NOT READY: Some tests failed"
    exit 1
else
    echo "✅ SYSTEM READY: All core workflow tests passed"
    echo "✅ Client management: Working"
    echo "✅ Project management: Working" 
    echo "✅ Estimates management: Working"
    echo "✅ Appointments management: Working"
    echo ""
    echo "🚀 CRM IS READY FOR DEPLOYMENT!"
fi
