# Quick Start Guide - AI Task Tracker

## ✅ Setup Complete!

Everything is configured and ready to go on your new laptop.

## Current Status

- ✅ PostgreSQL Docker container running
- ✅ Backend server running on http://localhost:8080
- ✅ Database migrations applied
- ✅ API endpoints tested and working
- ✅ Environment files configured

## Start Development (3 Commands)

### 1. Start Database (if not running)
```bash
./setup-docker.sh
```

### 2. Start Backend
```bash
cargo run
```
Server will start at: http://localhost:8080

### 3. Start Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```
Frontend will start at: http://localhost:3000

## Test It Works

### Test Backend API
```bash
# Register a user
curl http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123","full_name":"Demo User"}'

# Login
curl http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'
```

### Test Frontend
1. Open http://localhost:3000
2. Click "Register" or "Login"
3. Create an account or login
4. Explore the dashboard

## What's Next?

Based on `docs/REMAINING_WORK.md`, the priority tasks are:

### High Priority
1. **Task Editing** - Add edit functionality for tasks
   - File: `frontend/app/(dashboard)/tasks/[id]/page.tsx`
   - Add edit mode for title, description, priority, assignee, due date

2. **Task Deletion** - Add delete button with confirmation
   - Same file as above
   - Add confirmation dialog before deletion

3. **Team Member Management**
   - File: `frontend/app/(dashboard)/teams/page.tsx`
   - Add/remove team members functionality

4. **Project CRUD** - Complete project editing and deletion
   - File: `frontend/app/(dashboard)/projects/page.tsx`

### Medium Priority
5. Toast notifications for better UX
6. Testing setup

### Low Priority
7. Drag-and-drop on Kanban board
8. UI/UX improvements

## Useful Commands

### Database
```bash
# View database logs
docker logs ai_task_tracker_db

# Connect to database
docker exec -it ai_task_tracker_db psql -U postgres -d ai_task_tracker

# Stop database
docker stop ai_task_tracker_db

# Start database
docker start ai_task_tracker_db
```

### Backend
```bash
# Run server
cargo run

# Check for errors
cargo check

# Run tests
cargo test

# Build for production
cargo build --release
```

### Frontend
```bash
cd frontend

# Install dependencies (first time)
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Files to Reference

- `NEW_LAPTOP_SETUP.md` - Complete setup summary
- `DOCKER_SETUP.md` - Docker commands and troubleshooting
- `README.md` - Project documentation
- `docs/REMAINING_WORK.md` - What's left to build
- `docs/PROGRESS.md` - What's been completed

## API Quick Reference

All endpoints except `/api/auth/*` require JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

### Public Endpoints
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Protected Endpoints
- `GET /api/users/me` - Current user
- `POST /api/teams` - Create team
- `GET /api/teams` - List teams
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

Full API docs in `README.md`

---

**Happy coding! 🚀**
