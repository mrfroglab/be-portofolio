# Portfolio Backend API

Backend API for portfolio website built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js 22 (TypeScript)
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **Auth**: JWT with bcryptjs
- **File Upload**: Multer
- **Deployment**: Docker Compose (Pop!_OS Server)

## Features

- **Authentication**: JWT-based auth with register/login
- **Projects CRUD**: Manage portfolio projects
- **Blog CRUD**: Blog posts management
- **Testimonials CRUD**: Client testimonials
- **File Upload**: Image uploads with Multer
- **CV/Resume**: PDF file management

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/projects` | List visible projects, featured first, then by `order` |
| GET | `/api/projects/:slug` | One visible project by slug (404 if missing or hidden) |
| GET | `/api/projects/admin-list` | All projects, including hidden (auth) |
| POST | `/api/projects` | Create project (auth) |
| PUT | `/api/projects/reorder` | Set `order` from `{ orderedIds: number[] }` (auth) |
| PUT | `/api/projects/:id` | Update project, partial body (auth) |
| DELETE | `/api/projects/:id` | Delete project (auth) |
| GET | `/api/blog` | List all blog posts |
| POST | `/api/blog` | Create blog post (auth) |
| PUT | `/api/blog/:id` | Update blog post (auth) |
| DELETE | `/api/blog/:id` | Delete blog post (auth) |
| GET | `/api/testimonials` | List testimonials |
| POST | `/api/testimonials` | Create testimonial (auth) |
| PUT | `/api/testimonials/:id` | Update testimonial (auth) |
| DELETE | `/api/testimonials/:id` | Delete testimonial (auth) |
| POST | `/api/upload` | Upload image (auth) |
| GET | `/api/cv` | Get CV info |
| PUT | `/api/cv` | Update CV (auth) |

### Project fields

| Field | Type | Notes |
|-------|------|-------|
| `title`, `description` | string | Required on create |
| `slug` | string \| null | Unique. Generated from `title` on create when omitted (`-2`, `-3` on collision). A taken slug returns 409 |
| `category` | `"web"` \| `"desktop"` \| `"tool"` | Default `"web"` |
| `status` | `"live"` \| `"open-source"` \| `"internal"` | Default `"live"` |
| `year` | string \| null | e.g. `"2026"`, `"2022 - 2024"` |
| `role` | string \| null | e.g. `"Solo developer"` |
| `highlights` | string[] | Short feature bullets, default `[]` |
| `imageUrl`, `liveUrl`, `githubUrl`, `releaseUrl` | string \| null | `releaseUrl` is the download page for desktop apps |
| `tags` | string[] | |
| `featured` | boolean | Default `false`; featured projects sort first in the public list |
| `order` | number | Default `0` |
| `visible` | boolean | Default `true` |

On create and update, `""` for any nullable string field is stored as `null`. Invalid `category`, `status`, `highlights` or `featured` values return 400.

## Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Setup database
npx prisma generate
npx prisma migrate dev
npm run prisma:seed

# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-secret-key"
PORT=3001
```

## Deployment (Docker Compose)

The project includes a `Dockerfile` for deployment via Docker Compose.

```bash
docker compose up -d --build
```

## Database Schema

Defined in `prisma/schema.prisma`:
- **User**: Authentication
- **Project**: Portfolio projects
- **Blog**: Blog posts
- **Testimonial**: Client testimonials
- **CV**: Resume/CV data