# Submission - Image Management Application

## Project Overview

This is a full-stack image management application built for the Amptalk Software Engineer coding assignment. The application provides a complete solution for users to upload, view, and manage images with secure authentication.

**Assignment Status:** ✅ All core requirements + bonus features completed

About the GitHub Actions workflow, deployment plateform already automatically deploy on push, I only made a Actions that automated mirroring. 

## Live Deployment

**Live Application URL:** [https://amptalk-test.pages.dev](https://amptalk-test.pages.dev)

**Infrastructure:**
- **Frontend:** Cloudflare Pages
- **Backend:** Render
- **Database:** Neon Serverless PostgreSQL
- **Image Storage:** Cloudinary

> **Note:** The frontend was initially deployed on Vercel but migrated to Cloudflare due to stability improvements and better performance.

## Quick Access - Try the Application

### Option 1: Use Demo Account (Instant Access)

You can immediately test the application using these pre-configured credentials:

```
Email: mario@mushroom.com
Password: Ilovepeach64!
```

The demo account already has sample images uploaded, so you can:
- View the image gallery
- Upload new images (single or multiple)
- Delete images
- Test all features without registration

> **Note:** This is a shared demo account for review purposes. 

### Option 2: Create Your Own Account

To test the complete user flow including registration:

1. Visit [https://amptalk-test.pages.dev](https://amptalk-test.pages.dev)
2. Click "Register"
3. Enter your email and a secure password (min 8 characters)
4. Start uploading your own images

This option lets you test the registration process, password validation, and have a clean slate for testing upload/delete functionality.

## Technology Stack

### Frontend
- **Framework:** Vue 3 with Composition API
- **Build Tool:** Vite 
- **State Management:** Pinia 
- **Routing:** Vue Router 
- **Styling:** Tailwind CSS 
- **HTTP Client:** Axios
- **Language:** TypeScript

### Backend
- **Runtime:** Node.js 
- **Framework:** Express 
- **Database ORM:** Prisma 
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer
- **Password Hashing:** bcryptjs
- **Security:** express-rate-limit, CORS, cookie-parser

### Cloud Services
- **Image Storage:** Cloudinary
- **Database:** Neon PostgreSQL
- **Backend Hosting:** Render
- **Frontend Hosting:** Cloudflare Pages

### DevOps
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions (auto-mirror to Amptalk repo)
- **Package Manager:** pnpm

## Features Implemented

### ✅ Core Requirements

1. **Image Upload**
   - Users can upload images from their local device
   - Files are stored in Cloudinary cloud storage
   - Validation for file type and size (max 5MB)

2. **View Images**
   - Gallery view displaying all user's images
   - Shows filename, upload date, and thumbnail
   - Click to preview full-size image in modal

3. **Delete Images**
   - Users can delete their own images individually
   - Removes from both database and cloud storage at the same time
   - Confirmation modal prevents accidental deletion

4. **Public URLs**
   - Each image has a publicly accessible URL
   - URLs are provided by Cloudinary CDN
   - Optimized for fast loading

### ✅ Bonus Feature

5. **User Authentication**
   - Complete user registration and login system
   - JWT-based authentication with HTTP-only cookies
   - Secure password hashing with bcryptjs
   - Protected routes requiring authentication
   - Session management with automatic token refresh

### ✨ Additional Features

6. **Multi-Image Upload**
   - Upload multiple images simultaneously (10 files max)
   - Concurrent processing (3 files at a time)
   - Individual progress tracking per file
   - Per-file error handling

7. **Advanced UI/UX**
   - Drag-and-drop upload zone
   - Delete confirmation modal
   - Password strength indicator
   - Real-time form validation
   - Loading states and error messages
   - Responsive design (mobile-friendly)

8. **Security Features**
   - Rate limiting on authentication endpoints (5 requests per 15 minutes)
   - File type validation (images only)
   - File size limits (5MB max)
   - CORS protection
   - Secure cookie settings (httpOnly, sameSite)
   - SQL injection protection via Prisma ORM

9. **Developer Experience**
   - Complete Docker setup for local development
   - Comprehensive documentation (README.md, DOCKER.md)
   - TypeScript for type safety
   - Test coverage for critical components (Authentication)
   - Hot reload in development

## Running the Application Locally

### Why Run Locally?

While the live application is available at [https://amptalk-test.pages.dev](https://amptalk-test.pages.dev), you may want to run it locally to:

- Inspect the codebase and implementation details
- Test modifications or add new features
- Review the development workflow and architecture
- Verify the Docker setup and containerization
- Run tests and examine test coverage

### Prerequisites

Before running locally, ensure you have:

- **Node.js 22.x or higher** - [Download](https://nodejs.org/)
- **pnpm** (recommended) or npm - Install: `npm install -g pnpm`
- **Docker & Docker Compose** (for quick start) - [Download](https://www.docker.com/)
- **PostgreSQL** (if not using Docker) - [Download](https://www.postgresql.org/)
- **Cloudinary account** (for image storage) - [Sign up](https://cloudinary.com/)

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-secure-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=3005
```

**Frontend (.env):**
```env
VITE_API_BASE_URL="http://localhost:3005/api"
```

### Quick Start with Docker (Recommended)

**This is the easiest way to run the application locally** - Docker handles all dependencies, database setup, and service orchestration automatically.

```bash
# 1. Clone the repository
git clone
cd Kevin-Timsiline

# 2. Start all services (frontend, backend, database)
docker-compose up

# 3. Wait for services to start 
# Then access the application:
```

**Service URLs:**
- **Frontend:** http://localhost:5175
- **Backend API:** http://localhost:3005
- **PostgreSQL Database:** localhost:5435

**What Docker Compose does:**
- Spins up PostgreSQL database with automatic schema migrations
- Starts the backend API server with hot reload
- Starts the frontend dev server with hot reload
- Connects all services automatically
- No manual environment variable setup needed

See [DOCKER.md](./DOCKER.md) for comprehensive Docker documentation, including how to rebuild, stop services, and troubleshoot.

### Manual Setup (Alternative)

If you prefer to run services individually without Docker:

**1. Setup Backend:**
```bash
cd backend

# Install dependencies
pnpm install

# Create .env file with your database credentials
# (see Environment Variables section above)

# Run database migrations
pnpm prisma migrate dev

# Start backend server
pnpm dev
# Backend will run on http://localhost:3005
```

**2. Setup Frontend:**
```bash
cd frontend

# Install dependencies
pnpm install

# Create .env file with backend URL
# VITE_API_BASE_URL=http://localhost:3005/api

# Start frontend dev server
pnpm dev
# Frontend will run on http://localhost:5173
```

## API Documentation

### Authentication Endpoints

**Base URL:** `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create new user account | No |
| POST | `/login` | Authenticate user | No |
| POST | `/logout` | Clear authentication | Yes |
| GET | `/me` | Get current user info | Yes |

### Image Endpoints

**Base URL:** `/api/images`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload` | Upload single image | Yes |
| GET | `/` | Get all user's images | Yes |
| GET | `/:id` | Get single image details | Yes |
| DELETE | `/:id` | Delete image | Yes |


## Architecture & Implementation

### Database Schema

**User Model:**
- `id` (UUID, primary key)
- `email` (String, unique)
- `password` (String, hashed)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- Relation: One-to-many with Images

**Image Model:**
- `id` (UUID, primary key)
- `userId` (UUID, foreign key)
- `filename` (String)
- `publicUrl` (String, Cloudinary URL)
- `cloudinaryId` (String, for deletion)
- `uploadedAt` (DateTime)
- `fileSize` (Int, bytes)
- `mimeType` (String)
- Relation: Many-to-one with User (cascade delete)

### File Upload Flow

1. User selects image(s) in frontend
2. Frontend sends file to backend via multipart/form-data
3. Multer middleware validates and temporarily stores file
4. Backend uploads to Cloudinary
5. Cloudinary returns public URL and asset ID
6. Backend stores metadata in PostgreSQL via Prisma
7. Frontend receives image data and updates UI

### Authentication Flow

1. User registers/logs in via frontend form
2. Backend validates credentials
3. JWT token generated and sent as HTTP-only cookie
4. Frontend stores user data in Pinia store
5. Subsequent requests include cookie automatically
6. Backend middleware verifies JWT on protected routes
7. User data attached to request object

### Security Measures

- **Password Security:** bcrypt hashing with salt rounds
- **JWT Tokens:** Signed with secret, stored in HTTP-only cookies
- **Rate Limiting:** 5 login attempts per 15 minutes per IP
- **Input Validation:** File type, size, and format checks
- **SQL Injection:** Prevented by Prisma's parameterized queries
- **CORS:** Configured for specific frontend origin
- **Cookie Security:** sameSite=strict, httpOnly=true

## Testing

### Run Tests

**Backend:**
```bash
cd backend
pnpm test              # Run all tests
pnpm test:coverage     # Run with coverage report
```

**Frontend:**
```bash
cd frontend
pnpm test:unit              # Run unit tests
pnpm test:e2e          # Run E2E tests (Playwright)
```

### Test Coverage

**Backend:**
- Authentication middleware (JWT verification)
- Upload middleware (file validation)
- Rate limiter configuration
- JWT utility functions
- Password hashing utilities

**Frontend:**
- App component initialization
- Authentication store (login/logout/register)
- Password strength component

## Deployment

### CI/CD Pipeline

**GitHub Actions Workflow:**
- Automatically mirrors code to Amptalk's review repository
- Triggers on push to `main` branch
- Target repo: `amptalk-coding-assignments/Kevin-Timsiline`

### Production Deployment

**Frontend (Cloudflare Pages):**
- Build Command: `cd frontend && pnpm install && pnpm build`
- Output Directory: `frontend/dist`
- Environment: `VITE_API_BASE_URL` set to production backend URL
- Auto-deploys on git push

**Backend (Render):**
- Build Command: `cd backend && pnpm install && pnpm prisma generate`
- Start Command: `cd backend && pnpm start`
- Auto-deploys on git push
- Environment variables configured in Render dashboard

**Database (Neon):**
- Serverless PostgreSQL
- Automatic connection pooling
- Always-available free tier

### Why Cloudflare Over Vercel?

The frontend was initially deployed on Vercel but was migrated to Cloudflare Pages due to:
- Improved stability and uptime
- Better cold-start performance
- More predictable behavior for SPA routing
- Enhanced DDoS protection

## Project Structure

```
Kevin-Timsiline/
├── frontend/               # Vue 3 SPA
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── views/         # Page components
│   │   ├── stores/        # Pinia state management
│   │   ├── router/        # Vue Router config
│   │   ├── api/           # API client
│   │   └── types/         # TypeScript definitions
│   ├── Dockerfile         # Multi-stage build
│   └── package.json
│
├── backend/               # Express REST API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, upload, rate limiting
│   │   ├── config/        # Cloudinary config
│   │   └── utils/         # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma  # Database models
│   │   └── migrations/    # Migration history
│   ├── tests/             # Unit tests
│   ├── Dockerfile         # Multi-stage build
│   └── package.json
│
├── .github/workflows/     # CI/CD
├── docker-compose.yml     # Local development
├── DOCKER.md              # Docker documentation
├── README.md              # Assignment instructions
└── submission.md          # This file
```

## Known Limitations & Future Improvements

### Current Limitations
- No image editing capabilities (crop, resize, filters)
- No image organization (folders, tags, categories)
- No image sharing between users
- No bulk delete functionality

### Future Improvements
- Add image search and filtering
- Implement image collections/albums
- Add social features (sharing, comments)
- Implement image transformation on upload
- Add admin dashboard for user management
- Implement OAuth (Google, GitHub login)

## Conclusion

This project demonstrates a production-ready full-stack application with:
- Complete implementation of all required features
- Bonus authentication system with security best practices
- Modern technology stack with TypeScript throughout
- Comprehensive Docker setup for development
- Clean architecture and code organization
- CI/CD pipeline for automated deployment
- Responsive, user-friendly interface

The application is fully functional, deployed, and ready for use and review.

---

**Developed by:** Kevin Timsiline
**Assignment:** Amptalk Software Engineer Coding Challenge
**Repository:** [Kevin-Timsiline](https://github.com/mylordkaz/Kevin-Timsiline)
