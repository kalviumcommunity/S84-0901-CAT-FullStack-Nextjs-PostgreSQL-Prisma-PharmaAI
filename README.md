# PharmaResearch AI

PharmaResearch AI is a research workspace for pharmaceutical teams. It is designed to solve a specific problem: a company stores clinical trial reports, drug labels, and safety bulletins, but researchers repeat work because there is no workflow for asking a question and receiving an answer grounded in the exact study or document passage.

## Product goal

A researcher should be able to:

1. Store and manage source documents in one library.
2. Ask a question in a research chat.
3. Receive a concise answer tied to the exact source document and page.
4. Open the evidence and verify the answer before sharing it.

The product is evidence-first: an answer is useful only when the researcher can trace it back to the source material.

## Technology used

This project uses the technologies already selected for the application:

- Next.js 16.3.4 with the App Router
- React 19.2.8 and React DOM 19.2.8
- TypeScript 5
- Tailwind CSS 4 through `@tailwindcss/postcss`
- PostgreSQL for persistence
- Prisma ORM and Prisma schema
- Next.js route handlers for backend API endpoints
- ESLint 9 with the Next.js configuration

No additional UI framework or component library was added.

## Current repository structure

The application lives in `pharma-research-ai/`.

- `app/` contains the App Router pages and API route handlers.
- `app/login/` contains the login screen.
- `app/documents/` contains the document library and document detail routes.
- `app/chat/` contains the research chat route.
- `app/dashboard/` contains the dashboard route.
- `app/api/auth/` contains login and registration endpoints.
- `app/api/chat/` contains the chat endpoint.
- `app/api/conversations/` contains conversation list and detail endpoints.
- `app/api/documents/` contains document list, detail, and upload endpoints.
- `components/pharma-landing-page.tsx` contains the public homepage experience.
- `prisma/schema.prisma` contains the data model.
- `documents/` contains the product requirements and low-level design documents.

## What is already built

The repository already contains the application foundation and the main product route map:

- Next.js application setup with TypeScript, Tailwind CSS, and ESLint.
- Public homepage component and App Router entry point.
- Login page and authentication API route placeholders.
- Dashboard, document library, document detail, and research chat routes.
- API route structure for authentication, chat, conversations, documents, and uploads.
- Prisma schema and PostgreSQL-oriented persistence setup.
- Product requirements in `documents/prd.md` and technical design notes in `documents/lld.md`.

The dashboard and chat page files are currently minimal placeholders, so the end-to-end research workflow is not complete yet.

## Work completed today

- Rebuilt the public homepage around the core product promise: ask the study and get the source.
- Added a responsive evidence-led research preview showing a question, grounded answer, source document, and page reference.
- Added clear links to the existing `/chat`, `/documents`, and `/login` routes.
- Added document-type messaging for clinical trial reports, drug labels, and safety bulletins.
- Replaced broken text encoding artifacts in the homepage source.
- Updated page metadata from the default Create Next App values to the PharmaResearch AI product name and description.
- Replaced the placeholder root README with this product, technology, status, and work summary.

## Run locally

From `pharma-research-ai/`:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npm run build
```

## Next implementation priorities

1. Build the chat screen around the existing chat API and show cited source passages.
2. Build the document library and upload flow against the document API routes.
3. Connect authentication and protected routes.
4. Connect Prisma to PostgreSQL and add seed data for a representative clinical trial report.
5. Add tests for document upload, question answering, citation rendering, and access control.
