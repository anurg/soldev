#!/bin/bash

echo "Testing frontend login flow..."

# Register a new user
echo -e "\n1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Frontend Test", "email": "frontend_test@example.com", "password": "password123"}')

echo "Register response: $REGISTER_RESPONSE"

# Login
echo -e "\n2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "frontend_test@example.com", "password": "password123"}')

echo "Login response: $LOGIN_RESPONSE"

# Check if we got a token
if [[ $LOGIN_RESPONSE == *"token"* ]]; then
  echo -e "\n✓ Login API is working correctly"
  echo "The frontend should be able to login successfully."
  echo ""
  echo "If login is still not working in the browser, please:"
  echo "1. Open browser DevTools (F12)"
  echo "2. Go to Console tab"
  echo "3. Try logging in"
  echo "4. Share any error messages you see"
else
  echo -e "\n✗ Login API failed"
fi
