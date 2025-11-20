#!/bin/bash

# Base URL
API_URL="http://localhost:8080/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting verification..."

# 1. Register
echo -e "\n${GREEN}1. Registering new user...${NC}"
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\": \"Flow Test User\", \"email\": \"flowtest${TIMESTAMP}@example.com\", \"password\": \"password123\"}")

echo "Response: $REGISTER_RESPONSE"

if [[ $REGISTER_RESPONSE == *"token"* ]]; then
  echo -e "${GREEN}Registration successful${NC}"
else
  echo -e "${RED}Registration failed${NC}"
  exit 1
fi

# 2. Login
echo -e "\n${GREEN}2. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"flowtest${TIMESTAMP}@example.com\", \"password\": \"password123\"}")

echo "Response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [[ -n "$TOKEN" ]]; then
  echo -e "${GREEN}Login successful. Token: ${TOKEN:0:10}...${NC}"
else
  echo -e "${RED}Login failed${NC}"
  exit 1
fi

# 3. Get Current User
echo -e "\n${GREEN}3. Getting current user...${NC}"
USER_RESPONSE=$(curl -s -X GET "$API_URL/users/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $USER_RESPONSE"

if [[ $USER_RESPONSE == *"flowtest${TIMESTAMP}@example.com"* ]]; then
  echo -e "${GREEN}Get user successful${NC}"
else
  echo -e "${RED}Get user failed${NC}"
  exit 1
fi

# 4. Create Project
echo -e "\n${GREEN}4. Creating project...${NC}"
PROJECT_RESPONSE=$(curl -s -X POST "$API_URL/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "A test project"}')

echo "Response: $PROJECT_RESPONSE"

PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [[ -n "$PROJECT_ID" ]]; then
  echo -e "${GREEN}Project created. ID: $PROJECT_ID${NC}"
else
  echo -e "${RED}Project creation failed${NC}"
  exit 1
fi

# 5. List Projects
echo -e "\n${GREEN}5. Listing projects...${NC}"
LIST_PROJECTS_RESPONSE=$(curl -s -X GET "$API_URL/projects" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $LIST_PROJECTS_RESPONSE"

if [[ $LIST_PROJECTS_RESPONSE == *"$PROJECT_ID"* ]]; then
  echo -e "${GREEN}List projects successful${NC}"
else
  echo -e "${RED}List projects failed${NC}"
  exit 1
fi

# 6. Create Task
echo -e "\n${GREEN}6. Creating task...${NC}"
TASK_RESPONSE=$(curl -s -X POST "$API_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Test Task\", \"description\": \"A test task\", \"priority\": \"high\", \"project_id\": \"$PROJECT_ID\"}")

echo "Response: $TASK_RESPONSE"

TASK_ID=$(echo $TASK_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [[ -n "$TASK_ID" ]]; then
  echo -e "${GREEN}Task created. ID: $TASK_ID${NC}"
else
  echo -e "${RED}Task creation failed${NC}"
  exit 1
fi

echo -e "\n${GREEN}Verification completed successfully!${NC}"
