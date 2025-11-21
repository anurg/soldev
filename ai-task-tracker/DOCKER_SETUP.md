# Docker Setup for AI Task Tracker

This document explains how to set up and manage the PostgreSQL database using Docker.

## Quick Start

### Automated Setup (Recommended)

Run the setup script:
```bash
./setup-docker.sh
```

This script will:
- Check if Docker is running
- Create or start the PostgreSQL container
- Verify the database connection
- Display connection information

### Manual Setup

If you prefer to run Docker commands manually:

```bash
# Start the PostgreSQL container
docker run -d \
  --name ai_task_tracker_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ai_task_tracker \
  -p 5432:5432 \
  -v ai_task_tracker_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Verify it's running
docker ps | grep ai_task_tracker_db

# Check database is ready
docker exec ai_task_tracker_db pg_isready -U postgres
```

### Using Docker Compose (Alternative)

If you have `docker-compose` installed:

```bash
docker-compose up -d
```

## Database Connection

The database is accessible at:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `ai_task_tracker`
- **Username**: `postgres`
- **Password**: `password`

Connection string (already configured in `.env`):
```
postgresql://postgres:password@localhost:5432/ai_task_tracker
```

## Common Commands

### Container Management

```bash
# Start the container
docker start ai_task_tracker_db

# Stop the container
docker stop ai_task_tracker_db

# Restart the container
docker restart ai_task_tracker_db

# View container logs
docker logs ai_task_tracker_db

# Follow logs in real-time
docker logs -f ai_task_tracker_db

# Remove the container (data persists in volume)
docker rm ai_task_tracker_db

# Remove container AND data volume (⚠️ deletes all data)
docker rm ai_task_tracker_db
docker volume rm ai_task_tracker_data
```

### Database Operations

```bash
# Connect to PostgreSQL CLI
docker exec -it ai_task_tracker_db psql -U postgres -d ai_task_tracker

# Run a SQL query
docker exec ai_task_tracker_db psql -U postgres -d ai_task_tracker -c "SELECT * FROM users;"

# Create a database backup
docker exec ai_task_tracker_db pg_dump -U postgres ai_task_tracker > backup.sql

# Restore from backup
docker exec -i ai_task_tracker_db psql -U postgres -d ai_task_tracker < backup.sql
```

## Data Persistence

Data is stored in a Docker volume named `ai_task_tracker_data`. This means:
- ✅ Data persists even if you stop or remove the container
- ✅ You can safely restart your computer
- ⚠️ Data is only deleted if you explicitly remove the volume

To view volumes:
```bash
docker volume ls | grep ai_task_tracker
```

## Troubleshooting

### Port Already in Use

If port 5432 is already in use:

1. Check what's using the port:
   ```bash
   sudo lsof -i :5432
   # or
   sudo netstat -tulpn | grep 5432
   ```

2. Either stop the conflicting service or change the port mapping:
   ```bash
   docker run -d ... -p 5433:5432 ... postgres:15-alpine
   ```
   Then update `DATABASE_URL` in `.env` to use port 5433.

### Container Won't Start

Check the logs:
```bash
docker logs ai_task_tracker_db
```

Common issues:
- Docker Desktop not running
- Insufficient disk space
- Port conflict

### Database Connection Refused

1. Verify container is running:
   ```bash
   docker ps | grep ai_task_tracker_db
   ```

2. Check if PostgreSQL is ready:
   ```bash
   docker exec ai_task_tracker_db pg_isready -U postgres
   ```

3. Verify the connection string in `.env` matches the container configuration

### Reset Everything

To start fresh:
```bash
# Stop and remove container
docker stop ai_task_tracker_db
docker rm ai_task_tracker_db

# Remove data volume (⚠️ deletes all data)
docker volume rm ai_task_tracker_data

# Run setup script again
./setup-docker.sh
```

## Running the Application

Once the database is running:

### Backend
```bash
# The migrations will run automatically
cargo run
```

### Frontend
```bash
cd frontend
npm install  # First time only
npm run dev
```

## Production Considerations

For production deployment:

1. **Change the password**: Update `POSTGRES_PASSWORD` to a strong password
2. **Use environment variables**: Don't hardcode credentials
3. **Enable SSL**: Configure PostgreSQL to require SSL connections
4. **Regular backups**: Set up automated backups
5. **Resource limits**: Configure memory and CPU limits for the container

Example with resource limits:
```bash
docker run -d \
  --name ai_task_tracker_db \
  --memory="1g" \
  --cpus="1.0" \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your-secure-password \
  -e POSTGRES_DB=ai_task_tracker \
  -p 5432:5432 \
  -v ai_task_tracker_data:/var/lib/postgresql/data \
  postgres:15-alpine
```
