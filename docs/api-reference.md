# REST API Reference — PharmaResearch AI

This document provides complete specification for all REST API endpoints available in PharmaResearch AI.

## Base URL
All API routes are served under `/api` relative to the application origin:
`http://localhost:3000/api` (Development) or `https://pharma-research-ai.vercel.app/api` (Production).

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method**: `POST`
- **Route**: `/api/auth/register`
- **Description**: Creates a new researcher account and returns an auth session.
- **Request Body**:
```json
{
  "name": "Dr. Jane Doe",
  "email": "jane.doe@pharmaresearch.org",
  "password": "SecurePassword123!"
}
```
- **Response (201 Created)**:
```json
{
  "user": {
    "id": "usr_1010",
    "name": "Dr. Jane Doe",
    "email": "jane.doe@pharmaresearch.org",
    "createdAt": "2026-10-05T10:00:00Z"
  }
}
```

### 1.2 Login User
- **Method**: `POST`
- **Route**: `/api/auth/login`
- **Description**: Authenticates user credentials and sets an HTTP-only session cookie.
- **Request Body**:
```json
{
  "email": "jane.doe@pharmaresearch.org",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "usr_1010",
    "name": "Dr. Jane Doe",
    "email": "jane.doe@pharmaresearch.org"
  }
}
```

---

## 2. Document Endpoints

### 2.1 Upload Clinical Document
- **Method**: `POST`
- **Route**: `/api/upload`
- **Content-Type**: `multipart/form-data`
- **Constraints**: Maximum file size 10MB; PDF format required.
- **Form Data**:
  - `file`: PDF binary stream
  - `title`: Document title (string)
  - `type`: Category (`CSR`, `DRUG_LABEL`, `SAFETY_BULLETIN`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "document": {
    "id": "doc_8899",
    "title": "Oncology-Phase-3-CSR.pdf",
    "url": "https://res.cloudinary.com/...",
    "size": 3450120,
    "status": "READY",
    "uploadedAt": "2026-10-05T12:00:00Z"
  }
}
```

### 2.2 List Documents
- **Method**: `GET`
- **Route**: `/api/documents`
- **Query Parameters**:
  - `limit` (optional, default: 20): Number of items per page.
  - `offset` (optional, default: 0): Pagination offset.
- **Response (200 OK)**:
```json
{
  "documents": [
    {
      "id": "doc_8899",
      "title": "Oncology-Phase-3-CSR.pdf",
      "size": 3450120,
      "pageCount": 48,
      "status": "READY",
      "createdAt": "2026-10-05T12:00:00Z"
    }
  ],
  "total": 1
}
```

---

## 3. Research Chat & Conversation Endpoints

### 3.1 Send Clinical Research Query
- **Method**: `POST`
- **Route**: `/api/chat`
- **Request Body**:
```json
{
  "conversationId": "conv_4455",
  "documentId": "doc_8899",
  "query": "What were the reported primary adverse events?"
}
```
- **Response (200 OK)**:
```json
{
  "messageId": "msg_9090",
  "role": "assistant",
  "content": "The most frequent adverse events observed were fatigue (32%) and nausea (28%).",
  "citations": [
    {
      "documentTitle": "Oncology-Phase-3-CSR.pdf",
      "pageNumber": 14,
      "snippet": "Fatigue was reported in 32% of subjects, followed by nausea in 28%..."
    }
  ]
}
```

### 3.2 List Conversations
- **Method**: `GET`
- **Route**: `/api/conversations`
- **Response (200 OK)**:
```json
{
  "conversations": [
    {
      "id": "conv_4455",
      "title": "Oncology Phase 3 Adverse Events Review",
      "updatedAt": "2026-10-05T12:30:00Z"
    }
  ]
}
```
