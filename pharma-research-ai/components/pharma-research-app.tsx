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
