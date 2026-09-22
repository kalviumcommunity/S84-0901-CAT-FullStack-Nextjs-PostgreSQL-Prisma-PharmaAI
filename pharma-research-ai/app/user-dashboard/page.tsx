'use client';

import Link from 'next/link';
import { Activity, ArrowUpRight, FileText, LogOut, MessageSquare, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthUser, clearStoredUser, getStoredUser } from '@/lib/auth';

const activity = [
  { title: 'Clinical trial analysis ready', detail: 'Drug A efficacy report', time: '2 hours ago', icon: MessageSquare },
  { title: 'Safety bulletin indexed', detail: 'Safety-Bulletin-Q2.pdf', time: '4 hours ago', icon: FileText },
  { title: 'Evidence review completed', detail: 'Primary endpoint at Week 12', time: 'Yesterday', icon: ShieldCheck },
];

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(storedUser);
    setMounted(true);
  }, [router]);

  function handleLogout() {
    clearStoredUser();
    router.push('/login');
  }

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-7 text-[#18221f] lg:px-10">
      <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-[#dde5db] pb-6">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-[#153f35]"><span className="grid size-9 place-items-center rounded-xl bg-[#153f35] text-xs font-bold text-[#d7f16f]">PR</span>PharmaResearch <span className="text-[#537d30]">AI</span></Link>
        <div className="flex items-center gap-4"><Link href="/dashboard" className="text-xs font-semibold text-[#537d30]">Clinical dashboard</Link><button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 text-xs font-semibold text-[#68756e] hover:text-[#b15b45]"><LogOut size={15} /> Sign out</button></div>
      </header>

      <section className="mx-auto max-w-7xl py-12">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#537d30]">Research workspace</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#153f35]">Welcome back, {user?.name || 'Researcher'}.</h1><p className="mt-3 text-sm leading-6 text-[#68756e]">Your evidence library and active research work are ready for review.</p></div><div className="flex gap-3"><Link href="/chat" className="inline-flex items-center gap-2 rounded-xl bg-[#d7f16f] px-4 py-3 text-sm font-semibold text-[#153f35]"><MessageSquare size={16} /> New analysis</Link><Link href="/documents" className="inline-flex items-center gap-2 rounded-xl border border-[#c9d2c8] bg-white px-4 py-3 text-sm font-semibold text-[#153f35]"><FileText size={16} /> Documents</Link></div></div>

        <div className="mt-10 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-[#dfe6dd] bg-white p-5"><div className="flex items-center justify-between"><p className="text-xs text-[#7a867f]">Active analyses</p><Activity size={18} className="text-[#537d30]" /></div><p className="mt-4 text-3xl font-semibold text-[#153f35]">12</p><p className="mt-1 text-xs text-[#68756e]">Across your research workspace</p></div><div className="rounded-2xl border border-[#dfe6dd] bg-white p-5"><div className="flex items-center justify-between"><p className="text-xs text-[#7a867f]">Saved documents</p><FileText size={18} className="text-[#537d30]" /></div><p className="mt-4 text-3xl font-semibold text-[#153f35]">148</p><p className="mt-1 text-xs text-[#68756e]">Available for evidence search</p></div><div className="rounded-2xl border border-[#dfe6dd] bg-white p-5"><div className="flex items-center justify-between"><p className="text-xs text-[#7a867f]">Verified answers</p><ShieldCheck size={18} className="text-[#537d30]" /></div><p className="mt-4 text-3xl font-semibold text-[#153f35]">34</p><p className="mt-1 text-xs text-[#68756e]">Grounded in source passages</p></div></div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]"><section className="rounded-[1.75rem] border border-[#dfe6dd] bg-white p-6 sm:p-8"><div className="flex items-center justify-between border-b border-[#e6ece4] pb-5"><div><h2 className="text-lg font-semibold text-[#153f35]">Recent activity</h2><p className="mt-1 text-xs text-[#7a867f]">The latest work in your evidence workspace.</p></div><Link href="/dashboard" className="text-xs font-semibold text-[#537d30]">Open dashboard</Link></div><div className="mt-3 divide-y divide-[#edf1eb]">{activity.map((item) => <Link href={item.icon === FileText ? '/documents' : '/chat'} key={item.title} className="group flex items-center gap-4 py-5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf5e3] text-[#537d30]"><item.icon size={17} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#153f35]">{item.title}</span><span className="mt-1 block text-xs text-[#7a867f]">{item.detail} · {item.time}</span></span><ArrowUpRight size={17} className="text-[#9cac9f] transition-colors group-hover:text-[#537d30]" /></Link>)}</div></section><aside className="rounded-[1.75rem] bg-[#153f35] p-7 text-white"><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#d7f16f]">Account</p><div className="mt-8 grid size-14 place-items-center rounded-2xl bg-[#d7f16f] text-xl font-bold text-[#153f35]">{user?.avatarLetter || 'R'}</div><h2 className="mt-5 text-xl font-semibold">{user?.name || 'Researcher'}</h2><p className="mt-1 break-all text-sm text-[#c9d7ce]">{user?.email || 'researcher@pharma-ai.org'}</p><div className="mt-8 border-t border-white/15 pt-5"><p className="text-xs text-[#c9d7ce]">Workspace status</p><div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#d7f16f]"><span className="size-2 rounded-full bg-[#d7f16f]" /> Evidence sync active</div></div></aside></div>
      </section>
    </main>
  );
}
