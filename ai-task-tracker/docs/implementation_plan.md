# AI Task Tracker - Implementation Plan

This document outlines the technical approach for building the AI Task Tracker application based on the design document.

## Overview

The AI Task Tracker is a comprehensive task management system with AI-powered email parsing capabilities. The system will be built using:
- **Backend**: Rust with Actix-web framework
- **Database**: PostgreSQL with sqlx
- **Frontend**: Next.js with TypeScript, Tailwind CSS + Shadcn UI components
- **AI Integration**: Email parsing service for automated task creation

## Technology Stack

- **Backend**: Actix-web (Rust web framework)
- **Database**: PostgreSQL with sqlx
- **Frontend**: Next.js + TypeScript (App Router)
- **UI Components**: Shadcn UI + Tailwind CSS
- **Authentication**: JWT-based
- **AI Integration**: To be determined (OpenAI/Claude)

## Proposed Changes

### Backend Foundation

#### [NEW] [Cargo.toml](file:///home/nkb/soldev/ai-task-tracker/Cargo.toml)
Create Rust project manifest with dependencies:
- `actix-web` - Web framework
- `actix-cors` - CORS middleware
- `tokio` - Async runtime
- `sqlx` - Database access with PostgreSQL
- `serde` - Serialization
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `uuid` - UUID generation
- `chrono` - Date/time handling
- `dotenv` - Environment configuration
- `env_logger` - Logging

#### [NEW] [.env.example](file:///home/nkb/soldev/ai-task-tracker/.env.example)
Environment configuration template with database URL, JWT secret, server port, and AI API keys.

---

### Database Layer

#### [NEW] [migrations/](file:///home/nkb/soldev/ai-task-tracker/migrations/)
SQL migration files for database schema:
- `001_create_users.sql` - Users table
- `002_create_teams.sql` - Teams table with hierarchy support
- `003_create_team_members.sql` - Team membership join table
- `004_create_projects.sql` - Projects table
- `005_create_tasks.sql` - Tasks table with progress tracking
- `006_create_subtasks.sql` - Subtasks table
- `007_create_email_logs.sql` - Email logs for AI processing

#### [NEW] [src/models/](file:///home/nkb/soldev/ai-task-tracker/src/models/)
Rust structs matching database schema:
- `user.rs` - User model with role enum
- `team.rs` - Team model with hierarchy
- `project.rs` - Project model
- `task.rs` - Task model with status/priority enums
- `subtask.rs` - Subtask model
- `email_log.rs` - Email log model

#### [NEW] [src/db/](file:///home/nkb/soldev/ai-task-tracker/src/db/)
Database connection and repository layer:
- `mod.rs` - Database pool setup
- `user_repo.rs` - User CRUD operations
- `team_repo.rs` - Team operations with hierarchy queries
- `project_repo.rs` - Project operations
- `task_repo.rs` - Task operations with filtering
- `email_repo.rs` - Email log operations

---

### API Layer

#### [NEW] [src/routes/](file:///home/nkb/soldev/ai-task-tracker/src/routes/)
API route handlers organized by domain:

**Authentication Routes** (`auth.rs`):
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT)
- `POST /api/auth/refresh` - Refresh JWT token

**User Routes** (`users.rs`):
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user
- `GET /api/users/:id` - Get user by ID (admin/manager)

**Team Routes** (`teams.rs`):
- `POST /api/teams` - Create team
- `GET /api/teams` - List teams
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add team member
- `DELETE /api/teams/:id/members/:user_id` - Remove member

**Project Routes** (`projects.rs`):
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects (filtered by team)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Task Routes** (`tasks.rs`):
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks (filtered by project/assignee/status)
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/progress` - Update progress percentage
- `POST /api/tasks/:id/subtasks` - Add subtask
- `PUT /api/subtasks/:id` - Update subtask
- `DELETE /api/subtasks/:id` - Delete subtask

**Dashboard Routes** (`dashboard.rs`):
- `GET /api/dashboard/metrics` - Get user metrics (tasks completed, overdue, etc.)
- `GET /api/dashboard/alerts` - Get alerts for overdue tasks

**Email Routes** (`emails.rs`):
- `POST /api/emails/ingest` - Manually ingest email
- `GET /api/emails/suggestions` - Get AI-suggested tasks
- `POST /api/emails/suggestions/:id/approve` - Approve suggested task

#### [NEW] [src/middleware/](file:///home/nkb/soldev/ai-task-tracker/src/middleware/)
Middleware components:
- `auth.rs` - JWT validation middleware
- `error.rs` - Error handling and response formatting
- `logging.rs` - Request/response logging

---

### AI Email Parser Service

#### [NEW] [src/services/](file:///home/nkb/soldev/ai-task-tracker/src/services/)
Business logic and external integrations:

**Email Parser** (`email_parser.rs`):
- Parse email content (sender, subject, body)
- Use AI to extract task information:
  - Task title
  - Description
  - Priority (inferred from urgency keywords)
  - Due date (if mentioned)
  - Suggested assignee (if mentioned)
- Store in suggestions queue

**AI Client** (`ai_client.rs`):
- Abstract AI provider interface
- Implement specific provider (OpenAI/Claude/etc.)
- Handle prompt engineering for task extraction
- Error handling and retry logic

---

### Frontend Application

#### [NEW] [frontend/](file:///home/nkb/soldev/ai-task-tracker/frontend/)
Next.js + TypeScript application with Shadcn UI and Tailwind CSS:

**Setup**:
- Next.js 14+ with App Router
- TypeScript for type safety
- Shadcn UI components
- Tailwind CSS for styling
- Axios for API calls
- Next.js middleware for auth protection

**Project Structure**:
```
frontend/
├── app/
│   ├── (auth)/           # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/      # Protected route group
│   │   ├── layout.tsx    # Dashboard layout with sidebar
│   │   ├── page.tsx      # Dashboard home
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── tasks/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── teams/
│   │   │   └── page.tsx
│   │   └── email-suggestions/
│   │       └── page.tsx
│   ├── api/              # API routes (optional proxy)
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/
│   ├── api.ts            # API client
│   ├── auth.ts           # Auth utilities
│   └── utils.ts          # General utilities
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
├── middleware.ts         # Auth middleware
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Design Features**:
- Shadcn UI components for consistent design
- Dark mode support with Tailwind
- Server-side rendering for better performance
- Smooth animations and transitions
- Responsive layout (mobile-first)
- Modern color palette
- Professional typography

---

### Configuration & Utilities

#### [NEW] [src/config.rs](file:///home/nkb/soldev/ai-task-tracker/src/config.rs)
Application configuration from environment variables.

#### [NEW] [src/utils/](file:///home/nkb/soldev/ai-task-tracker/src/utils/)
Utility functions:
- `jwt.rs` - JWT token generation and validation
- `password.rs` - Password hashing and verification
- `validation.rs` - Input validation helpers

#### [NEW] [src/main.rs](file:///home/nkb/soldev/ai-task-tracker/src/main.rs)
Application entry point:
- Initialize database pool
- Set up routes
- Configure middleware (CORS, logging, auth)
- Start server

---

## Verification Plan

### Automated Tests

```bash
# Run database migrations
sqlx migrate run

# Run backend tests
cargo test

# Start development server
cargo run
```

### Manual Verification

1. **Authentication Flow**:
   - Register new user via API
   - Login and receive JWT token
   - Access protected endpoints with token

2. **Team & Project Management**:
   - Create team hierarchy
   - Add team members
   - Create projects under teams
   - Verify permissions

3. **Task Management**:
   - Create tasks with various statuses
   - Add subtasks
   - Update progress percentage
   - Test filtering and search

4. **Dashboard**:
   - Verify metrics calculation
   - Check overdue alerts
   - Test date-based filtering

5. **AI Email Parser**:
   - Submit test emails
   - Verify AI extraction accuracy
   - Approve/reject suggestions
   - Confirm task creation

6. **Frontend UI**:
   - Test all pages in browser
   - Verify responsive design
   - Check animations and interactions
   - Test dark mode toggle
   - Verify cross-browser compatibility

### Browser Testing

Use browser automation to test:
- Login/logout flow
- Task creation workflow
- Project board interactions
- Email suggestion approval flow
