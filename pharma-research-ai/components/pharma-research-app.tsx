'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity, ArrowUpRight, Bell, BookOpen, Check, ChevronRight,
  Clock3, FileCheck2, FileText, Filter, FolderOpen, History,
  LayoutDashboard, Menu, MoreHorizontal, Paperclip, PanelRight,
  Plus, Search, Send, Moon, Sun, Settings, ShieldCheck, Sparkles,
  Trash2, UploadCloud, X, Zap, AlertCircle, Loader2,
} from 'lucide-react'



// ─── Dashboard panel ──────────────────────────────────────────────────────────

function Dashboard({ setActive, user }: { setActive: (id: string) => void; user: User }) {
  const [stats, setStats] = useState({ documentCount: 0, questionCount: 0 })
  const [recentDocs, setRecentDocs] = useState<Document[]>([])
  const [recentQuestions, setRecentQuestions] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats ?? { documentCount: 0, questionCount: 0 })
        setRecentDocs(data.recentDocuments ?? [])
        setRecentQuestions(data.recentQuestions ?? [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const displayName = user.name ?? user.email.split('@')[0]

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-5 md:p-8">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-primary px-6 py-7 text-primary-foreground shadow-[0_18px_50px_-20px_rgba(124,131,253,0.55)] md:px-8 md:py-8">
        <div className="relative z-10 max-w-xl">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">
            {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            {greeting}, {displayName}.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-primary-foreground/80">
            Pick up where you left off, or bring a new piece of evidence into your workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActive('documents')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <UploadCloud className="size-4" /> Upload document
            </button>
            <button
              onClick={() => setActive('chat')}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/30 px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
            >
              Ask a question <ArrowUpRight className="size-4" />
            </button>
          </div>
        </div>
        <div className="absolute -right-6 -top-12 size-64 rounded-full border border-primary-foreground/15" />
        <div className="absolute -bottom-24 right-24 size-72 rounded-full border border-primary-foreground/10" />
        <Sparkles className="absolute right-10 top-9 size-7 text-primary-foreground/60" />
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-border bg-mint-background p-5">
              <FileCheck2 className="size-5 text-primary" />
              <p className="mt-7 text-3xl font-semibold tracking-tight">{stats.documentCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">Documents indexed</p>
            </div>
            <div className="rounded-3xl border border-border bg-warm-background p-5">
              <BookOpen className="size-5 text-primary" />
              <p className="mt-7 text-3xl font-semibold tracking-tight">{stats.questionCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">Questions asked</p>
            </div>
            <div className="col-span-2 rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Evidence health</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats.documentCount > 0 ? 'Your workspace is ready to research.' : 'Upload a document to get started.'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-primary">{stats.documentCount > 0 ? '100%' : '—'}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">traceable</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: stats.documentCount > 0 ? '100%' : '0%' }} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent documents */}
            <section className="rounded-3xl border border-border bg-card p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Recent documents</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">Research library</h2>
                </div>
                <button onClick={() => setActive('documents')} className="rounded-xl bg-secondary px-3 py-2 text-xs font-medium hover:bg-lavender">
                  View all
                </button>
              </div>
              {recentDocs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <FolderOpen className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No documents yet. Upload your first PDF.</p>
                  <button onClick={() => setActive('documents')} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                    Upload document
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {recentDocs.map((doc, i) => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
                      <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${colorMap[docColor(i)]}`}>
                        <FileText className="size-4 text-foreground/70" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{doc.originalName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{doc.pageCount} pages · {formatDate(doc.createdAt)}</p>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent questions */}
            <section className="rounded-3xl border border-border bg-card p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Recent questions</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">Research history</h2>
                </div>
                <button onClick={() => setActive('history')} className="rounded-xl p-2 hover:bg-secondary" aria-label="View history">
                  <ArrowUpRight className="size-4" />
                </button>
              </div>
              {recentQuestions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <Sparkles className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No questions yet. Start a research chat.</p>
                  <button onClick={() => setActive('chat')} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                    Open chat
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {recentQuestions.map((q) => (
                    <button key={q.id} onClick={() => setActive('chat')} className="flex items-start gap-3 text-left">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-soft-blue text-primary">
                        <Sparkles className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{q.content}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(q.createdAt)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Activity className="size-5" />
      </div>
      <div>
        <p className="text-sm font-semibold tracking-tight">PharmaResearch</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">AI workspace</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    READY: 'bg-mint text-foreground',
    PROCESSING: 'bg-peach text-foreground',
    FAILED: 'bg-secondary text-muted-foreground',
  }
  const labels: Record<string, string> = { READY: 'Ready', PROCESSING: 'Processing', FAILED: 'Failed' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? 'bg-secondary'}`}>
      <span className={`size-1.5 rounded-full ${status === 'READY' ? 'bg-primary' : status === 'PROCESSING' ? 'bg-orange-500' : 'bg-muted-foreground'}`} />
      {labels[status] ?? status}
    </span>
  )
}

function Sidebar({
  active, setActive, mobileOpen, setMobileOpen, user,
}: {
  active: string; setActive: (id: string) => void
  mobileOpen: boolean; setMobileOpen: (v: boolean) => void
  user: User
}) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-foreground/10 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card px-4 py-5 transition-transform lg:relative lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <Logo />
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-10 flex flex-1 flex-col gap-7">
          <div>
            <p className="mb-3 px-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
            <nav className="flex flex-col gap-1">
              {nav.slice(0, 3).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActive(id); setMobileOpen(false) }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${active === id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                >
                  <Icon className="size-[18px]" />
                  {label}
                  {id === 'chat' && (
                    <span className={`ml-auto rounded-full px-1.5 py-0.5 font-mono text-[9px] ${active === id ? 'bg-primary-foreground/20' : 'bg-lavender text-foreground'}`}>AI</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div>
            <p className="mb-3 px-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Personal</p>
            <nav className="flex flex-col gap-1">
              {nav.slice(3).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActive(id); setMobileOpen(false) }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${active === id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                >
                  <Icon className="size-[18px]" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-lavender-mist p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span className="text-xs font-semibold">Private by design</span>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">Your documents stay yours. Evidence is always traceable.</p>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-border px-2 pt-4">
          <div className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials(user)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name ?? user.email.split('@')[0]}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Log out"
          >
            <X className="size-4" />
          </button>
        </div>
      </aside>
    </>
  )
}


function Header({
  setMobileOpen, active, theme, setTheme,
}: {
  setMobileOpen: (v: boolean) => void
  active: string
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
}) {
  const isDark = theme === 'dark'
  const label = nav.find((n) => n.id === active)?.label ?? active

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-3">
        <button aria-label="Open navigation" className="rounded-xl border border-border bg-card p-2.5 lg:hidden" onClick={() => setMobileOpen(true)}>
          <Menu className="size-4" />
        </button>
        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <span>Workspace</span>
          <ChevronRight className="size-3" />
          <span className="font-medium text-foreground">{label}</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          className="rounded-xl border border-border bg-card p-2.5 transition-colors hover:bg-secondary"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <button aria-label="Notifications" className="relative rounded-xl border border-border bg-card p-2.5">
          <Bell className="size-4" />
        </button>
      </div>
    </header>
  )
}

