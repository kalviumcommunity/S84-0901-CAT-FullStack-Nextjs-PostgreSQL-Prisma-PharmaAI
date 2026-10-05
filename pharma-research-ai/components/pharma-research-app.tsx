'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity, ArrowUpRight, BookOpen, Check, ChevronRight,
  FileCheck2, FileText, FolderOpen, History,
  LayoutDashboard, Menu, Sparkles,
  Plus, Search, Send, Moon, Sun, Settings, ShieldCheck,
  Trash2, UploadCloud, X, AlertCircle, Loader2,
  PanelRight,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string
  email: string
  name: string | null
}

interface Document {
  id: string
  originalName: string
  pageCount: number
  chunkCount?: number
  status: 'PROCESSING' | 'READY' | 'FAILED'
  fileSize?: number
  createdAt: string
}

interface DocumentWithChunks extends Document {
  chunks: { id: string; pageNumber: number; content: string }[]
}

interface Citation {
  id: string
  documentName: string
  pageNumber: number
  passage: string
  similarity?: number
}

interface ChatMessage {
  role: 'user' | 'ai'
  text: string
  citations?: Citation[]
  conversationId?: string
}

interface HistoryItem {
  id: string
  content: string
  createdAt: string
  conversationId: string
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  user: User
  initialTab?: string
  viewerDocument?: DocumentWithChunks
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'documents', label: 'Research Library', icon: FolderOpen },
  { id: 'chat', label: 'Research Chat', icon: Sparkles },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  if (diff < 172800000) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function initials(user: User) {
  if (user.name) return user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
  return user.email.slice(0, 2).toUpperCase()
}

const DOC_COLORS = ['lavender', 'mint', 'peach', 'blue']
function docColor(index: number) {
  return DOC_COLORS[index % DOC_COLORS.length]
}
const colorMap: Record<string, string> = {
  lavender: 'bg-lavender',
  mint: 'bg-mint',
  peach: 'bg-peach',
  blue: 'bg-soft-blue',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Header ───────────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  documents: 'Research Library',
  chat: 'Research Chat',
  history: 'History',
  settings: 'Settings',
  viewer: 'Document Viewer',
}

function Header({
  setMobileOpen,
  active,
  theme,
  setTheme,
}: {
  setMobileOpen: (v: boolean) => void
  active: string
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          aria-label="Open navigation"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" />
        </button>
        <p className="text-sm font-semibold">{PAGE_TITLES[active] ?? 'PharmaResearch AI'}</p>
      </div>

      <button
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </header>
  )
}

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

// ─── Library panel ────────────────────────────────────────────────────────────

function Library({ openViewer }: { openViewer: (doc: Document) => void }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const fetchDocs = useCallback(() => {
    setLoading(true)
    fetch('/api/documents')
      .then((r) => r.json())
      .then((d) => setDocuments(d.documents ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  // Poll for processing documents
  useEffect(() => {
    const processing = documents.some((d) => d.status === 'PROCESSING')
    if (!processing) return
    const t = setTimeout(fetchDocs, 3000)
    return () => clearTimeout(t)
  }, [documents, fetchDocs])

  async function handleUpload(file: File) {
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are accepted.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File size exceeds 20 MB.')
      return
    }

    setUploadError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/documents/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error ?? 'Upload failed')
        return
      }
      fetchDocs()
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    } catch {
      console.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const filtered = documents.filter((d) => {
    const matchesSearch = d.originalName.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Knowledge base</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Research Library</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your evidence, organized and ready to explore.</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:-translate-y-0.5 transition-transform"
        >
          <Plus className="size-4" /> Add document
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="group rounded-3xl border border-dashed border-primary/40 bg-lavender-mist p-7 text-center transition-colors hover:bg-lavender/30 md:p-10"
      >
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-card text-primary shadow-sm">
          {uploading ? <Loader2 className="size-6 animate-spin" /> : <UploadCloud className="size-6" />}
        </div>
        <h2 className="mt-4 text-lg font-semibold">
          {uploading ? 'Uploading…' : 'Drop research documents here'}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          PDFs up to 20 MB. Text is extracted, indexed, and made searchable.
        </p>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          Browse files
        </button>
        {uploadError && (
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4" /> {uploadError}
          </p>
        )}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" /> Private and encrypted
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }}
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          aria-label="Search documents"
          placeholder="Search documents…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Document list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FolderOpen className="size-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">{documents.length === 0 ? 'No documents yet. Upload your first PDF.' : 'No documents match your search.'}</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((doc, i) => (
            <div key={doc.id} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 transition-all hover:border-primary/40 hover:shadow-md">
              <button onClick={() => openViewer(doc)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${colorMap[docColor(i)]}`}>
                  <FileText className="size-5 text-foreground/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.originalName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {doc.pageCount} pages · {formatBytes(doc.fileSize)} · {formatDate(doc.createdAt)}
                  </p>
                </div>
                <StatusBadge status={doc.status} />
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deleting === doc.id}
                className="ml-1 shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-destructive group-hover:opacity-100 disabled:opacity-50"
                aria-label={`Delete ${doc.originalName}`}
              >
                {deleting === doc.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Evidence panel ───────────────────────────────────────────────────────────

function EvidencePanel({ citations, compact = false }: { citations?: Citation[]; compact?: boolean }) {
  if (!citations || citations.length === 0) {
    return (
      <aside className={`rounded-3xl border border-border bg-card ${compact ? 'p-4' : 'p-5'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="grid size-8 place-items-center rounded-lg bg-mint">
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Evidence</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">No sources yet</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Citations will appear here after you ask a question.</p>
      </aside>
    )
  }

  return (
    <aside className={`rounded-3xl border border-border bg-card ${compact ? 'p-4' : 'p-5'} flex flex-col gap-4 overflow-auto`}>
      <div className="flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg bg-mint">
          <ShieldCheck className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">Evidence</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{citations.length} source{citations.length !== 1 ? 's' : ''}</p>
        </div>
        <PanelRight className="ml-auto size-4 text-muted-foreground" />
      </div>

      {citations.map((c, i) => (
        <div key={c.id ?? i} className="rounded-2xl bg-lavender-mist p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-semibold">{c.documentName}</p>
            <span className="shrink-0 rounded-md bg-card px-2 py-1 font-mono text-[10px] text-primary">p. {c.pageNumber}</span>
          </div>
          <p className="mt-3 border-l-2 border-primary pl-3 text-xs leading-5 text-foreground/80 line-clamp-4">
            &ldquo;{c.passage}&rdquo;
          </p>
          {c.similarity != null && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Similarity</span>
              <span className="font-mono text-[10px] font-semibold text-primary">{Math.round(c.similarity * 100)}%</span>
            </div>
          )}
        </div>
      ))}
    </aside>
  )
}

// ─── Chat panel ───────────────────────────────────────────────────────────────

function Chat({ user: _user }: { user: User }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(question?: string) {
    const q = question ?? input.trim()
    if (!q || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: q }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, conversationId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: 'ai', text: data.error ?? 'Something went wrong.' }])
        return
      }

      setMessages((prev) => [...prev, { role: 'ai', text: data.answer }])
      setConversationId(data.conversationId)
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Request failed. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'What is a clinical trial?',
    'Explain drug safety monitoring.',
    'What are common adverse events?',
    'Summarize a typical study design.',
  ]

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-5 p-5 md:p-8" style={{ height: 'calc(100vh - 56px)' }}>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI assistant</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Research Chat</h1>
      </div>

      {/* Messages */}
      <section className="flex flex-1 flex-col rounded-3xl border border-border bg-card overflow-hidden">
        <div className="flex-1 overflow-auto p-5 md:p-8">
          <div className="flex flex-col gap-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="grid size-16 place-items-center rounded-2xl bg-lavender-mist text-primary">
                  <Sparkles className="size-7" />
                </div>
                <div>
                  <p className="font-semibold">Ask me anything</p>
                  <p className="mt-1 text-sm text-muted-foreground">Your pharmaceutical research assistant is ready.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 mt-2 w-full max-w-lg">
                  {suggestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="rounded-xl border border-border bg-card p-3 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-lavender-mist"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start gap-3'}`}>
                {m.role === 'ai' && (
                  <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Sparkles className="size-4" />
                  </div>
                )}
                <div className={`max-w-[85%] ${m.role === 'user' ? 'rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground' : 'rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-sm leading-7'}`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <div className="rounded-2xl border border-border bg-card px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Thinking…
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 focus-within:border-primary transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              rows={1}
              placeholder="Ask a question…"
              className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Send className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            PharmaResearch AI does not provide medical advice.
          </p>
        </div>
      </section>
    </div>
  )
}

// ─── Document viewer panel ────────────────────────────────────────────────────

function DocumentViewer({ document: doc, onBack }: { document: DocumentWithChunks; onBack: () => void }) {
  // Group chunks by page
  const pageMap: Record<number, string[]> = {}
  for (const chunk of doc.chunks) {
    if (!pageMap[chunk.pageNumber]) pageMap[chunk.pageNumber] = []
    pageMap[chunk.pageNumber].push(chunk.content)
  }
  const pages = Object.entries(pageMap).sort(([a], [b]) => Number(a) - Number(b))

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5 p-5 md:p-8">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-xl border border-border bg-card p-2.5 hover:bg-secondary" aria-label="Back to library">
          <ChevronRight className="size-4 rotate-180" />
        </button>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Document reader</p>
          <h1 className="mt-1 text-xl font-semibold">{doc.originalName}</h1>
        </div>
        <StatusBadge status={doc.status} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        {/* Metadata sidebar */}
        <aside className="rounded-3xl border border-border bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Document details</p>
          <div className="mt-5 flex flex-col gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Pages</p>
              <p className="mt-1 font-medium">{doc.pageCount} pages</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Chunks indexed</p>
              <p className="mt-1 font-medium">{doc.chunks.length} chunks</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Indexed</p>
              <p className="mt-1 font-medium">{formatDate(doc.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="mt-1"><StatusBadge status={doc.status} /></div>
            </div>
          </div>
        </aside>

        {/* Page content */}
        <div className="flex flex-col gap-5">
          {doc.status !== 'READY' ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-12 text-center">
              {doc.status === 'PROCESSING' ? (
                <>
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Document is being processed. Check back shortly.</p>
                </>
              ) : (
                <>
                  <AlertCircle className="size-8 text-destructive" />
                  <p className="text-sm text-muted-foreground">Processing failed. Please delete and re-upload this document.</p>
                </>
              )}
            </div>
          ) : pages.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">No extracted content available.</p>
            </div>
          ) : (
            pages.map(([pageNum, chunks]) => (
              <article key={pageNum} className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
                <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{doc.originalName}</p>
                  <span className="rounded-md bg-soft-blue px-2 py-1 font-mono text-[10px] text-primary">Page {pageNum}</span>
                </div>
                <div className="flex flex-col gap-4">
                  {chunks.map((content, i) => (
                    <p key={i} className="text-[15px] leading-8 text-foreground/80">{content}</p>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── History panel ────────────────────────────────────────────────────────────

function HistoryPanel({ setActive }: { setActive: (id: string) => void }) {
  const [conversations, setConversations] = useState<
    Array<{
      id: string
      title: string | null
      createdAt: string
      messages: Array<{
        id: string
        role: 'USER' | 'ASSISTANT'
        content: string
        citations: Array<{ id: string }>
      }>
    }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/chat/history')
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-6 p-5 md:p-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Personal workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Research History</h1>
        <p className="mt-2 text-sm text-muted-foreground">Revisit your questions and the evidence behind every answer.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-primary" /></div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <History className="size-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">No research sessions yet.</p>
          <button onClick={() => setActive('chat')} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            Start researching
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {conversations.map((conv) => {
            const userMsgs = conv.messages.filter((m) => m.role === 'USER')
            const aiMsgs = conv.messages.filter((m) => m.role === 'ASSISTANT')
            const totalCitations = aiMsgs.reduce((sum, m) => sum + (m.citations?.length ?? 0), 0)
            return (
              <div key={conv.id} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-lavender-mist text-primary">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{conv.title ?? userMsgs[0]?.content ?? 'Untitled session'}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(conv.createdAt)} · {userMsgs.length} question{userMsgs.length !== 1 ? 's' : ''} · {totalCitations} citation{totalCitations !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>

                {userMsgs.slice(0, 2).map((m) => (
                  <div key={m.id} className="mt-3 ml-[52px] text-sm text-muted-foreground truncate">
                    Q: {m.content}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Settings panel ───────────────────────────────────────────────────────────

function SettingsPanel({ user }: { user: User }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-6 p-5 md:p-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Personal workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your profile and workspace preferences.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 md:col-span-2">
          <h2 className="font-semibold">Profile</h2>
          <div className="mt-5 flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
              {initials(user)}
            </div>
            <div>
              <p className="font-medium">{user.name ?? 'No name set'}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-semibold">Workspace privacy</h2>
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-mint-background p-4">
            <ShieldCheck className="mt-0.5 size-4 text-primary" />
            <p className="text-xs leading-5 text-muted-foreground">
              Your uploaded documents are private to this workspace. PharmaResearch AI provides document-grounded research assistance and does not replace professional medical, clinical, regulatory, or scientific judgment.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-4">
          <h2 className="font-semibold">Account</h2>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:border-destructive hover:text-destructive transition-colors text-left"
          >
            Sign out of workspace
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function PharmaResearchApp({ user, initialTab = 'dashboard', viewerDocument }: Props) {
  const router = useRouter()
  const [active, setActiveRaw] = useState(initialTab)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setThemeRaw] = useState<'light' | 'dark'>('light')
  const [viewerDoc, setViewerDoc] = useState<DocumentWithChunks | null>(viewerDocument ?? null)

  // Persist theme to <html>
  useEffect(() => {
    const stored = localStorage.getItem('pharma-theme') as 'light' | 'dark' | null
    if (stored) { setThemeRaw(stored); document.documentElement.classList.toggle('dark', stored === 'dark') }
  }, [])

  function setTheme(t: 'light' | 'dark') {
    setThemeRaw(t)
    localStorage.setItem('pharma-theme', t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }

  function setActive(id: string) {
    setActiveRaw(id)
    setViewerDoc(null)
    // Sync URL without full navigation
    const path = id === 'dashboard' ? '/dashboard' : id === 'documents' ? '/documents' : id === 'chat' ? '/chat' : `/dashboard`
    window.history.pushState({}, '', path)
  }

  async function openViewer(doc: Document) {
    try {
      const res = await fetch(`/api/documents/${doc.id}`)
      if (!res.ok) return
      const data = await res.json()
      setViewerDoc(data.document)
      setActiveRaw('viewer')
    } catch {
      // Silently fail — user stays on current panel
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar active={active} setActive={setActive} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} user={user} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header setMobileOpen={setMobileOpen} active={active} theme={theme} setTheme={setTheme} />

        <main className="flex-1 overflow-auto">
          {active === 'dashboard' && <Dashboard setActive={setActive} user={user} />}
          {active === 'documents' && <Library openViewer={openViewer} />}
          {active === 'chat' && <Chat user={user} />}
          {active === 'history' && <HistoryPanel setActive={setActive} />}
          {active === 'settings' && <SettingsPanel user={user} />}
          {active === 'viewer' && viewerDoc && (
            <DocumentViewer document={viewerDoc} onBack={() => setActive('documents')} />
          )}
        </main>
      </div>
    </div>
  )
}
