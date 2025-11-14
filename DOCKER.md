# Docker Setup Guide

This guide will help you run the entire application stack (frontend, backend, and database) using Docker.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) installed (version 2.0+)

## Quick Start

1. **Ensure you have your environment file configured**
   Make sure `backend/.env` exists with your credentials:
   ```bash
   # If you haven't created it yet, copy from example
   cp backend/.env.example backend/.env
   ```

2. **Update the environment variables**
   Edit `backend/.env` and add your actual credentials:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require"
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   CLOUDINARY_CLOUD_NAME="your-actual-cloud-name"
   CLOUDINARY_API_KEY="your-actual-api-key"
   CLOUDINARY_API_SECRET="your-actual-api-secret"
   ```
   Note: Docker will override the DATABASE_URL to use the local PostgreSQL container.

3. **Start all services**
   ```bash
   docker-compose up
   ```

   Or run in detached mode (background):
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5175
   - Backend API: http://localhost:3005
   - Database: localhost:5435

## Service Details

### Services Running

| Service  | Port | Description                    |
|----------|------|--------------------------------|
| Frontend | 5175 | Vue 3 + Vite development server|
| Backend  | 3005 | Express API with hot-reload    |
| Database | 5435 | PostgreSQL 16                  |

### Features

- **Hot Reload**: Both frontend and backend support hot-reloading during development
- **Persistent Data**: Database data persists in Docker volumes
- **Automatic Migrations**: Prisma migration files from `prisma/migrations` are applied automatically on backend startup using `prisma migrate deploy`
- **Health Checks**: Services have health checks to ensure they're running correctly

## Common Commands

### Start services
```bash
# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# Rebuild containers and start
docker-compose up --build
```

### Stop services
```bash
# Stop all services (keeps volumes)
docker-compose down

# Stop and remove volumes (fresh database)
docker-compose down -v
```

### View logs
```bash
# View all logs
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs (real-time)
docker-compose logs -f backend
```

### Execute commands in containers
```bash
# Access backend shell
docker-compose exec backend sh

# Run Prisma commands
docker-compose exec backend pnpm db:migrate
docker-compose exec backend pnpm db:studio

# Access database
docker-compose exec db psql -U postgres -d amptalk
```

### Restart services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

## Database Management

### Migration Strategy

Docker uses **`prisma migrate deploy`** to apply migration files from `backend/prisma/migrations`. This approach:
- ✅ Applies actual SQL migration files
- ✅ Respects migration history
- ✅ Safe for existing data
- ✅ Good for testing migrations before production

**Important:** Migrations run automatically on backend container startup.

### Schema Development Workflow

**When making schema changes:**

1. Edit `backend/prisma/schema.prisma`
2. Create a migration:
   ```bash
   docker-compose exec backend pnpm db:migrate
   ```
3. The backend will automatically restart and apply the new migration

**Alternative - Quick prototyping (use with caution):**

If you want to iterate quickly without creating migration files:
```bash
docker-compose exec backend pnpm db:push
```
⚠️ **Warning:** `db:push` can drop columns and lose data when schemas diverge. Only use during active development.

### Access Prisma Studio
```bash
docker-compose exec backend pnpm db:studio
```
Then visit http://localhost:5555

### Reset database
```bash
# Stop and remove volumes (destroys all data)
docker-compose down -v

# Start fresh
docker-compose up
```

### Connect to PostgreSQL directly
```bash
docker-compose exec db psql -U postgres -d amptalk
```

Connection details for external tools:
- Host: localhost
- Port: 5435
- User: postgres
- Password: postgres
- Database: amptalk

## Troubleshooting

### Port already in use
If you get an error about ports being in use, either:
1. Stop the service using the port
2. Change the port mapping in `docker-compose.yml`

### Backend won't start
Check the logs:
```bash
docker-compose logs backend
```

Common issues:
- Database not ready: Wait for health check to pass
- Environment variables missing: Check `backend/.env` file
- Prisma client not generated: Rebuild container with `--build` flag
- Migration failures: Check logs for SQL errors, may need to reset database with `docker-compose down -v`

### Database connection issues
```bash
# Check if database is healthy
docker-compose ps

# Check database logs
docker-compose logs db

# Test database connection manually
docker-compose exec db psql -U postgres -d amptalk -c "SELECT 1;"

# Or check Prisma connection
docker-compose exec backend pnpm prisma db execute --stdin <<< "SELECT 1;"
```

### Frontend not loading
Check if backend is running:
```bash
curl http://localhost:3005/health
```

Check frontend logs:
```bash
docker-compose logs frontend
```

### Clear everything and start fresh
```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild and start
docker-compose up --build
```

## Development Workflow

1. **Make code changes**: Edit files in `backend/` or `frontend/` directories
2. **Changes auto-reload**: Services will automatically reload with your changes
3. **View logs**: Use `docker-compose logs -f` to monitor
4. **Database schema changes**:
   - Edit `backend/prisma/schema.prisma`
   - Create migration: `docker-compose exec backend pnpm db:migrate`
   - Backend auto-restarts and applies the new migration via `prisma migrate deploy`

## Production Build

To build for production:

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Run production stack
docker-compose -f docker-compose.prod.yml up
```

Note: You'll need to create a `docker-compose.prod.yml` file for production deployment.

## Environment Variables

The following environment variables should be configured in `backend/.env`:

| Variable | Description | Default | Docker Override |
|----------|-------------|---------|-----------------|
| DATABASE_URL | Database connection string | (from .env) | Overridden to use local db container |
| POSTGRES_USER | Database user | postgres | - |
| POSTGRES_PASSWORD | Database password | postgres | - |
| POSTGRES_DB | Database name | amptalk | - |
| PORT | Backend server port | 3000 | Overridden to 3005 |
| NODE_ENV | Environment mode | development | - |
| JWT_SECRET | JWT signing secret | (required) | - |
| JWT_EXPIRES_IN | JWT expiration time | 7d | - |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | (required) | - |
| CLOUDINARY_API_KEY | Cloudinary API key | (required) | - |
| CLOUDINARY_API_SECRET | Cloudinary API secret | (required) | - |
| FRONTEND_URL | Frontend URL for CORS | (from .env) | Overridden to http://localhost:5175 |

## Notes

- The database data is stored in a Docker volume named `postgres_data`
- Node modules are mounted as anonymous volumes for better performance
- Source code is mounted as volumes for hot-reloading
- Health checks ensure services start in the correct order
