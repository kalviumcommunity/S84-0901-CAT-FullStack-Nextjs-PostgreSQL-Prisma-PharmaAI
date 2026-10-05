# Testing Strategy & Quality Assurance Guide — PharmaResearch AI

## 1. Quality Assurance Philosophy

PharmaResearch AI operates in a high-stakes clinical research domain where accuracy, verifiability, and reliability are paramount. Our testing pyramid spans unit validation, API contract verification, upload constraint testing, and end-to-end integration workflows.

---

## 2. Test Suites Overview

| Test Type | Focus Area | Tools & Frameworks |
|---|---|---|
| **Unit Tests** | Helper functions, JWT token creation, chunking algorithms | Node test runner, Jest/Vitest |
| **API Integration** | Route handlers (`/api/chat`, `/api/upload`, `/api/documents`) | Node scripts, Supertest |
| **File Validation** | 10MB PDF upload boundary checks, MIME-type guardrails | `test-report-upload.mjs` |
| **Cloudinary Integration** | Upload stream & secure URL generation | `test-cloudinary-api.mjs` |
| **Lint & Type Safety** | TypeScript compilation, ESLint Next.js rule adherence | `next lint`, `tsc --noEmit` |

---

## 3. Running Automated Tests

### 3.1 Upload & Boundary Tests
Verify the 10MB upload limit constraint:

```bash
cd pharma-research-ai
node test-report-upload.mjs
```

### 3.2 Cloudinary Connection Tests
Verify cloud storage credentials and upload pipeline:

```bash
cd pharma-research-ai
node test-cloudinary-api.mjs
```

### 3.3 Linting and Type Checking
Run statically in CI and pre-commit hooks:

```bash
cd pharma-research-ai
npm run lint
npx tsc --noEmit
```

---

## 4. CI/CD Automated Verification

Every pull request automatically triggers the GitHub Actions CI pipeline (`.github/workflows/ci.yml`), executing:
1. Clean dependency installation (`npm ci`).
2. Prisma client generation (`npm run db:generate`).
3. ESLint static analysis (`npm run lint`).
4. Next.js production build (`npm run build`).
