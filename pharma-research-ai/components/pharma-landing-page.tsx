'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getStoredUser, AuthUser } from '@/lib/auth'

const questions = [
  {
    label: 'Efficacy at Week 12',
    question: 'How did Drug A perform at Week 12?',
    answer: 'Drug A demonstrated a meaningful improvement in symptom scores at Week 12, with a least-squares mean difference of 4.8 points compared with placebo.',
    source: 'Clinical-Trial-DrugA.pdf',
    page: 'Page 18',
  },
  {
    label: 'Safety signal',
    question: 'What adverse event should researchers watch?',
    answer: 'The safety bulletin reports a higher incidence of mild injection-site reactions, while serious adverse events remained comparable with placebo.',
    source: 'Safety-Bulletin-Q2.pdf',
    page: 'Page 6',
  },
  {
    label: 'Prescribing guidance',
    question: 'What is the approved dosing guidance?',
    answer: 'The approved label recommends one 40 mg dose every two weeks, with administration guidance and contraindications listed in the prescribing information.',
    source: 'DrugA-Label.pdf',
    page: 'Page 11',
  },
]

const evidence = [
  { label: 'Clinical trial report', value: 'Phase 3 efficacy study', color: 'bg-[#7aa5b2]' },
  { label: 'Drug label', value: 'Approved prescribing information', color: 'bg-[#8caf55]' },
  { label: 'Safety bulletin', value: 'Post-market surveillance update', color: 'bg-[#d1a957]' },
]

export default function PharmaLandingPage() {
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [user, setUser] = useState<AuthUser | null>(null)
  const current = questions[selectedQuestion]

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f5] text-[#18221f]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="PharmaResearch AI home">
          <span className="grid size-10 place-items-center rounded-xl bg-[#153f35] text-sm font-bold text-[#d7f16f]">PR</span>
          <span className="text-sm font-semibold tracking-tight">PharmaResearch <span className="text-[#537d30]">AI</span></span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-[#52605a] md:flex" aria-label="Primary navigation">
          <Link href="/documents" className="transition-colors hover:text-[#153f35]">Document library</Link>
          <Link href="/chat" className="transition-colors hover:text-[#153f35]">Research chat</Link>
          {user && (
            <Link href="/dashboard" className="transition-colors hover:text-[#153f35] font-semibold text-[#153f35]">Dashboard</Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-full bg-[#153f35] px-4 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <span className="grid size-5 place-items-center rounded-full bg-[#d7f16f] text-[10px] font-bold text-[#153f35]">
                {user.avatarLetter || 'R'}
              </span>
              <span>Dashboard ({user.name.split(' ')[0]})</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full border border-[#c9d2c8] bg-white px-4 py-2 text-xs font-semibold text-[#153f35] transition-colors hover:bg-[#eef3e9]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#153f35] px-4 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-20">
        <div>
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#537d30]">Evidence, without the scavenger hunt</p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#153f35] sm:text-6xl">Ask the study. Get the source.</h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-[#52605a]">PharmaResearch AI helps clinical teams find clear answers in trial reports, drug labels, and safety bulletins, with the exact document passage attached.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/chat" className="rounded-full bg-[#d7f16f] px-6 py-3.5 text-sm font-semibold text-[#153f35] shadow-[0_12px_30px_-16px_#537d30] transition-transform hover:-translate-y-0.5">Open research chat</Link>
            <Link href="/documents" className="rounded-full border border-[#c9d2c8] bg-white px-6 py-3.5 text-sm font-semibold text-[#153f35] transition-colors hover:bg-[#eef3e9]">Browse documents</Link>
          </div>
          <div className="mt-10 flex items-center gap-3 text-xs text-[#68756e]"><span className="size-2 rounded-full bg-[#6e9d3f]" /> Answers stay tied to the evidence your team uploaded.</div>
        </div>

        <div className="rounded-[2rem] bg-[#153f35] p-3 shadow-[0_35px_70px_-35px_#153f35]">
          <div className="rounded-[1.5rem] bg-[#fbfcf8] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-[#e1e7df] pb-5">
              <div><p className="text-xs font-semibold text-[#153f35]">Research chat</p><p className="mt-1 text-[11px] text-[#7a867f]">Drug A / evidence workspace</p></div>
              <span className="shrink-0 rounded-full bg-[#eef5d8] px-3 py-1 text-[10px] font-semibold text-[#537d30]">3 sources found</span>
            </div>
            <div className="py-7"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7a867f]">Try a question</p><div className="mt-3 flex flex-wrap gap-2">{questions.map((item, index) => <button key={item.label} type="button" onClick={() => setSelectedQuestion(index)} className={`rounded-full border px-3 py-2 text-left text-[11px] font-semibold transition-colors ${selectedQuestion === index ? 'border-[#153f35] bg-[#153f35] text-white' : 'border-[#dce5d9] bg-white text-[#52605a] hover:border-[#8caf55]'}`}>{item.label}</button>)}</div><p className="mt-5 text-xl font-semibold leading-8 text-[#18221f]">{current.question}</p></div>
            <div className="rounded-2xl bg-[#edf4e6] p-5"><div className="flex items-center gap-2 text-xs font-bold text-[#537d30]"><span className="grid size-5 place-items-center rounded-full bg-[#d7f16f] text-[10px]">✓</span> Evidence-grounded answer</div><p className="mt-4 text-sm leading-7 text-[#34443c]">{current.answer}</p><div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] font-semibold"><span className="rounded-lg bg-white px-3 py-2 text-[#52605a]">{current.source}</span><span className="rounded-lg bg-[#d7f16f] px-3 py-2 text-[#153f35]">{current.page}</span></div></div>
            <div className="mt-5 border-l-2 border-[#d7f16f] pl-4 text-xs leading-6 text-[#68756e]">Source passages stay attached to each answer for review.</div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dde5db] bg-white/70 px-6 py-16 lg:px-10"><div className="mx-auto max-w-7xl"><div className="mb-9 flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#537d30]">One workspace</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#153f35]">The evidence your question needs.</h2></div><p className="max-w-sm text-sm leading-6 text-[#68756e]">Keep source documents and research conversations together so every answer is easier to verify and share.</p></div><div className="grid gap-4 md:grid-cols-3">{evidence.map((item) => <div key={item.label} className="rounded-2xl border border-[#dfe6dd] bg-[#fbfcf8] p-5"><div className={`mb-8 size-3 rounded-full ${item.color}`} /><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a867f]">{item.label}</p><p className="mt-2 text-lg font-semibold text-[#153f35]">{item.value}</p></div>)}</div></div></section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-xs text-[#7a867f] sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>PharmaResearch AI - Built for evidence-led research</span><span>Next.js - React - PostgreSQL - Prisma</span></footer>
    </main>
  )
}
