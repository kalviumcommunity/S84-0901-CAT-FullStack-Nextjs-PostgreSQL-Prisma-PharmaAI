# Security, Compliance & Data Privacy Policy — PharmaResearch AI

## 1. Security Overview

PharmaResearch AI is designed to handle proprietary pharmaceutical research data and clinical trial documentation with rigorous data isolation, encryption, and compliance standards.

---

## 2. Reporting Vulnerabilities

We take security vulnerabilities seriously. If you discover a potential vulnerability:
1. **Do not create a public issue**.
2. Email security details directly to `security@pharmaresearch.ai` or submit a private security report on GitHub.
3. Include detailed steps to reproduce the vulnerability.
4. Our team will acknowledge receipt within 24 hours and provide an estimated patch timeline.

---

## 3. Data Protection & Regulatory Compliance

### 3.1 Data Isolation & Non-Training Guarantee
- Clinical reports uploaded by an organization are stored in isolated tenant spaces.
- **Zero Public LLM Training**: No proprietary clinical study texts, trial data, or queries are utilized to train public foundation models.

### 3.2 Encryption Standards
- **In Transit**: Enforced TLS 1.3 encryption across all client-to-server and inter-service communications.
- **At Rest**: AES-256 encryption on all stored documents in cloud storage and database persistence volumes.

### 3.3 Authentication & Session Security
- Passwords are salted and hashed using `bcrypt` (10 rounds min).
- JWT session tokens are signed with HMAC-SHA256 and stored in `httpOnly`, `Secure`, `SameSite=Strict` cookies to mitigate XSS and CSRF risks.

### 3.4 Upload Sanitation
- Maximum upload size strictly capped at 10MB.
- Binary magic-byte inspection verifies PDF file headers, preventing arbitrary file upload execution.
