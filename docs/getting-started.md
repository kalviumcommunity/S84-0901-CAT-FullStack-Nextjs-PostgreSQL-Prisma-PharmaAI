# Developer Setup & Getting Started Guide — PharmaResearch AI

Welcome to the developer documentation for **PharmaResearch AI**. This guide provides step-by-step instructions for configuring your local development environment.

---

## 1. Prerequisites

Ensure you have the following installed on your development machine:
- **Node.js**: Version 20.x or 22.x LTS
- **npm**: Version 10.x or higher
- **PostgreSQL**: Version 14+ (Local instance or hosted on Supabase / Neon)
- **Git**: Latest version

---

## 2. Environment Variables Configuration

Copy `.env.example` (or create `.env.local` inside `pharma-research-ai/`) and populate the necessary keys:

```bash
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/pharma_ai?schema=public"

# Authentication Secrets
JWT_SECRET="your-super-secret-jwt-signing-key-32-chars-min"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Groq / LLM API Key for Clinical Grounding
GROQ_API_KEY="gsk_your_groq_api_key"
```

---

## 3. Installation & Database Setup

Navigate to the application root and install dependencies:

```bash
# 1. Change directory to application
cd pharma-research-ai

# 2. Install dependencies cleanly
npm install

# 3. Synchronize database schema
npm run db:push

# 4. Generate Prisma client
npm run db:generate
```

---

## 4. Running the Application

```bash
# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to test the landing page, document upload, and chat workflows.

---

## 5. Code Quality & Linting

Run automated checks before pushing code:

```bash
# Run ESLint
npm run lint

# Verify production build
npm run build
```
