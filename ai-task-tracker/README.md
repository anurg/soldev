# AI Task Tracker

An AI-driven task tracking application with email parsing capabilities, built with Rust (Actix-web) backend and Next.js frontend.

## Features

- **User & Team Management**: Hierarchical team structure with role-based access
- **Project Management**: Organize tasks into projects
- **Task Tracking**: Full CRUD operations with status, priority, and progress tracking
- **Subtasks**: Break down tasks into smaller subtasks
- **AI Email Parser**: Parse emails to automatically suggest tasks (coming soon)
- **Dashboard**: Metrics and alerts for task management

## Tech Stack

### Backend
- **Framework**: Actix-web (Rust)
- **Database**: PostgreSQL with sqlx
- **Authentication**: JWT-based
- **Password Hashing**: bcrypt

### Frontend
- **Framework**: Next.js 14+ with TypeScript
- **UI**: Shadcn UI + Tailwind CSS
- **State Management**: React Context/Zustand

## Getting Started

### Prerequisites

- Rust 1.70+ ([Install Rust](https://rustup.rs/))
- PostgreSQL 14+ ([Install PostgreSQL](https://www.postgresql.org/download/))
- Node.js 18+ ([Install Node.js](https://nodejs.org/))
- npm or yarn

### Backend Setup

1. **Clone the repository** (if not already done)

2. **Set up PostgreSQL database**:
   ```bash
   # Create database
   createdb ai_task_tracker
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE ai_task_tracker;
   \q
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the following:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - Other configuration as needed

4. **Run database migrations**:
   ```bash
   # Migrations will run automatically when you start the server
   # Or you can run them manually with:
   cargo install sqlx-cli --no-default-features --features postgres
   sqlx migrate run
   ```

5. **Build and run the backend**:
   ```bash
   cargo build --release
   cargo run
   ```
   
   The API server will start at `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `NEXT_PUBLIC_API_URL` to point to your backend (default: `http://localhost:8080`)

4. **Run development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   
   The frontend will start at `http://localhost:3000`

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Protected Endpoints

All protected endpoints require the `Authorization` header:
```http
Authorization: Bearer <your-jwt-token>
```

#### Users
- `GET /api/users/me` - Get current user profile

#### Teams
- `POST /api/teams` - Create team
- `GET /api/teams` - List all teams
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add team member
- `DELETE /api/teams/:id/members/:user_id` - Remove team member

#### Projects
- `POST /api/projects` - Create project
- `GET /api/projects?team_id=<uuid>` - List projects (optionally filtered by team)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks?project_id=<uuid>&assignee_id=<uuid>&status=<status>` - List tasks with filters
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/progress` - Update task progress
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/subtasks` - Create subtask
- `GET /api/tasks/:id/subtasks` - List subtasks

#### Subtasks
- `PUT /api/subtasks/:id` - Update subtask
- `DELETE /api/subtasks/:id` - Delete subtask

## Development

### Running Tests
```bash
cargo test
```

### Database Migrations

Create a new migration:
```bash
sqlx migrate add <migration_name>
```

Run migrations:
```bash
sqlx migrate run
```

Revert last migration:
```bash
sqlx migrate revert
```

## Project Structure

```
ai-task-tracker/
├── src/
│   ├── config.rs          # Configuration management
│   ├── db/                # Database layer
│   │   ├── mod.rs
│   │   ├── user_repo.rs
│   │   ├── team_repo.rs
│   │   ├── project_repo.rs
│   │   ├── task_repo.rs
│   │   └── subtask_repo.rs
│   ├── middleware/        # Middleware (auth, etc.)
│   ├── models/            # Data models
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic
│   ├── utils/             # Utilities (JWT, password, etc.)
│   └── main.rs            # Application entry point
├── migrations/            # Database migrations
├── frontend/              # Next.js frontend
├── docs/                  # Documentation
├── Cargo.toml
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License
