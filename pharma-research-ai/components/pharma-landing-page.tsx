'use client'

import Link from 'next/link'
import { useState } from 'react'


export default function PharmaLandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  return 
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8"><Brand /><nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex"><a href="#product" className="transition-colors hover:text-foreground">Product</a><a href="#how-it-works" className="transition-colors hover:text-foreground">How It Works</a><a href="#features" className="transition-colors hover:text-foreground">Features</a><a href="#security" className="transition-colors hover:text-foreground">Security</a></nav><div className="hidden items-center gap-3 sm:flex"><Link href="/login" className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Sign In</Link><CTA>Get Started <ArrowRight className="size-4" /></CTA></div><button aria-label="Open menu" className="rounded-xl border border-border bg-card p-2.5 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}</button></header>
}