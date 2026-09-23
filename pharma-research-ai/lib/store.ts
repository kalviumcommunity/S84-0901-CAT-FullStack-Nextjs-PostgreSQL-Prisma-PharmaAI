import { createHash, randomUUID } from 'node:crypto';

export type User = { id: string; name: string; email: string; passwordHash: string };
export type Source = { id: string; documentId: string; documentName: string; pageNumber: number; passage: string };
export type DocumentRecord = { id: string; name: string; size: number; status: 'READY' | 'PROCESSING'; uploadedAt: string; pages: number; sources: Source[] };
export type ChatMessage = { id: string; role: 'USER' | 'AI'; content: string; sources?: Source[]; createdAt: string };

const users: User[] = [];
const documents: DocumentRecord[] = [
  {
    id: 'demo-trial', name: 'Clinical-Trial-DrugA.pdf', size: 2400000, status: 'READY', uploadedAt: '2026-09-12T09:30:00.000Z', pages: 42,
    sources: [
      { id: 'source-trial-18', documentId: 'demo-trial', documentName: 'Clinical-Trial-DrugA.pdf', pageNumber: 18, passage: 'The primary endpoint was progression-free survival (PFS), assessed from randomization to disease progression or death from any cause.' },
      { id: 'source-trial-21', documentId: 'demo-trial', documentName: 'Clinical-Trial-DrugA.pdf', pageNumber: 21, passage: 'At Week 12, the least-squares mean difference in symptom score was 4.8 points compared with placebo.' },
    ],
  },
  {
    id: 'demo-safety', name: 'Safety-Bulletin-Q2.pdf', size: 890000, status: 'READY', uploadedAt: '2026-09-10T14:15:00.000Z', pages: 16,
    sources: [{ id: 'source-safety-6', documentId: 'demo-safety', documentName: 'Safety-Bulletin-Q2.pdf', pageNumber: 6, passage: 'Mild injection-site reactions were reported more frequently, while serious adverse events remained comparable with placebo.' }],
  },
];
const conversations = new Map<string, ChatMessage[]>();

export function hashPassword(password: string) { return createHash('sha256').update(password).digest('hex'); }
export function findUser(email: string) { return users.find((user) => user.email === email.toLowerCase()); }
export function createUser(name: string, email: string, password: string) {
  const user = { id: randomUUID(), name, email: email.toLowerCase(), passwordHash: hashPassword(password) };
  users.push(user);
  return user;
}
export function listDocuments() { return documents; }
export function getDocument(id: string) { return documents.find((document) => document.id === id); }
export function addDocument(name: string, size: number) {
  const id = randomUUID();
  const source: Source = { id: `${id}-source`, documentId: id, documentName: name, pageNumber: 1, passage: 'This document has been uploaded and is ready for indexing. Add an AI provider to extract and embed its PDF content.' };
  const document: DocumentRecord = { id, name, size, status: 'READY', uploadedAt: new Date().toISOString(), pages: 1, sources: [source] };
  documents.unshift(document);
  return document;
}
export function deleteDocument(id: string) { const index = documents.findIndex((document) => document.id === id); if (index >= 0) documents.splice(index, 1); }
export function getConversation(id: string) { return conversations.get(id) ?? []; }
export function answerQuestion(conversationId: string, question: string) {
  const messages = getConversation(conversationId);
  const terms = question.toLowerCase().split(/\W+/).filter((term) => term.length > 3);
  const sources = documents.flatMap((document) => document.sources).sort((a, b) => {
    const score = (source: Source) => terms.filter((term) => `${source.passage} ${source.documentName}`.toLowerCase().includes(term)).length;
    return score(b) - score(a);
  }).slice(0, 3);
  const answer = sources.length
    ? `Based on the uploaded evidence, ${sources[0].passage.charAt(0).toLowerCase()}${sources[0].passage.slice(1)}`
    : 'I could not find supporting evidence in the uploaded documents. Try uploading the relevant trial report, label, or safety bulletin.';
  const now = new Date().toISOString();
  messages.push({ id: randomUUID(), role: 'USER', content: question, createdAt: now });
  messages.push({ id: randomUUID(), role: 'AI', content: answer, sources, createdAt: now });
  conversations.set(conversationId, messages);
  return messages[messages.length - 1];
}