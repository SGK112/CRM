#!/bin/bash

# Test script for client search functionality
echo "Testing Client Search API..."

# Test health endpoint first
echo "1. Testing API health:"
curl -s "http://localhost:3001/api/health" | jq '.'

echo -e "\n2. Testing clients endpoint (all clients):"
curl -s "http://localhost:3001/api/clients" | jq '. | length'

echo -e "\n3. Testing clients count endpoint:"
curl -s "http://localhost:3001/api/clients/count" | jq '.'

echo -e "\n4. Testing search with query parameter (search=smith):"
curl -s "http://localhost:3001/api/clients?search=smith" | jq '. | length'

echo -e "\n5. Testing search count with query parameter:"
curl -s "http://localhost:3001/api/clients/count?search=smith" | jq '.'

echo -e "\n6. Testing status filter:"
curl -s "http://localhost:3001/api/clients?status=active" | jq '. | length'

echo -e "\n7. Testing combined search and status filter:"
curl -s "http://localhost:3001/api/clients?search=john&status=lead" | jq '. | length'

echo -e "\nSearch API test completed."
