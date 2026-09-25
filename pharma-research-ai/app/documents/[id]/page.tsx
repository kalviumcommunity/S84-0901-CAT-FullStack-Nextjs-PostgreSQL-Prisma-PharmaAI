'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText, MessageSquare, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

type Source = { id: string; pageNumber: number; passage: string };
type DocumentRecord = { id: string; name: string; size: number; status: string; uploadedAt: string; pages: number; sources: Source[] };

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const [document, setDocument] = useState<DocumentRecord | null>(null);
	const [error, setError] = useState('');

	useEffect(() => {
		params.then(({ id }) => fetch(`/api/documents/${id}`).then(async (response) => {
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || 'Document could not be loaded.');
			setDocument(data.document);
		}).catch((reason: Error) => setError(reason.message)));
	}, [params]);

	if (error) return <main className="grid min-h-screen place-items-center bg-[#f7f8f5] px-6 text-center text-[#18221f]"><div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#b15b45]">Evidence unavailable</p><h1 className="mt-3 text-2xl font-semibold text-[#153f35]">{error}</h1><Link href="/documents" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#537d30]"><ArrowLeft size={16} /> Back to documents</Link></div></main>;
	if (!document) return <main className="grid min-h-screen place-items-center bg-[#f7f8f5] text-sm text-[#68756e]">Loading evidence...</main>;

	return <main className="min-h-screen bg-[#f7f8f5] px-6 py-8 text-[#18221f] lg:px-10"><header className="mx-auto flex max-w-7xl items-center justify-between"><Link href="/" className="text-sm font-semibold text-[#153f35]">PharmaResearch <span className="text-[#537d30]">AI</span></Link><nav className="flex items-center gap-5 text-sm text-[#52605a]"><Link href="/dashboard">Dashboard</Link><Link href="/chat">Research chat</Link></nav></header><section className="mx-auto max-w-7xl py-12"><Link href="/documents" className="inline-flex items-center gap-2 text-xs font-semibold text-[#537d30]"><ArrowLeft size={15} /> Evidence library</Link><div className="mt-7 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"><div><div className="grid size-14 place-items-center rounded-2xl bg-[#153f35] text-[#d7f16f]"><FileText size={25} /></div><p className="mt-7 font-mono text-[11px] uppercase tracking-[0.2em] text-[#537d30]">Source document</p><h1 className="mt-3 break-words text-4xl font-semibold tracking-[-0.04em] text-[#153f35]">{document.name}</h1><p className="mt-4 text-sm leading-6 text-[#68756e]">Uploaded {new Date(document.uploadedAt).toLocaleDateString()} · {document.pages} pages · {(document.size / 1000000).toFixed(1)} MB</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/chat" className="inline-flex items-center gap-2 rounded-xl bg-[#153f35] px-4 py-3 text-sm font-semibold text-white"><MessageSquare size={16} /> Ask about this file</Link><span className="inline-flex items-center gap-2 rounded-xl border border-[#c9d2c8] bg-white px-4 py-3 text-sm font-semibold text-[#537d30]"><ShieldCheck size={16} /> {document.status}</span></div></div><div className="rounded-[1.75rem] border border-[#dfe6dd] bg-white p-6 shadow-[0_20px_50px_-35px_#153f35] sm:p-8"><div className="flex items-center justify-between border-b border-[#e6ece4] pb-5"><div><p className="text-xs font-semibold text-[#153f35]">Indexed evidence</p><p className="mt-1 text-xs text-[#7a867f]">Passages available for review</p></div><BookOpen size={20} className="text-[#537d30]" /></div><div className="mt-6 space-y-4">{document.sources.map((source) => <article key={source.id} className="rounded-2xl bg-[#f1f6ed] p-5"><div className="flex items-center justify-between gap-3"><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#537d30]">Page {source.pageNumber}</span><span className="rounded-full bg-[#d7f16f] px-2.5 py-1 text-[10px] font-bold text-[#153f35]">Cited</span></div><p className="mt-4 text-sm leading-7 text-[#34443c]">{source.passage}</p></article>)}</div></div></div></section></main>;
}