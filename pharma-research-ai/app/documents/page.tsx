'use client';

import Link from 'next/link';
import { ChangeEvent, useEffect, useState } from 'react';
import { ArrowUpRight, FileText, Loader2, Search, Trash2, UploadCloud } from 'lucide-react';

type DocumentRecord = {
  id: string;
  name: string;
  size: number;
  status: string;
  uploadedAt: string;
  pages: number;
};

function formatSize(size: number) {
  return `${(size / 1000000).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/documents')
      .then((response) => response.json())
      .then((data) => setDocuments(data.documents ?? []))
      .catch(() => setError('The evidence library could not be loaded.'));
  }, []);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    try {
      const response = await fetch('/api/documents', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed.');
      setDocuments((current) => [data.document, ...current]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Upload failed.');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  async function remove(id: string) {
    const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (response.ok) setDocuments((current) => current.filter((document) => document.id !== id));
  }

  const filteredDocuments = documents.filter((document) => document.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-8 text-[#18221f] lg:px-10">
      <header className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-[#153f35]">PharmaResearch <span className="text-[#537d30]">AI</span></Link>
        <nav className="flex items-center gap-5 text-sm text-[#52605a]">
          <Link href="/dashboard" className="hover:text-[#153f35]">Dashboard</Link>
          <Link href="/chat" className="hover:text-[#153f35]">Research chat</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl py-12">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#537d30]">Evidence library</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#153f35]">Your documents</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#68756e]">Keep clinical reports, labels, and safety bulletins in one reviewable source library.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#153f35] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#235a4b]">
            {busy ? <Loader2 size={17} className="animate-spin" /> : <UploadCloud size={17} />}
            {busy ? 'Processing...' : 'Upload PDF'}
            <input type="file" accept="application/pdf" onChange={upload} className="sr-only" disabled={busy} />
          </label>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#dfe6dd] bg-white p-5"><p className="text-xs text-[#7a867f]">Indexed files</p><p className="mt-2 text-3xl font-semibold text-[#153f35]">{documents.length}</p></div>
          <div className="rounded-2xl border border-[#dfe6dd] bg-white p-5"><p className="text-xs text-[#7a867f]">Ready for questions</p><p className="mt-2 text-3xl font-semibold text-[#153f35]">{documents.filter((document) => document.status === 'READY').length}</p></div>
          <div className="rounded-2xl border border-[#dfe6dd] bg-white p-5"><p className="text-xs text-[#7a867f]">Evidence pages</p><p className="mt-2 text-3xl font-semibold text-[#153f35]">{documents.reduce((total, document) => total + document.pages, 0)}</p></div>
        </div>

        {error && <p className="mt-6 rounded-xl border border-[#e8c8bd] bg-[#fff5f1] px-4 py-3 text-sm text-[#8f4736]">{error}</p>}

        <div className="mt-8 rounded-[1.75rem] border border-[#dfe6dd] bg-white p-5 shadow-[0_20px_50px_-40px_#153f35] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e6ece4] pb-5">
            <div><h2 className="text-lg font-semibold text-[#153f35]">Source inventory</h2><p className="mt-1 text-xs text-[#7a867f]">Select a file to review its cited passages.</p></div>
            <label className="flex w-full items-center gap-2 rounded-xl border border-[#dce5d9] bg-[#fbfcf9] px-3 py-2 text-sm text-[#68756e] sm:w-64"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents" className="min-w-0 flex-1 bg-transparent text-xs text-[#18221f] outline-none" /></label>
          </div>
          <div className="mt-5 space-y-3">
            {filteredDocuments.length === 0 ? <div className="py-12 text-center text-sm text-[#7a867f]">No matching documents yet. Upload a PDF to start building the library.</div> : filteredDocuments.map((document) => (
              <div key={document.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e4ebe1] bg-[#fbfcf9] p-4 transition-colors hover:border-[#b9cf9f]">
                <Link href={`/documents/${document.id}`} className="flex min-w-0 items-center gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f0df] text-[#537d30]"><FileText size={18} /></span>
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold text-[#153f35]">{document.name}</span><span className="mt-1 block text-xs text-[#7a867f]">{document.pages} pages · {formatSize(document.size)} · {new Date(document.uploadedAt).toLocaleDateString()}</span></span>
                </Link>
                <div className="flex items-center gap-3"><span className="rounded-full bg-[#edf5e3] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#537d30]">{document.status}</span><Link href={`/documents/${document.id}`} aria-label={`Open ${document.name}`} className="text-[#537d30] hover:text-[#153f35]"><ArrowUpRight size={17} /></Link><button type="button" onClick={() => remove(document.id)} aria-label={`Delete ${document.name}`} className="text-[#b15b45] hover:text-[#813b2c]"><Trash2 size={17} /></button></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
