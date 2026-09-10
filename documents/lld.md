# Low-Level Design (LLD): PharmaResearch AI

## 1. System Architecture
- **Frontend**: Next.js (App Router), React, Tailwind CSS. Handles routing, UI state, and rendering.
- **Backend API**: Node.js, Express.js. Handles business logic, authentication, PDF processing, RAG pipeline, and database interactions.
- **Database**: PostgreSQL with `pgvector` extension.
- **ORM**: Prisma for type-safe database schema and queries.
- **LLM / Embeddings**: Gemini or Groq for generation. An appropriate embedding model (e.g., `text-embedding-004` or an open-source alternative like `all-MiniLM-L6-v2`) for generating vector representations.
- **Storage**: Local filesystem for MVP / Supabase Storage for production deployment.

## 2. Database Schema (Prisma)

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  documents     Document[]
  conversations Conversation[]
}

model Document {
  id             String          @id @default(uuid())
  userId         String
  fileName       String
  fileUrl        String          // Path or URL to the stored PDF
  status         DocumentStatus  @default(PENDING) // PENDING, PROCESSING, COMPLETED, FAILED
  uploadedAt     DateTime        @default(now())
  user           User            @relation(fields: [userId], references: [id])
  chunks         DocumentChunk[]
}

enum DocumentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model DocumentChunk {
  id         String   @id @default(uuid())
  documentId String
  pageNumber Int
  content    String
  embedding  Unsupported("vector(768)") // Dimensionality matches the chosen embedding model
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  sources    Source[]
}

model Conversation {
  id        String    @id @default(uuid())
  userId    String
  title     String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  user      User      @relation(fields: [userId], references: [id])
  messages  Message[]
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  role           Role         // USER or AI
  content        String
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sources        Source[]
}

enum Role {
  USER
  AI
}

model Source {
  id              String        @id @default(uuid())
  messageId       String
  documentChunkId String
  message         Message       @relation(fields: [messageId], references: [id], onDelete: Cascade)
  documentChunk   DocumentChunk @relation(fields: [documentChunkId], references: [id])
}
```

## 3. Backend API Design

### Authentication
- `POST /api/auth/register`: body `{ email, password }` -> returns `{ token, user }`
- `POST /api/auth/login`: body `{ email, password }` -> returns `{ token, user }`

### Documents
- `POST /api/documents/upload`: `multipart/form-data` with `file` (PDF) -> returns `{ document }`
- `GET /api/documents`: returns `[{ id, fileName, status, uploadedAt }]`
- `GET /api/documents/:id`: returns `{ id, fileName, status, url }`
- `DELETE /api/documents/:id`: returns `{ success: true }`

### Chat / Conversations
- `POST /api/chat`: body `{ conversationId (optional), message }` -> returns `{ message: AI_Response, sources: [ { documentName, pageNumber, content } ], conversationId }`
- `GET /api/conversations`: returns `[{ id, title, updatedAt }]`
- `GET /api/conversations/:id`: returns `{ id, title, messages: [...] }`

## 4. Component Design

### Frontend Pages
- `/login`: Form for login/registration.
- `/dashboard`: Main view. Lists recently uploaded documents and past conversations.
- `/documents`: Document management (upload dropzone, list of PDFs with status, delete option).
- `/chat`: Main RAG interface. Chat window on left/center, optionally a document viewer on the right.
- `/documents/:id`: Document viewer page (using `react-pdf` or a generic iframe to view PDFs).

### Frontend Components
- `Navbar`: Links to Dashboard, Documents, Chat. Logout button.
- `FileUpload`: Drag-and-drop zone for PDFs.
- `ChatInterface`:
  - `MessageList`: Renders user and AI messages in sequence.
  - `MessageBubble`: Displays text content. If AI, renders a `CitationBlock` below.
  - `ChatInput`: Textarea with submit button.
- `CitationBlock`: Displays document name and page number. Optionally, on click, opens the document viewer to that page.
- `DocumentList`: Table/Grid of uploaded documents displaying name, status, and upload date.

## 5. RAG Pipeline (Low Level Workflow)

### 5.1 Document Processing Workflow
1. User uploads a PDF via `POST /api/documents/upload`.
2. File is saved to local storage/Supabase.
3. A `Document` record is created with status `PENDING`.
4. Background Worker / Async Function starts processing:
   - Extract text page by page using a library like `pdf-parse` or `pdfjs-dist`.
   - Text is split into overlapping chunks (e.g., 1000 characters, 200 overlap) using a splitter (e.g., `langchain/text_splitter`), strictly preserving the `pageNumber` associated with the text.
   - Embeddings are generated for each chunk via the chosen embedding API.
   - Chunks and embeddings are inserted into the `DocumentChunk` table.
5. Document status is updated to `COMPLETED`.

### 5.2 Query Workflow
1. User sends a message via `POST /api/chat`.
2. Backend generates an embedding for the user's question.
3. Backend performs cosine similarity search using pgvector, filtering by `userId` to ensure data isolation:
   ```sql
   SELECT id, "documentId", "pageNumber", content, 1 - (embedding <=> $1) as similarity
   FROM "DocumentChunk"
   WHERE "documentId" IN (SELECT id FROM "Document" WHERE "userId" = $2)
   ORDER BY embedding <=> $1
   LIMIT 5;
   ```
4. Construct Prompt:
   ```text
   Context:
   [Document: A, Page: 5] Content...
   [Document: B, Page: 12] Content...

   User Question: {question}

   Please answer the user's question based on the context provided. If the context does not contain the answer, state that clearly. Cite the exact sources used.
   ```
5. LLM (Gemini/Groq) generates the answer.
6. Backend saves the `Message` (USER) and `Message` (AI) in the `Conversation` table.
7. Backend saves `Source` relations linking the AI message to the retrieved `DocumentChunk`s.
8. Returns the AI response text along with the source metadata to the frontend.

## 6. Directory Structure

### Backend
```text
backend/
├── src/
│   ├── config/       # Env variables, database connection setup
│   ├── controllers/  # API route handlers
│   ├── middlewares/  # Auth, Error handling, Multer setup
│   ├── routes/       # Express route definitions
│   ├── services/     # Core business logic (RAG, PDF processing, LLM calls)
│   ├── prisma/       # Schema definition and migrations
│   └── index.ts      # Application entry point
├── package.json
└── tsconfig.json
```

### Frontend
```text
frontend/
├── src/
│   ├── app/          # Next.js App Router (pages & layouts)
│   ├── components/   # Reusable UI components
│   ├── lib/          # API client, utilities
│   ├── hooks/        # Custom React hooks
│   ├── types/        # TypeScript interfaces
│   └── styles/       # Global CSS / Tailwind
├── package.json
└── tsconfig.json
```

## 7. Security & Validation
- **Passwords**: Hashed with `bcryptjs`.
- **Authentication**: JWT stored securely (e.g., in HttpOnly cookies or authorization headers) and validated via middleware on protected routes.
- **File Upload**: Multer configuration to accept only `application/pdf` and enforce max size limits (e.g., 10MB or 20MB).
- **RAG Data Isolation**: Vector searches MUST filter by `userId`. A user must not be able to query chunks from documents belonging to other users.
- **Environment Variables**: API keys, database URLs, and JWT secrets must be stored securely using `.env`.
