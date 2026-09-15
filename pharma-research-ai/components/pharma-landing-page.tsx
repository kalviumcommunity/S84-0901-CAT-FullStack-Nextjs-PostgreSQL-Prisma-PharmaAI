'use client'

import Link from 'next/link'
import { Activity, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

function Mark() {
  return (
    <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_-10px_rgba(124,131,253,0.8)]">
      <Activity className="size-5" />
    </div>
  )
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Mark />

      <span className="text-sm font-semibold tracking-tight text-foreground">
        PharmaResearch <span className="text-primary">AI</span>
      </span>
    </Link>
  )
}

function SectionIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string
  title: string
  text: string
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h2>

      <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">
        {text}
      </p>
    </div>
  )
}

export default function PharmaLandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Brand />

        <Link
          href="/signup"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_14px_28px_-14px_rgba(124,131,253,0.8)] transition-transform hover:-translate-y-0.5"
        >
          Get Started
          <ArrowRight className="size-4" />
        </Link>
      </header>

      <Showcase />
    </main>
  )
}

function Showcase() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <SectionIntro
        eyebrow="A calmer way to investigate"
        title="Your research chat, with the receipts attached."
        text="Keep questions, answers, and source passages in one focused interface."
      />

      <div className="mt-12 overflow-hidden rounded-[2rem] border border-border bg-primary p-3 shadow-[0_30px_70px_-35px_rgba(124,131,253,0.8)]">
        <div className="rounded-[1.5rem] bg-card p-4 md:p-7">
          <div className="flex items-center justify-between border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <Mark />

              <div>
                <p className="text-sm font-semibold">
                  PharmaResearch AI
                </p>

                <p className="text-xs text-muted-foreground">
                  Research Chat · Drug A workspace
                </p>
              </div>
            </div>

            <span className="rounded-full bg-mint-background px-3 py-1 text-[10px] font-medium text-primary">
              All systems ready
            </span>
          </div>

          <div className="grid gap-6 pt-7 lg:grid-cols-[1fr_0.45fr]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Question
              </p>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                How did Drug A perform at Week 12?
              </h3>

              <div className="mt-7 rounded-2xl bg-lavender-mist p-5">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Sparkles className="size-4 text-primary" />
                  Evidence-grounded answer
                </div>

                <p className="mt-4 text-sm leading-7 text-foreground/80">
                  Drug A demonstrated a meaningful improvement in symptom
                  scores at Week 12, with a least-squares mean difference of
                  4.8 points compared with placebo.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-card px-3 py-2 text-[10px] font-medium">
                    Clinical-Trial-DrugA.pdf
                  </span>

                  <span className="rounded-lg bg-card px-3 py-2 font-mono text-[10px] text-primary">
                    Page 18
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ShieldCheck className="size-4 text-primary" />
                Evidence panel
              </div>

              <p className="mt-5 border-l-2 border-primary pl-3 text-sm leading-6 text-foreground/75">
                “The least-squares mean difference favored Drug A by 4.8
                points.”
              </p>

              <Link
                href="/sources"
                className="mt-5 flex items-center gap-1 text-xs font-semibold text-primary"
              >
                Open source
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}