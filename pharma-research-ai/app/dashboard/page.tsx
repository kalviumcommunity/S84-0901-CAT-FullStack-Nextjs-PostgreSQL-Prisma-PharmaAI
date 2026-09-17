'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearStoredUser, AuthUser, buildUserFromEmail } from '@/lib/auth';

const recentEvidenceItems = [
  {
    id: 'ev-1',
    query: 'How did Drug A perform at Week 12 primary endpoint?',
    drug: 'Drug A (Novastatin)',
    phase: 'Phase 3 Efficacy',
    source: 'Clinical-Trial-DrugA.pdf',
    page: 'Page 18',
    confidence: '99.4%',
    status: 'Verified',
    date: '10 mins ago',
  },
  {
    id: 'ev-2',
    query: 'Adverse reaction rates compared to standard of care placebo',
    drug: 'Trial Agent 40mg',
    phase: 'Safety Bulletin Q2',
    source: 'Safety-Bulletin-Q2.pdf',
    page: 'Page 6',
    confidence: '98.1%',
    status: 'Verified',
    date: '2 hours ago',
  },
  {
    id: 'ev-3',
    query: 'Dosage adjustments in patients with mild renal impairment',
    drug: 'Approved Formulation',
    phase: 'FDA Drug Label',
    source: 'DrugA-Label.pdf',
    page: 'Page 11',
    confidence: '100%',
    status: 'Verified',
    date: 'Yesterday',
  },
  {
    id: 'ev-4',
    query: 'Secondary biomarkers for cardiovascular risk reduction at Month 6',
    drug: 'Lipid-Modulator X',
    phase: 'Longitudinal Cohort',
    source: 'Cardio-Meta-Analysis.pdf',
    page: 'Page 42',
    confidence: '96.7%',
    status: 'Verified',
    date: '2 days ago',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'queries' | 'sources'>('overview');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    setMounted(true);
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    } else {
      // Default guest session so the dashboard is immediately exploratory if directly navigated
      const demo = buildUserFromEmail('guest.investigator@pharma-research.org', 'Dr. Guest Investigator');
      setUser(demo);
    }
  }, []);

  const handleLogout = () => {
    clearStoredUser();
    router.push('/login');
    setTimeout(() => {
      window.location.href = '/login';
    }, 200);
  };

  const filteredItems = recentEvidenceItems.filter(
    (item) =>
      item.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.drug.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.source.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-[#18221f] flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#dde5db] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-[#153f35] text-xs font-bold text-[#d7f16f]">
                PR
              </span>
              <span className="text-sm font-semibold tracking-tight text-[#153f35]">
                PharmaResearch <span className="text-[#537d30]">AI</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="rounded-full bg-[#153f35] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#52605a] hover:bg-[#ebf1e8] hover:text-[#153f35] transition-colors"
              >
                Research Chat
              </Link>
              <Link
                href="/documents"
                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#52605a] hover:bg-[#ebf1e8] hover:text-[#153f35] transition-colors"
              >
                Document Library
              </Link>
            </nav>
          </div>

          {/* User badge and actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-[#dce5d9] bg-white px-3 py-1.5 shadow-sm">
              <div className="grid size-7 place-items-center rounded-full bg-[#537d30] text-xs font-bold text-white">
                {user?.avatarLetter || 'R'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[#153f35] leading-tight">
                  {user?.name || 'Clinical Investigator'}
                </p>
                <p className="text-[10px] text-[#6d8276] leading-tight max-w-[140px] truncate">
                  {user?.email || 'authenticated'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              id="logout-btn"
              className="rounded-full border border-[#c9d2c8] bg-white px-3.5 py-1.5 text-xs font-medium text-[#52605a] hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
              title="Sign out of workspace"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-[2rem] bg-[#153f35] p-6 sm:p-8 text-white shadow-[0_20px_45px_-15px_rgba(21,63,53,0.3)]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d7f16f]/20 px-3 py-0.5 text-[11px] font-semibold text-[#d7f16f] border border-[#d7f16f]/30">
                  <span className="size-1.5 rounded-full bg-[#d7f16f] animate-pulse" />
                  Authenticated Session Active
                </span>
                <span className="text-[11px] text-[#a5c2b9]">
                  Logged in as: <strong className="text-white">{user?.email}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back, {user?.name || 'Dr. Researcher'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#b2cfc4] max-w-xl">
                Your clinical study evidence is indexed and ready. Query across clinical trial reports, FDA labels, and post-market safety bulletins with instant passage citations.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/chat"
                className="rounded-full bg-[#d7f16f] px-5 py-2.5 text-xs font-semibold text-[#153f35] shadow-sm transition-transform hover:-translate-y-0.5"
              >
                + New Research Query
              </Link>
              <Link
                href="/documents"
                className="rounded-full border border-[#528172] bg-[#1a4b3f] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#235b4d]"
              >
                Browse Documents
              </Link>
            </div>
          </div>

          {/* Abstract decorative accent */}
          <div className="absolute right-0 top-0 -mt-12 -mr-12 size-64 rounded-full bg-[#537d30]/25 blur-3xl pointer-events-none" />
        </div>

        {/* Quick Launch Cards */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {/* Card 1: Chat */}
          <div className="rounded-2xl border border-[#dfe6dd] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block rounded-lg bg-[#edf5e3] px-2.5 py-1 text-[11px] font-bold text-[#537d30]">
                  Interactive AI
                </span>
                <h3 className="mt-3 text-lg font-bold text-[#153f35]">Evidence Research Chat</h3>
                <p className="mt-1 text-xs text-[#68756e]">
                  Ask clinical efficacy, safety signals, and dosing questions directly to trial PDFs.
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-[#edf5e3] text-xl">
                💬
              </span>
            </div>
            <div className="mt-5 rounded-xl bg-[#f7f8f5] p-3 text-xs text-[#34443c] border border-[#e4eae2]">
              <p className="font-semibold text-[#153f35]">Sample prompt:</p>
              <p className="mt-0.5 text-[11px] italic text-[#52605a]">
                &quot;What adverse events were noted in the Phase 3 trial at Week 12?&quot;
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                href="/chat"
                className="text-xs font-semibold text-[#537d30] hover:text-[#153f35] flex items-center gap-1"
              >
                Launch Research Chat →
              </Link>
            </div>
          </div>

          {/* Card 2: Documents */}
          <div className="rounded-2xl border border-[#dfe6dd] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block rounded-lg bg-[#e7f1f4] px-2.5 py-1 text-[11px] font-bold text-[#356d80]">
                  Study Repository
                </span>
                <h3 className="mt-3 text-lg font-bold text-[#153f35]">Document Library</h3>
                <p className="mt-1 text-xs text-[#68756e]">
                  Manage clinical protocol documents, package inserts, and regulatory files.
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-[#e7f1f4] text-xl">
                📑
              </span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <span className="rounded-lg bg-[#f0f4ec] px-3 py-1.5 text-xs font-semibold text-[#153f35]">
                3 Active Studies
              </span>
              <span className="rounded-lg bg-[#f0f4ec] px-3 py-1.5 text-xs font-semibold text-[#153f35]">
                100% OCR Synced
              </span>
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                href="/documents"
                className="text-xs font-semibold text-[#537d30] hover:text-[#153f35] flex items-center gap-1"
              >
                View Document Library →
              </Link>
            </div>
          </div>
        </div>

        {/* Statistical Overview Metrics */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#dfe6dd] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a867f]">
              Indexed Documents
            </p>
            <p className="mt-2 text-2xl font-bold text-[#153f35]">1,420</p>
            <p className="mt-1 text-[11px] text-[#537d30]">↑ 12 added this week</p>
          </div>

          <div className="rounded-2xl border border-[#dfe6dd] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a867f]">
              Evidence Citations
            </p>
            <p className="mt-2 text-2xl font-bold text-[#153f35]">8,940</p>
            <p className="mt-1 text-[11px] text-[#537d30]">99.4% Verified Precision</p>
          </div>

          <div className="rounded-2xl border border-[#dfe6dd] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a867f]">
              Active Studies
            </p>
            <p className="mt-2 text-2xl font-bold text-[#153f35]">42</p>
            <p className="mt-1 text-[11px] text-[#68756e]">Phase 1 through 4</p>
          </div>

          <div className="rounded-2xl border border-[#dfe6dd] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a867f]">
              Compliance Status
            </p>
            <p className="mt-2 text-2xl font-bold text-[#153f35]">HIPAA / GCP</p>
            <p className="mt-1 text-[11px] text-[#537d30]">Encrypted & Grounded</p>
          </div>
        </div>

        {/* Recent Research Evidence Feed */}
        <div className="mt-8 rounded-2xl border border-[#dfe6dd] bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#eaf0e8]">
            <div>
              <h2 className="text-lg font-bold text-[#153f35]">Recent Research Activity</h2>
              <p className="text-xs text-[#68756e]">
                Every finding is permanently linked with page-accurate document passages.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter questions or trials..."
                className="rounded-xl border border-[#dce5d9] bg-[#fbfcf9] px-3.5 py-1.5 text-xs text-[#18221f] placeholder:text-[#9eaba3] focus:border-[#153f35] focus:outline-none"
              />
            </div>
          </div>

          {/* Table / List */}
          <div className="mt-4 divide-y divide-[#f0f4ec] overflow-x-auto">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#7a867f]">
                No evidence items match your filter.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#fbfcf9] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[#edf5e3] text-xs text-[#537d30] font-bold">
                      ✓
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-[#18221f]">{item.query}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#68756e]">
                        <span className="font-medium text-[#153f35]">{item.drug}</span>
                        <span>•</span>
                        <span>{item.phase}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:self-center pl-10 md:pl-0">
                    <span className="rounded-lg bg-[#f0f4ec] px-2.5 py-1 text-[11px] font-medium text-[#52605a]">
                      📄 {item.source}
                    </span>
                    <span className="rounded-lg bg-[#d7f16f] px-2.5 py-1 text-[11px] font-bold text-[#153f35]">
                      {item.page}
                    </span>
                    <span className="hidden sm:inline-block rounded-full bg-[#edf5e3] px-2.5 py-0.5 text-[10px] font-semibold text-[#537d30]">
                      {item.confidence}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#dde5db] bg-white/70 py-6 px-6 lg:px-10 text-xs text-[#7a867f]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p>PharmaResearch AI • Clinical Trial Intelligence Platform</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-[#153f35]">Home</Link>
            <Link href="/chat" className="hover:text-[#153f35]">Chat</Link>
            <Link href="/documents" className="hover:text-[#153f35]">Documents</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}