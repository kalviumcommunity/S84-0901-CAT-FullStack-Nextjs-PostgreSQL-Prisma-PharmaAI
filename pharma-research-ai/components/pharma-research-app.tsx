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

