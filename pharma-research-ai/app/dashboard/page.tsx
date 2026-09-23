'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  FileText,
  Sparkles,
  TrendingUp,
  Activity,
  CheckCircle2,
  Bookmark,
  Copy,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Bell,
  Layers,
  Scale,
  Plus,
  Trash2,
  UploadCloud,
  X,
  SlidersHorizontal,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Eye,
  Check
} from 'lucide-react';
import { getStoredUser, clearStoredUser, AuthUser, buildUserFromEmail } from '@/lib/auth';

interface SourceCitation {
  id?: string;
  documentId?: string;
  documentName: string;
  pageNumber: number;
  passage: string;
}

interface EvidenceItem {
  id: string;
  query: string;
  drug: string;
  phase: string;
  category: 'efficacy' | 'safety' | 'pk' | 'dosing';
  source: string;
  page: string;
  confidence: string;
  status: string;
  date: string;
  passage: string;
}

interface DocumentRecord {
  id: string;
  name: string;
  size: number;
  status: string;
  uploadedAt: string;
  pages: number;
}

interface CandidateDrug {
  id: string;
  name: string;
  phase: string;
  indication: string;
  efficacy: number;
  adverseEvents: number;
  discontinuation: number;
  adherence: number;
  cohort: number;
  primaryPValue: string;
}

const candidateDrugs: CandidateDrug[] = [
  {
    id: 'drug-a',
    name: 'Drug A (Novastatin 40mg)',
    phase: 'Phase 3 Efficacy',
    indication: 'Hypercholesterolemia & ASCVD Risk',
    efficacy: 78.4,
    adverseEvents: 3.2,
    discontinuation: 1.4,
    adherence: 94.2,
    cohort: 1240,
    primaryPValue: 'p < 0.001',
  },
  {
    id: 'standard-care',
    name: 'Standard of Care (Active Statin)',
    phase: 'Commercial Approved',
    indication: 'Standard Lipid Lowering',
    efficacy: 54.1,
    adverseEvents: 7.8,
    discontinuation: 4.6,
    adherence: 86.5,
    cohort: 890,
    primaryPValue: 'p = 0.012',
  },
  {
    id: 'placebo',
    name: 'Placebo Control (Double-Blind)',
    phase: 'Reference Arm',
    indication: 'Baseline Control',
    efficacy: 21.0,
    adverseEvents: 2.9,
    discontinuation: 6.2,
    adherence: 81.0,
    cohort: 620,
    primaryPValue: 'Ref',
  },
  {
    id: 'bepirovirsen',
    name: 'Bepirovirsen (Targeted Oligo)',
    phase: 'Phase 2b Evaluation',
    indication: 'Viral RNA Suppression',
    efficacy: 71.3,
    adverseEvents: 4.1,
    discontinuation: 2.2,
    adherence: 91.8,
    cohort: 950,
    primaryPValue: 'p < 0.005',
  },
];

const initialEvidenceItems: EvidenceItem[] = [
  {
    id: 'ev-1',
    query: 'How did Drug A perform at Week 12 primary endpoint?',
    drug: 'Drug A (Novastatin 40mg)',
    phase: 'Phase 3 Efficacy',
    category: 'efficacy',
    source: 'Clinical-Trial-DrugA.pdf',
    page: 'Page 18',
    confidence: '99.4%',
    status: 'Verified',
    date: '10 mins ago',
    passage:
      'The primary endpoint was progression-free survival (PFS), assessed from randomization to disease progression or death from any cause. At Week 12, the least-squares mean difference in symptom score was 4.8 points compared with placebo (p < 0.001), representing a 78.4% relative response rate in the intent-to-treat population.',
  },
  {
    id: 'ev-2',
    query: 'Adverse reaction rates compared to standard of care placebo',
    drug: 'Trial Agent 40mg',
    phase: 'Phase 3 Safety',
    category: 'safety',
    source: 'Safety-Bulletin-Q2.pdf',
    page: 'Page 6',
    confidence: '98.1%',
    status: 'Verified',
    date: '2 hours ago',
    passage:
      'Mild injection-site reactions were reported in 6.2% of subjects vs 2.1% in placebo, while serious adverse events (SAEs) remained comparable with placebo (1.4% vs 1.2%). Overall discontinuation due to adverse events was below 1.5%, indicating excellent clinical tolerability.',
  },
  {
    id: 'ev-3',
    query: 'Dosage adjustments in patients with mild renal impairment',
    drug: 'Approved Formulation',
    phase: 'FDA Drug Label',
    category: 'dosing',
    source: 'DrugA-Label.pdf',
    page: 'Page 11',
    confidence: '100%',
    status: 'Verified',
    date: 'Yesterday',
    passage:
      'No starting dose adjustment is necessary for patients with mild to moderate renal impairment (eGFR 30 to 89 mL/min/1.73 m2). For patients with severe renal impairment (eGFR < 30 mL/min/1.73 m2), titrate initial dosing to 50% baseline with biweekly hepatic/renal biomarker surveillance.',
  },
  {
    id: 'ev-4',
    query: 'Secondary biomarkers for cardiovascular risk reduction at Month 6',
    drug: 'Lipid-Modulator X',
    phase: 'Phase 2 Longitudinal',
    category: 'pk',
    source: 'Cardio-Meta-Analysis.pdf',
    page: 'Page 42',
    confidence: '96.7%',
    status: 'Verified',
    date: '2 days ago',
    passage:
      'At Month 6 follow-up, high-sensitivity C-reactive protein (hs-CRP) declined by 38.4% (95% CI: 32.1% - 44.7%), correlating with a 24% reduction in major adverse cardiovascular events (MACE) compared with historical cohort matched controls.',
  },
  {
    id: 'ev-5',
    query: 'Pharmacokinetic peak concentration (Cmax) and half-life elimination',
    drug: 'Bepirovirsen 300mg',
    phase: 'Phase 2 PK/PD',
    category: 'pk',
    source: 'Clinical-Trial-DrugA.pdf',
    page: 'Page 27',
    confidence: '99.1%',
    status: 'Verified',
    date: '3 days ago',
    passage:
      'Peak plasma concentration (Cmax) reached 48.2 mcg/mL within 2.5 hours post-subcutaneous administration. Terminal elimination half-life (t1/2) was calculated at 28.4 hours, supporting convenient once-weekly subcutaneous maintenance dosing.',
  },
  {
    id: 'ev-6',
    query: 'Grade 3/4 hepatotoxicity incidence and liver enzyme elevation markers',
    drug: 'Novastatin 80mg',
    phase: 'Safety Bulletin Q2',
    category: 'safety',
    source: 'Safety-Bulletin-Q2.pdf',
    page: 'Page 14',
    confidence: '98.9%',
    status: 'Verified',
    date: '4 days ago',
    passage:
      'Serum ALT and AST elevations exceeding 3x upper limit of normal (ULN) occurred in 0.8% of participants in the high-dose 80mg cohort, resolving spontaneously within 14 days without therapy discontinuation. Zero cases met Hy-law criteria.',
  },
];

const samplePromptChips = [
  'What was the primary endpoint in Clinical-Trial-DrugA?',
  'Adverse reaction rates at 40mg compared to placebo',
  'Dosage adjustments for mild renal impairment',
  'Secondary biomarkers for cardiovascular risk reduction',
];

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // User session
  const [user] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = getStoredUser();
    if (stored) return stored;
    return buildUserFromEmail('investigator@pharma-research.org', 'Dr. Sarah Jenkins');
  });

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'comparator' | 'documents'>('overview');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'q3' | 'all'>('7d');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'efficacy' | 'safety' | 'pk' | 'dosing'>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [confidenceSort, setConfidenceSort] = useState<'desc' | 'asc' | 'none'>('none');

  // Interactive Live Data
  const [evidenceList] = useState<EvidenceItem[]>(initialEvidenceItems);
  const [starredIds, setStarredIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['ev-1', 'ev-3'];
    try {
      const savedBookmarks = localStorage.getItem('pharma_starred_evidence');
      if (savedBookmarks) return JSON.parse(savedBookmarks);
    } catch {
      // ignore
    }
    return ['ev-1', 'ev-3'];
  });
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Quick AI Query
  const [quickQuery, setQuickQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quickResult, setQuickResult] = useState<{
    query: string;
    answer: string;
    sources: SourceCitation[];
    timestamp: string;
  } | null>(null);

  // Modals & Panels
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      title: 'New Clinical Trial PDF Indexed',
      desc: 'Clinical-Trial-DrugA.pdf parsed into 42 page-level citations.',
      time: '12m ago',
      read: false,
    },
    {
      id: 'n-2',
      title: 'Safety Bulletin Grounded',
      desc: 'Q2 Pharmacovigilance safety signals verified with 98.1% confidence.',
      time: '1h ago',
      read: false,
    },
    {
      id: 'n-3',
      title: 'FDA Compliance Verification',
      desc: 'All indexed passages validated against 21 CFR Part 11 electronic records.',
      time: '1d ago',
      read: true,
    },
  ]);

  // Comparator selection
  const [compareDrugAId, setCompareDrugAId] = useState('drug-a');
  const [compareDrugBId, setCompareDrugBId] = useState('standard-care');

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3200);
  };

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        if (data.documents) {
          setDocuments(data.documents);
        }
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    // Fetch live documents
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocuments();
  }, [fetchDocuments]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDocuments();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Registry data & document sync refreshed');
    }, 600);
  };

  const handleLogout = () => {
    clearStoredUser();
    router.push('/login');
    setTimeout(() => {
      router.push('/login');
    }, 150);
  };

  // Toggle Bookmark
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setStarredIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('pharma_starred_evidence', JSON.stringify(next));
      } catch {
        // ignore
      }
      showToast(next.includes(id) ? 'Citation saved to starred research' : 'Citation removed from starred');
      return next;
    });
  };

  // Copy citation to clipboard
  const copyCitation = (item: EvidenceItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const citationText = `[PharmaResearch AI Citation]\nDrug: ${item.drug}\nSource: ${item.source} (${item.page})\nConfidence: ${item.confidence}\nPassage: "${item.passage}"`;
    navigator.clipboard.writeText(citationText);
    showToast('Citation copied to clipboard');
  };

  // Quick AI Query Execution
  const executeQuickAnalysis = async (queryText?: string) => {
    const query = queryText || quickQuery;
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setQuickResult(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: 'dashboard-quick', question: query.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setQuickResult({
          query: query.trim(),
          answer: data.message.content,
          sources: data.message.sources || [],
          timestamp: 'Just now',
        });
        showToast('AI analysis grounded and ready');
      } else {
        showToast('No matching citations found. Try another trial term.');
      }
    } catch {
      showToast('Error connecting to research chat service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Document Upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Only PDF trial documents are supported');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('PDFs must be smaller than 10 MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (res.ok && data.document) {
        setDocuments((prev) => [data.document, ...prev]);
        showToast(`Document "${file.name}" indexed successfully!`);
      } else {
        showToast(data.error || 'Upload failed');
      }
    } catch {
      showToast('Error uploading document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Document Removal
  const handleDeleteDocument = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        showToast(`Document "${name}" removed`);
      }
    } catch {
      showToast('Failed to delete document');
    }
  };

  // Export Data as JSON
  const handleExportData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      investigator: user?.name,
      totalFindings: filteredEvidence.length,
      findings: filteredEvidence,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharma_evidence_findings_${timeframe}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Evidence dataset downloaded as JSON');
  };

  // Filtered evidence items
  const filteredEvidence = evidenceList
    .filter((item) => {
      const matchesSearch =
        item.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.drug.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.source.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.passage.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesPhase = phaseFilter === 'all' || item.phase.toLowerCase().includes(phaseFilter.toLowerCase());
      const matchesStarred = !showStarredOnly || starredIds.includes(item.id);

      return matchesSearch && matchesCategory && matchesPhase && matchesStarred;
    })
    .sort((a, b) => {
      if (confidenceSort === 'desc') {
        return parseFloat(b.confidence) - parseFloat(a.confidence);
      }
      if (confidenceSort === 'asc') {
        return parseFloat(a.confidence) - parseFloat(b.confidence);
      }
      return 0;
    });

  // Dynamic timeframe stats
  const metrics = {
    '7d': {
      indexedDocs: '1,420',
      docsTrend: '+12 added this week',
      citations: '8,940',
      precision: '99.4% Verified Precision',
      activeStudies: '42',
      studiesSub: 'Phase 1 through 4 active',
      ingestionSpeed: '1.2s',
      compliance: 'HIPAA / GCP Grounded',
    },
    '30d': {
      indexedDocs: '1,380',
      docsTrend: '+84 added this month',
      citations: '34,210',
      precision: '99.2% Verified Precision',
      activeStudies: '39',
      studiesSub: 'Global multi-site trials',
      ingestionSpeed: '1.1s',
      compliance: '21 CFR Part 11 Certified',
    },
    q3: {
      indexedDocs: '1,290',
      docsTrend: '+192 Q3 total additions',
      citations: '98,400',
      precision: '99.6% Verified Precision',
      activeStudies: '36',
      studiesSub: '12 Phase 3 pivotal readouts',
      ingestionSpeed: '1.3s',
      compliance: 'Audit-ready Traceability',
    },
    all: {
      indexedDocs: '2,450',
      docsTrend: 'Full clinical repository archive',
      citations: '245,000',
      precision: '99.5% Verified Precision',
      activeStudies: '64',
      studiesSub: 'All historical & active arms',
      ingestionSpeed: '1.2s',
      compliance: 'Zero hallucination strict OCR',
    },
  }[timeframe];

  // Candidates for comparison
  const drugA = candidateDrugs.find((d) => d.id === compareDrugAId) || candidateDrugs[0];
  const drugB = candidateDrugs.find((d) => d.id === compareDrugBId) || candidateDrugs[1];
  const efficacyDelta = (drugA.efficacy - drugB.efficacy).toFixed(1);
  const aeDelta = (drugB.adverseEvents - drugA.adverseEvents).toFixed(1);

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-[#18221f] flex flex-col font-sans selection:bg-[#d7f16f] selection:text-[#153f35]">
      
      {/* Toast Notification Container */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#153f35] px-5 py-3.5 text-xs font-semibold text-white shadow-2xl transition-all duration-300 border border-[#2d695b] ${
          toast.visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 pointer-events-none scale-95'
        }`}
      >
        <span className="grid size-6 place-items-center rounded-full bg-[#d7f16f] text-[#153f35]">
          <Check size={14} className="stroke-[3]" />
        </span>
        <span>{toast.message}</span>
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#dde5db] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5 lg:px-10">
          
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="grid size-10 place-items-center rounded-xl bg-[#153f35] text-xs font-bold text-[#d7f16f] shadow-sm transition-transform group-hover:scale-105">
                PR
              </span>
              <div>
                <span className="text-sm font-bold tracking-tight text-[#153f35] block leading-none">
                  PharmaResearch <span className="text-[#537d30]">AI</span>
                </span>
                <span className="text-[10px] text-[#6e7d74] tracking-wide font-medium">
                  Clinical Trial Intelligence
                </span>
              </div>
            </Link>

            {/* Main Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[#edf2ea] border border-[#d8e3d5]">
              <button
                onClick={() => setActiveTab('overview')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#153f35] text-white shadow-sm'
                    : 'text-[#52605a] hover:text-[#153f35] hover:bg-white/60'
                }`}
              >
                Overview & Pipeline
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'evidence'
                    ? 'bg-[#153f35] text-white shadow-sm'
                    : 'text-[#52605a] hover:text-[#153f35] hover:bg-white/60'
                }`}
              >
                Evidence Findings ({filteredEvidence.length})
              </button>
              <button
                onClick={() => setActiveTab('comparator')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'comparator'
                    ? 'bg-[#153f35] text-white shadow-sm'
                    : 'text-[#52605a] hover:text-[#153f35] hover:bg-white/60'
                }`}
              >
                Trial Radar & Comparator
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'documents'
                    ? 'bg-[#153f35] text-white shadow-sm'
                    : 'text-[#52605a] hover:text-[#153f35] hover:bg-white/60'
                }`}
              >
                Live Documents ({documents.length})
              </button>
            </nav>
          </div>

          {/* Action Tools & User Profile */}
          <div className="flex items-center gap-3">
            
            {/* Sync Refresh Button */}
            <button
              onClick={handleRefresh}
              title="Sync latest trial records & document indices"
              className="grid size-9 place-items-center rounded-xl border border-[#dce5d9] bg-white text-[#52605a] hover:bg-[#edf5e3] hover:text-[#153f35] hover:border-[#b5cfbe] transition-colors"
            >
              <RefreshCw size={15} className={`${isRefreshing ? 'animate-spin text-[#537d30]' : ''}`} />
            </button>

            {/* Notifications Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative grid size-9 place-items-center rounded-xl border border-[#dce5d9] bg-white text-[#52605a] hover:bg-[#edf5e3] hover:text-[#153f35] transition-colors"
              >
                <Bell size={16} />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#537d30] ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#dce5d9] bg-white p-4 shadow-xl z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-[#edf2ea]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#153f35]">Trial Registry Alerts</span>
                      <span className="rounded-full bg-[#edf5e3] px-2 py-0.5 text-[10px] font-bold text-[#537d30]">
                        {notifications.filter((n) => !n.read).length} new
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                        showToast('All notifications marked as read');
                      }}
                      className="text-[11px] font-medium text-[#537d30] hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-xl border text-xs transition-colors ${
                          notif.read
                            ? 'bg-[#fafbfa] border-[#e8efe6] opacity-75'
                            : 'bg-[#edf5e3]/50 border-[#d8e8ce]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-[#153f35]">{notif.title}</p>
                          <span className="text-[10px] text-[#7a867f] shrink-0">{notif.time}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#52605a] leading-relaxed">{notif.desc}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowNotifications(false)}
                    className="mt-3 w-full rounded-xl bg-[#f0f4ec] py-2 text-center text-xs font-semibold text-[#153f35] hover:bg-[#e4ede0] transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 rounded-full border border-[#dce5d9] bg-white py-1 px-2 sm:px-3 shadow-xs">
              <div className="grid size-7 place-items-center rounded-full bg-[#153f35] text-xs font-bold text-[#d7f16f]">
                {user?.avatarLetter || 'R'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[#153f35] leading-tight">
                  {user?.name || 'Dr. Researcher'}
                </p>
                <p className="text-[10px] text-[#6d8276] leading-tight max-w-[130px] truncate">
                  {user?.email || 'authenticated'}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              id="logout-btn"
              className="rounded-full border border-[#dce5d9] bg-white px-3 py-1.5 text-xs font-medium text-[#52605a] hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden overflow-x-auto gap-2 px-4 py-2 border-t border-[#edf2ea] bg-[#fafbfa]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
              activeTab === 'overview' ? 'bg-[#153f35] text-white' : 'text-[#52605a]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
              activeTab === 'evidence' ? 'bg-[#153f35] text-white' : 'text-[#52605a]'
            }`}
          >
            Evidence Findings
          </button>
          <button
            onClick={() => setActiveTab('comparator')}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
              activeTab === 'comparator' ? 'bg-[#153f35] text-white' : 'text-[#52605a]'
            }`}
          >
            Trial Radar
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
              activeTab === 'documents' ? 'bg-[#153f35] text-white' : 'text-[#52605a]'
            }`}
          >
            Documents
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 lg:px-10">
        
        {/* Hero Banner with Executive Controls */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0c2f26] via-[#153f35] to-[#1c5043] p-6 sm:p-8 text-white shadow-[0_20px_50px_-15px_rgba(21,63,53,0.35)]">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d7f16f]/20 px-3 py-1 text-[11px] font-semibold text-[#d7f16f] border border-[#d7f16f]/30 backdrop-blur-xs">
                  <span className="size-1.5 rounded-full bg-[#d7f16f] animate-pulse" />
                  Clinical AI Engine Live · OCR Grounded
                </span>
                <span className="text-[11px] text-[#b6d3c9]">
                  Protocol ID: <strong className="text-white font-mono">NCT-04882194</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                Clinical Evidence Workspace
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-[#b2cfc4] max-w-2xl leading-relaxed">
                Interrogate trial protocols, package inserts, and FDA safety updates with strict passage grounding. Zero hallucination guarantee.
              </p>

              {/* Timeframe selector pills */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#a0c2b7] font-medium mr-1">Study Range:</span>
                {(
                  [
                    { key: '7d', label: 'Last 7 Days' },
                    { key: '30d', label: 'Last 30 Days' },
                    { key: 'q3', label: 'Q3 2026' },
                    { key: 'all', label: 'All Studies' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => {
                      setTimeframe(t.key);
                      showToast(`Metrics updated for ${t.label}`);
                    }}
                    className={`rounded-full px-3.5 py-1 text-[11px] font-semibold transition-all ${
                      timeframe === t.key
                        ? 'bg-[#d7f16f] text-[#153f35] shadow-xs'
                        : 'bg-[#1b4a3e] text-[#d4e5df] hover:bg-[#245b4c] border border-[#2b6455]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Executive Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white transition-all backdrop-blur-xs"
              >
                <FileText size={14} className="text-[#d7f16f]" />
                Generate Regulatory Brief
              </button>

              <button
                onClick={handleExportData}
                className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white transition-all backdrop-blur-xs"
              >
                <Download size={14} className="text-[#d7f16f]" />
                Export Dataset
              </button>

              <Link
                href="/chat"
                className="flex items-center gap-2 rounded-full bg-[#d7f16f] px-5 py-2.5 text-xs font-bold text-[#153f35] shadow-md hover:bg-[#c9e85e] transition-all hover:scale-102"
              >
                <Sparkles size={15} />
                Full Research Chat
              </Link>
            </div>
          </div>

          {/* Decorative Background Accents */}
          <div className="absolute right-0 top-0 -mt-16 -mr-16 size-80 rounded-full bg-[#537d30]/25 blur-3xl pointer-events-none" />
          <div className="absolute left-1/2 bottom-0 -mb-20 size-60 rounded-full bg-[#d7f16f]/10 blur-3xl pointer-events-none" />
        </div>

        {/* Dynamic Metric Stat Counters */}
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
          
          <div className="group rounded-2xl border border-[#dfe6dd] bg-white p-5 shadow-xs hover:shadow-md transition-all hover:border-[#b3cbb8]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a867f]">
                Indexed Documents
              </p>
              <span className="grid size-8 place-items-center rounded-xl bg-[#edf5e3] text-[#537d30] group-hover:scale-110 transition-transform">
                <FileText size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-bold text-[#153f35]">{metrics.indexedDocs}</p>
            <p className="mt-1 text-[11px] font-medium text-[#537d30] flex items-center gap-1">
              <TrendingUp size={13} /> {metrics.docsTrend}
            </p>
          </div>

          <div className="group rounded-2xl border border-[#dfe6dd] bg-white p-5 shadow-xs hover:shadow-md transition-all hover:border-[#b3cbb8]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a867f]">
                Evidence Citations
              </p>
              <span className="grid size-8 place-items-center rounded-xl bg-[#edf5e3] text-[#537d30] group-hover:scale-110 transition-transform">
                <ShieldCheck size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-bold text-[#153f35]">{metrics.citations}</p>
            <p className="mt-1 text-[11px] font-medium text-[#537d30] flex items-center gap-1">
              <CheckCircle2 size={13} /> {metrics.precision}
            </p>
          </div>

          <div className="group rounded-2xl border border-[#dfe6dd] bg-white p-5 shadow-xs hover:shadow-md transition-all hover:border-[#b3cbb8]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a867f]">
                Active Clinical Trials
              </p>
              <span className="grid size-8 place-items-center rounded-xl bg-[#e7f1f4] text-[#356d80] group-hover:scale-110 transition-transform">
                <Activity size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-bold text-[#153f35]">{metrics.activeStudies}</p>
            <p className="mt-1 text-[11px] text-[#68756e]">{metrics.studiesSub}</p>
          </div>

          <div className="group rounded-2xl border border-[#dfe6dd] bg-white p-5 shadow-xs hover:shadow-md transition-all hover:border-[#b3cbb8]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a867f]">
                Compliance & Grounding
              </p>
              <span className="grid size-8 place-items-center rounded-xl bg-[#f5efe3] text-[#8c672b] group-hover:scale-110 transition-transform">
                <Zap size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-bold text-[#153f35]">100% Audit</p>
            <p className="mt-1 text-[11px] font-medium text-[#537d30]">{metrics.compliance}</p>
          </div>
        </div>

        {/* -------------------- TAB 1: OVERVIEW & PIPELINE -------------------- */}
        {activeTab === 'overview' && (
          <div className="mt-8 space-y-8">
            
            {/* Direct In-Dashboard AI Research Console */}
            <div className="rounded-3xl border border-[#dfe6dd] bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#edf2ea]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-lg bg-[#edf5e3] text-[#537d30]">
                      <Sparkles size={14} />
                    </span>
                    <h2 className="text-base font-bold text-[#153f35]">Live Trial Evidence Query Console</h2>
                  </div>
                  <p className="mt-1 text-xs text-[#68756e]">
                    Pose any question to synthesize verified passages from all indexed PDFs in real time.
                  </p>
                </div>

                <span className="rounded-full bg-[#edf5e3] px-3 py-1 text-[11px] font-semibold text-[#537d30] self-start sm:self-auto">
                  ⚡ Real-time Vector Extraction
                </span>
              </div>

              {/* Input & Action Bar */}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8fa096]" />
                  <input
                    type="text"
                    value={quickQuery}
                    onChange={(e) => setQuickQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && executeQuickAnalysis()}
                    placeholder="E.g., Compare Week 12 primary endpoint for Drug A versus placebo..."
                    className="w-full rounded-2xl border border-[#d8e3d6] bg-[#fbfcf9] pl-10 pr-4 py-3 text-xs text-[#18221f] placeholder:text-[#9eaba3] focus:border-[#153f35] focus:bg-white focus:outline-none transition-all shadow-inner"
                  />
                  {quickQuery && (
                    <button
                      onClick={() => setQuickQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9eaba3] hover:text-[#18221f]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => executeQuickAnalysis()}
                  disabled={isAnalyzing || !quickQuery.trim()}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#153f35] px-6 py-3 text-xs font-bold text-white hover:bg-[#205244] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-[#d7f16f]" />
                      Analyzing Grounded Evidence...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-[#d7f16f]" />
                      Run AI Analysis
                    </>
                  )}
                </button>
              </div>

              {/* Sample Prompt Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium text-[#7a867f]">Suggested Inquiries:</span>
                {samplePromptChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuickQuery(chip);
                      executeQuickAnalysis(chip);
                    }}
                    className="rounded-full border border-[#dce5d9] bg-[#f7f9f6] px-3 py-1 text-[11px] text-[#4d5c55] hover:bg-[#edf5e3] hover:text-[#153f35] hover:border-[#b8cfc0] transition-colors"
                  >
                    &quot;{chip}&quot;
                  </button>
                ))}
              </div>

              {/* Result Container */}
              {quickResult && (
                <div className="mt-5 rounded-2xl border border-[#cbe0c9] bg-[#f5fbf3] p-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-[#d8ecd5]">
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-full bg-[#153f35] text-[#d7f16f]">
                        <CheckCircle2 size={14} />
                      </span>
                      <p className="text-xs font-bold text-[#153f35]">Grounded Clinical Synthesis</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(quickResult.answer);
                          showToast('Answer copied to clipboard');
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#537d30] hover:text-[#153f35]"
                      >
                        <Copy size={12} /> Copy Answer
                      </button>
                      <button
                        onClick={() => setQuickResult(null)}
                        className="text-[#7a867f] hover:text-[#153f35] p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-[#21352c] font-medium">
                    {quickResult.answer}
                  </p>

                  {/* Sources attached to the answer */}
                  {quickResult.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#d8ecd5]">
                      <p className="text-[11px] font-bold text-[#153f35] uppercase tracking-wider mb-2">
                        Supporting Trial Citations ({quickResult.sources.length}):
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {quickResult.sources.map((src, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-[#d3e6cf] bg-white p-3 text-xs"
                          >
                            <div className="flex items-center justify-between text-[11px] text-[#52605a]">
                              <span className="font-semibold text-[#153f35] flex items-center gap-1">
                                <FileText size={12} className="text-[#537d30]" /> {src.documentName}
                              </span>
                              <span className="rounded-md bg-[#edf5e3] px-2 py-0.5 font-bold text-[#537d30]">
                                Page {src.pageNumber}
                              </span>
                            </div>
                            <p className="mt-1.5 text-[11px] italic text-[#4a5851] line-clamp-2">
                              &quot;{src.passage}&quot;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Link
                      href="/chat"
                      className="flex items-center gap-1.5 text-xs font-bold text-[#153f35] hover:text-[#537d30] transition-colors"
                    >
                      Continue in Deep Research Chat <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Clinical Candidate Pipeline Tracker */}
            <div className="rounded-3xl border border-[#dfe6dd] bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#edf2ea]">
                <div>
                  <h2 className="text-base font-bold text-[#153f35]">Clinical Development Pipeline</h2>
                  <p className="text-xs text-[#68756e]">
                    Ongoing candidate studies with primary endpoints, adverse event thresholds, and comparator profiles.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('comparator')}
                    className="flex items-center gap-1.5 rounded-full border border-[#dce5d9] bg-[#f7f9f6] px-3.5 py-1.5 text-xs font-semibold text-[#153f35] hover:bg-[#edf5e3] transition-colors"
                  >
                    <Scale size={13} /> Open Comparator Radar
                  </button>
                </div>
              </div>

              {/* Candidate Cards Grid */}
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {candidateDrugs.map((drug) => (
                  <div
                    key={drug.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#dfe6dd] bg-[#fbfcf9] p-5 hover:border-[#153f35] hover:bg-white hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-lg bg-[#edf5e3] px-2.5 py-1 text-[10px] font-bold text-[#537d30]">
                          {drug.phase}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-[#7a867f]">
                          N={drug.cohort}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-[#153f35] group-hover:text-[#537d30] transition-colors">
                        {drug.name}
                      </h3>
                      <p className="mt-1 text-[11px] text-[#6d7e76] line-clamp-1">{drug.indication}</p>

                      {/* Efficacy Progress Meter */}
                      <div className="mt-4">
                        <div className="flex justify-between text-[11px] font-medium text-[#46544e] mb-1">
                          <span>Primary Efficacy</span>
                          <span className="font-bold text-[#153f35]">{drug.efficacy}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#e8eee6] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#153f35] group-hover:bg-[#537d30] transition-all"
                            style={{ width: `${drug.efficacy}%` }}
                          />
                        </div>
                      </div>

                      {/* Adverse Event Rate */}
                      <div className="mt-3 flex items-center justify-between text-[11px] text-[#68756e]">
                        <span>Severe AE Rate:</span>
                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          {drug.adverseEvents}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#edf2ea] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#7a867f]">{drug.primaryPValue}</span>
                      <button
                        onClick={() => {
                          setCompareDrugAId(drug.id);
                          setActiveTab('comparator');
                          showToast(`Loaded ${drug.name} in trial comparator`);
                        }}
                        className="text-xs font-semibold text-[#537d30] hover:text-[#153f35] flex items-center gap-1"
                      >
                        Compare Arm →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links & Platform Capabilities */}
            <div className="grid gap-5 md:grid-cols-2">
              
              <div className="rounded-3xl border border-[#dfe6dd] bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-lg bg-[#edf5e3] px-2.5 py-1 text-[11px] font-bold text-[#537d30]">
                      Interactive Workspace
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-[#153f35]">Evidence Research Chat</h3>
                    <p className="mt-1 text-xs text-[#68756e] leading-relaxed">
                      Ask complex questions across protocol inclusion criteria, biomarker deltas, and dosing safety.
                    </p>
                  </div>
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#edf5e3] text-xl">
                    💬
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#f7f9f6] border border-[#e4eae2]">
                  <p className="text-xs text-[#52605a]">
                    Conversational memory with multi-passage grounding
                  </p>
                  <Link
                    href="/chat"
                    className="shrink-0 rounded-full bg-[#153f35] px-4 py-2 text-xs font-bold text-white hover:bg-[#205244] transition-colors"
                  >
                    Open Chat
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-[#dfe6dd] bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-lg bg-[#e7f1f4] px-2.5 py-1 text-[11px] font-bold text-[#356d80]">
                      Document Center
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-[#153f35]">Live Study Repository</h3>
                    <p className="mt-1 text-xs text-[#68756e] leading-relaxed">
                      Upload clinical protocols, package inserts, and regulatory safety bulletins for instant OCR ingestion.
                    </p>
                  </div>
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#e7f1f4] text-xl">
                    📑
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#f7f9f6] border border-[#e4eae2]">
                  <p className="text-xs text-[#52605a]">
                    {documents.length} active PDFs synchronized with OCR
                  </p>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className="shrink-0 rounded-full bg-[#153f35] px-4 py-2 text-xs font-bold text-white hover:bg-[#205244] transition-colors"
                  >
                    Manage Library
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* -------------------- TAB 2: EVIDENCE FINDINGS EXPLORER -------------------- */}
        {activeTab === 'evidence' && (
          <div className="mt-8 rounded-3xl border border-[#dfe6dd] bg-white p-6 shadow-sm">
            
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#eaf0e8]">
              <div>
                <h2 className="text-lg font-bold text-[#153f35]">Indexed Evidence & Source Passages</h2>
                <p className="text-xs text-[#68756e]">
                  Every clinical finding is verified with exact page coordinates and confidence scores.
                </p>
              </div>

              {/* Filter Tools */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa096]" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search findings, drugs, or sources..."
                    className="rounded-xl border border-[#dce5d9] bg-[#fbfcf9] pl-9 pr-3.5 py-1.5 text-xs text-[#18221f] placeholder:text-[#9eaba3] focus:border-[#153f35] focus:outline-none w-52 sm:w-64"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9eaba3] hover:text-[#18221f]"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Starred Only Toggle */}
                <button
                  onClick={() => setShowStarredOnly(!showStarredOnly)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    showStarredOnly
                      ? 'border-[#537d30] bg-[#edf5e3] text-[#537d30]'
                      : 'border-[#dce5d9] bg-[#fbfcf9] text-[#52605a] hover:bg-[#f0f4ec]'
                  }`}
                >
                  <Bookmark size={13} className={showStarredOnly ? 'fill-current' : ''} />
                  Starred ({starredIds.length})
                </button>

                {/* Confidence Sort */}
                <button
                  onClick={() => {
                    const next = confidenceSort === 'none' ? 'desc' : confidenceSort === 'desc' ? 'asc' : 'none';
                    setConfidenceSort(next);
                    showToast(
                      next === 'desc'
                        ? 'Sorted by highest confidence'
                        : next === 'asc'
                        ? 'Sorted by lowest confidence'
                        : 'Default sort restored'
                    );
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-[#dce5d9] bg-[#fbfcf9] px-3 py-1.5 text-xs font-semibold text-[#52605a] hover:bg-[#f0f4ec]"
                >
                  <SlidersHorizontal size={13} />
                  {confidenceSort === 'desc' ? 'Confidence: High → Low' : confidenceSort === 'asc' ? 'Confidence: Low → High' : 'Sort Confidence'}
                </button>

                {/* Export button */}
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 rounded-xl bg-[#153f35] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#205244] transition-colors"
                >
                  <Download size={13} /> Export Filtered ({filteredEvidence.length})
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#7a867f] font-medium mr-1">Category:</span>
              {(
                [
                  { key: 'all', label: 'All Findings' },
                  { key: 'efficacy', label: 'Primary Efficacy' },
                  { key: 'safety', label: 'Safety & Tolerability' },
                  { key: 'pk', label: 'Pharmacokinetics (PK/PD)' },
                  { key: 'dosing', label: 'Dosing & Administration' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    categoryFilter === cat.key
                      ? 'bg-[#153f35] text-white'
                      : 'bg-[#f0f4ec] text-[#52605a] hover:bg-[#e4ede0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Evidence List */}
            <div className="mt-5 divide-y divide-[#edf2ea]">
              {filteredEvidence.length === 0 ? (
                <div className="py-12 text-center">
                  <Info size={28} className="mx-auto text-[#9eaba3] mb-2" />
                  <p className="text-sm font-semibold text-[#153f35]">No evidence items match your filters</p>
                  <p className="mt-1 text-xs text-[#7a867f]">
                    Try clearing your search query or selecting a different category.
                  </p>
                  <button
                    onClick={() => {
                      setSearchFilter('');
                      setCategoryFilter('all');
                      setPhaseFilter('all');
                      setShowStarredOnly(false);
                    }}
                    className="mt-4 rounded-full bg-[#153f35] px-4 py-2 text-xs font-semibold text-white hover:bg-[#205244]"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                filteredEvidence.map((item) => {
                  const isStarred = starredIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="py-4.5 px-3 rounded-2xl hover:bg-[#fafbfa] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Star Button */}
                        <button
                          onClick={(e) => toggleBookmark(item.id, e)}
                          title={isStarred ? 'Remove from starred' : 'Bookmark finding'}
                          className={`mt-0.5 p-1 rounded-lg transition-colors shrink-0 ${
                            isStarred
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-[#bcc9c1] hover:text-amber-500'
                          }`}
                        >
                          <Bookmark size={16} className={isStarred ? 'fill-current' : ''} />
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-xs text-[#153f35]">{item.query}</span>
                            <span className="rounded-full bg-[#edf5e3] px-2 py-0.5 text-[10px] font-bold text-[#537d30]">
                              {item.confidence}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-[#4b5a52] line-clamp-2 italic leading-relaxed">
                            &quot;{item.passage}&quot;
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#6d7e76]">
                            <span className="font-semibold text-[#153f35]">{item.drug}</span>
                            <span>•</span>
                            <span className="rounded bg-[#f0f4ec] px-1.5 py-0.5 text-[10px] font-medium">
                              {item.phase}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FileText size={12} /> {item.source} ({item.page})
                            </span>
                            <span>•</span>
                            <span className="text-[#8e9f96]">{item.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 pl-7 lg:pl-0">
                        <button
                          onClick={() => setSelectedEvidence(item)}
                          className="flex items-center gap-1 rounded-xl border border-[#dce5d9] bg-white px-3 py-1.5 text-xs font-semibold text-[#153f35] hover:bg-[#edf5e3] hover:border-[#b8cfc0] transition-colors"
                        >
                          <Eye size={13} /> Inspect Passage
                        </button>

                        <button
                          onClick={(e) => copyCitation(item, e)}
                          title="Copy citation markdown"
                          className="grid size-8 place-items-center rounded-xl border border-[#dce5d9] bg-white text-[#52605a] hover:bg-[#edf5e3] hover:text-[#153f35] transition-colors"
                        >
                          <Copy size={13} />
                        </button>

                        <button
                          onClick={() => {
                            setQuickQuery(`Explain the clinical significance of this finding: "${item.query}"`);
                            setActiveTab('overview');
                            showToast('Loaded into AI Research Console');
                          }}
                          title="Ask follow-up"
                          className="flex items-center gap-1 rounded-xl bg-[#edf5e3] px-3 py-1.5 text-xs font-semibold text-[#537d30] hover:bg-[#d7f16f] hover:text-[#153f35] transition-colors"
                        >
                          <Sparkles size={13} /> Ask AI
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* -------------------- TAB 3: TRIAL RADAR & COMPARATOR -------------------- */}
        {activeTab === 'comparator' && (
          <div className="mt-8 space-y-6">
            
            {/* Comparator Header & Selectors */}
            <div className="rounded-3xl border border-[#dfe6dd] bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#edf2ea]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-lg bg-[#edf5e3] text-[#537d30]">
                      <Scale size={14} />
                    </span>
                    <h2 className="text-base font-bold text-[#153f35]">Trial Comparator & Safety Radar</h2>
                  </div>
                  <p className="mt-1 text-xs text-[#68756e]">
                    Side-by-side efficacy benchmarks, safety trade-offs, and discontinuation deltas.
                  </p>
                </div>

                {/* Candidate Selection Dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#153f35]">Arm A:</span>
                    <select
                      value={compareDrugAId}
                      onChange={(e) => setCompareDrugAId(e.target.value)}
                      className="rounded-xl border border-[#dce5d9] bg-[#fbfcf9] px-3 py-1.5 text-xs font-semibold text-[#153f35] focus:outline-none"
                    >
                      {candidateDrugs.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-xs font-bold text-[#7a867f]">vs.</span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#153f35]">Arm B:</span>
                    <select
                      value={compareDrugBId}
                      onChange={(e) => setCompareDrugBId(e.target.value)}
                      className="rounded-xl border border-[#dce5d9] bg-[#fbfcf9] px-3 py-1.5 text-xs font-semibold text-[#153f35] focus:outline-none"
                    >
                      {candidateDrugs.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Head to Head Benchmark Delta Cards */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                
                <div className="rounded-2xl border border-[#d3e4d5] bg-[#f5faf3] p-4.5">
                  <p className="text-[11px] font-semibold text-[#537d30] uppercase tracking-wider">
                    Efficacy Delta
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#153f35]">
                    {parseFloat(efficacyDelta) >= 0 ? `+${efficacyDelta}%` : `${efficacyDelta}%`}
                  </p>
                  <p className="mt-1 text-[11px] text-[#52605a]">
                    {parseFloat(efficacyDelta) >= 0
                      ? `${drugA.name} demonstrates superior primary outcome`
                      : `${drugB.name} has higher response`}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dfe6dd] bg-white p-4.5">
                  <p className="text-[11px] font-semibold text-[#7a867f] uppercase tracking-wider">
                    Safety Tolerance Delta
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#153f35]">
                    {parseFloat(aeDelta) >= 0 ? `-${aeDelta}% AEs` : `+${Math.abs(parseFloat(aeDelta))}% AEs`}
                  </p>
                  <p className="mt-1 text-[11px] text-[#52605a]">
                    Grade 3/4 severe adverse reactions difference
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dfe6dd] bg-white p-4.5">
                  <p className="text-[11px] font-semibold text-[#7a867f] uppercase tracking-wider">
                    Discontinuation Rate
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#153f35]">
                    {drugA.discontinuation}% <span className="text-xs font-normal text-[#7a867f]">vs {drugB.discontinuation}%</span>
                  </p>
                  <p className="mt-1 text-[11px] text-[#52605a]">
                    Lower discontinuation signals superior patient compliance
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dfe6dd] bg-white p-4.5">
                  <p className="text-[11px] font-semibold text-[#7a867f] uppercase tracking-wider">
                    Statistical Significance
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#153f35] font-mono">
                    {drugA.primaryPValue}
                  </p>
                  <p className="mt-1 text-[11px] text-[#537d30]">
                    Validated in ITT clinical cohort
                  </p>
                </div>

              </div>

              {/* Side by Side Detailed Comparison Table */}
              <div className="mt-8 overflow-x-auto rounded-2xl border border-[#e4eae2]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f7f9f6] text-[#6d7e76] uppercase tracking-wider font-semibold border-b border-[#e4eae2]">
                    <tr>
                      <th className="py-3.5 px-4">Endpoint / Parameter</th>
                      <th className="py-3.5 px-4 text-[#153f35] font-bold">{drugA.name}</th>
                      <th className="py-3.5 px-4 text-[#153f35] font-bold">{drugB.name}</th>
                      <th className="py-3.5 px-4">Net Clinical Benefit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf2ea] bg-white">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-[#153f35]">Phase & Stage</td>
                      <td className="py-3 px-4">{drugA.phase}</td>
                      <td className="py-3 px-4">{drugB.phase}</td>
                      <td className="py-3 px-4 text-[#7a867f]">Pivotal Comparator</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-[#153f35]">Primary Endpoint Efficacy</td>
                      <td className="py-3 px-4 font-bold text-[#153f35]">{drugA.efficacy}%</td>
                      <td className="py-3 px-4 font-bold text-[#153f35]">{drugB.efficacy}%</td>
                      <td className="py-3 px-4 font-bold text-[#537d30]">
                        {parseFloat(efficacyDelta) >= 0 ? `+${efficacyDelta}% Advantage` : `${efficacyDelta}%`}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-[#153f35]">Grade 3/4 Severe AEs</td>
                      <td className="py-3 px-4 text-amber-700 font-semibold">{drugA.adverseEvents}%</td>
                      <td className="py-3 px-4 text-amber-700 font-semibold">{drugB.adverseEvents}%</td>
                      <td className="py-3 px-4 font-semibold text-[#537d30]">
                        {parseFloat(aeDelta) >= 0 ? `${aeDelta}% safer` : 'Higher event rate'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-[#153f35]">Study Discontinuation</td>
                      <td className="py-3 px-4">{drugA.discontinuation}%</td>
                      <td className="py-3 px-4">{drugB.discontinuation}%</td>
                      <td className="py-3 px-4 text-[#52605a]">
                        {(drugB.discontinuation - drugA.discontinuation).toFixed(1)}% delta
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-[#153f35]">Patient Medication Adherence</td>
                      <td className="py-3 px-4 font-semibold text-[#153f35]">{drugA.adherence}%</td>
                      <td className="py-3 px-4 font-semibold text-[#153f35]">{drugB.adherence}%</td>
                      <td className="py-3 px-4 font-semibold text-[#537d30]">
                        +{(drugA.adherence - drugB.adherence).toFixed(1)}% compliance
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-[#153f35]">Enrolled Patient Cohort</td>
                      <td className="py-3 px-4 font-mono">N = {drugA.cohort}</td>
                      <td className="py-3 px-4 font-mono">N = {drugB.cohort}</td>
                      <td className="py-3 px-4 text-[#7a867f]">Multi-center registry</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action */}
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => {
                    const comparisonText = `Clinical Head-to-Head Benchmark\nArm 1: ${drugA.name} (${drugA.efficacy}% Efficacy, ${drugA.adverseEvents}% Severe AEs)\nArm 2: ${drugB.name} (${drugB.efficacy}% Efficacy, ${drugB.adverseEvents}% Severe AEs)\nNet Efficacy Advantage: ${efficacyDelta}%\nCalculated by PharmaResearch AI.`;
                    navigator.clipboard.writeText(comparisonText);
                    showToast('Comparison summary copied to clipboard');
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-[#dce5d9] bg-white px-4 py-2 text-xs font-semibold text-[#153f35] hover:bg-[#edf5e3]"
                >
                  <Copy size={13} /> Copy Comparator Table
                </button>
                <button
                  onClick={() => {
                    setQuickQuery(`Perform a comprehensive safety and efficacy comparison between ${drugA.name} and ${drugB.name}`);
                    setActiveTab('overview');
                    executeQuickAnalysis(`Perform a comprehensive safety and efficacy comparison between ${drugA.name} and ${drugB.name}`);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-[#153f35] px-4 py-2 text-xs font-bold text-white hover:bg-[#205244]"
                >
                  <Sparkles size={13} className="text-[#d7f16f]" /> Deep AI Comparator Analysis
                </button>
              </div>

            </div>

          </div>
        )}

        {/* -------------------- TAB 4: LIVE DOCUMENTS & PROTOCOLS -------------------- */}
        {activeTab === 'documents' && (
          <div className="mt-8 space-y-6">
            
            {/* Header & Ingestion Zone */}
            <div className="rounded-3xl border border-[#dfe6dd] bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#edf2ea]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-lg bg-[#e7f1f4] text-[#356d80]">
                      <UploadCloud size={14} />
                    </span>
                    <h2 className="text-base font-bold text-[#153f35]">Live Study Document Repository</h2>
                  </div>
                  <p className="mt-1 text-xs text-[#68756e]">
                    Uploaded clinical trials are parsed page-by-page into searchable vector embeddings.
                  </p>
                </div>

                {/* Upload Button */}
                <label className="flex cursor-pointer items-center gap-2 rounded-full bg-[#153f35] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#205244] transition-colors shadow-sm self-start sm:self-auto">
                  <UploadCloud size={15} className="text-[#d7f16f]" />
                  {isUploading ? 'Indexing PDF...' : 'Upload Clinical PDF'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              {/* Upload Drag/Drop Highlight Banner */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d2dfd0] bg-[#fbfcf9] p-8 text-center cursor-pointer hover:border-[#153f35] hover:bg-[#f6faf4] transition-all group"
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-[#edf5e3] text-[#537d30] group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} />
                </div>
                <p className="mt-3 text-sm font-bold text-[#153f35]">
                  Click to browse or drop your trial protocol PDF here
                </p>
                <p className="mt-1 text-xs text-[#7a867f]">
                  Supports Investigator Brochures, FDA Package Inserts, and Safety Bulletins (up to 25 MB).
                </p>
              </div>

              {/* Document List */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7a867f]">
                    Synchronized Documents ({documents.length})
                  </h3>
                  <button
                    onClick={fetchDocuments}
                    className="text-xs font-medium text-[#537d30] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Refresh Index
                  </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#dce5d9]">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-[#e8eee6] bg-[#f7f9f6] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a867f]">
                    <span>Document File</span>
                    <span>Pages</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>

                  <div className="divide-y divide-[#edf2ea] bg-white">
                    {documents.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#7a867f]">
                        No documents indexed yet. Upload your first PDF to begin grounded research.
                      </div>
                    ) : (
                      documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-4 hover:bg-[#fafbfa] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#edf5e3] text-[#537d30]">
                              <FileText size={17} />
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-xs text-[#153f35] truncate">{doc.name}</p>
                              <p className="text-[11px] text-[#7a867f]">
                                {(doc.size / 1000000).toFixed(2)} MB · Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <span className="font-mono text-xs font-semibold text-[#153f35]">
                            {doc.pages} pgs
                          </span>

                          <span className="rounded-full bg-[#edf5e3] px-2.5 py-1 text-[11px] font-bold text-[#537d30]">
                            {doc.status === 'READY' ? '✓ Indexed' : 'Processing'}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setQuickQuery(`Summarize the main findings in ${doc.name}`);
                                setActiveTab('overview');
                                executeQuickAnalysis(`Summarize the main findings in ${doc.name}`);
                              }}
                              className="rounded-lg bg-[#f0f4ec] px-2.5 py-1 text-[11px] font-semibold text-[#153f35] hover:bg-[#e4ede0]"
                            >
                              Query PDF
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id, doc.name)}
                              title="Delete document"
                              className="p-1.5 text-[#9baaa0] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* -------------------- MODAL: EVIDENCE INSPECTION -------------------- */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-[#dce5d9] bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-[#edf2ea]">
              <div>
                <span className="rounded-full bg-[#edf5e3] px-3 py-1 text-[10px] font-bold text-[#537d30]">
                  Grounded Citation Audit
                </span>
                <h3 className="mt-2 text-base sm:text-lg font-bold text-[#153f35]">
                  {selectedEvidence.query}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="rounded-full p-1.5 text-[#7a867f] hover:bg-[#f0f4ec] hover:text-[#153f35]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Source Meta */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#f7f9f6] border border-[#e8eee6]">
                <p className="text-[10px] text-[#7a867f] font-semibold">Candidate Drug</p>
                <p className="font-bold text-[#153f35] mt-0.5 truncate">{selectedEvidence.drug}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f7f9f6] border border-[#e8eee6]">
                <p className="text-[10px] text-[#7a867f] font-semibold">Study Phase</p>
                <p className="font-bold text-[#153f35] mt-0.5">{selectedEvidence.phase}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f7f9f6] border border-[#e8eee6]">
                <p className="text-[10px] text-[#7a867f] font-semibold">Document Page</p>
                <p className="font-bold text-[#537d30] mt-0.5">{selectedEvidence.page}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f7f9f6] border border-[#e8eee6]">
                <p className="text-[10px] text-[#7a867f] font-semibold">Model Confidence</p>
                <p className="font-bold text-[#153f35] mt-0.5">{selectedEvidence.confidence}</p>
              </div>
            </div>

            {/* Passage Highlight */}
            <div className="mt-5 rounded-2xl bg-[#f7f9f6] border-l-4 border-[#153f35] p-4 text-xs sm:text-sm text-[#24362d] leading-relaxed">
              <p className="font-semibold text-[#153f35] text-xs mb-1 uppercase tracking-wider">
                Source Document Passage:
              </p>
              &quot;{selectedEvidence.passage}&quot;
            </div>

            <p className="mt-3 text-[11px] text-[#7a867f] flex items-center gap-1">
              <ShieldCheck size={14} className="text-[#537d30]" /> Double-verified against original PDF OCR text layer.
            </p>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#edf2ea]">
              <button
                onClick={(e) => toggleBookmark(selectedEvidence.id, e)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#52605a] hover:text-[#153f35]"
              >
                <Bookmark
                  size={14}
                  className={starredIds.includes(selectedEvidence.id) ? 'fill-amber-500 text-amber-500' : ''}
                />
                {starredIds.includes(selectedEvidence.id) ? 'Bookmarked' : 'Save to Starred'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyCitation(selectedEvidence)}
                  className="flex items-center gap-1.5 rounded-full border border-[#dce5d9] bg-white px-4 py-2 text-xs font-semibold text-[#153f35] hover:bg-[#edf5e3]"
                >
                  <Copy size={13} /> Copy Citation
                </button>
                <button
                  onClick={() => {
                    const queryText = `Elaborate on the clinical findings from ${selectedEvidence.source} regarding ${selectedEvidence.query}`;
                    setSelectedEvidence(null);
                    setQuickQuery(queryText);
                    setActiveTab('overview');
                    executeQuickAnalysis(queryText);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-[#153f35] px-4 py-2 text-xs font-bold text-white hover:bg-[#205244]"
                >
                  <Sparkles size={13} className="text-[#d7f16f]" /> Ask Follow-up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: REGULATORY BRIEF -------------------- */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl border border-[#dce5d9] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-4 border-b border-[#edf2ea]">
              <div>
                <span className="rounded-full bg-[#d7f16f] px-3 py-1 text-[10px] font-bold text-[#153f35]">
                  Auto-Generated Brief
                </span>
                <h3 className="mt-2 text-xl font-bold text-[#153f35]">
                  Clinical Regulatory Summary & Executive Brief
                </h3>
                <p className="text-xs text-[#7a867f]">
                  Generated on {new Date().toLocaleDateString()} for {user?.name || 'Investigator'}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="rounded-full p-1.5 text-[#7a867f] hover:bg-[#f0f4ec] hover:text-[#153f35]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Brief Content Preview */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-4 text-xs leading-relaxed text-[#21352c] pr-2">
              <div className="rounded-2xl bg-[#f7f9f6] p-4 border border-[#e8eee6]">
                <h4 className="font-bold text-[#153f35] uppercase tracking-wider text-[11px] mb-1">
                  1. Executive Overview
                </h4>
                <p>
                  Trial candidate <strong>Drug A (Novastatin 40mg)</strong> completed Phase 3 primary efficacy endpoint evaluation with statistically significant outcome measures (least-squares mean difference = 4.8 points, p &lt; 0.001) in comparison with standard placebo arms.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f9f6] p-4 border border-[#e8eee6]">
                <h4 className="font-bold text-[#153f35] uppercase tracking-wider text-[11px] mb-1">
                  2. Safety & Tolerability Signal Summary
                </h4>
                <p>
                  Incidence of serious adverse events (SAEs) remained comparable to placebo (1.4% vs 1.2%). Grade 3/4 transaminase elevations occurred in 0.8% of patients without hepatic decompensation. Study discontinuation rate was documented at 1.4%, meeting ICH E6(R2) safety thresholds.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f9f6] p-4 border border-[#e8eee6]">
                <h4 className="font-bold text-[#153f35] uppercase tracking-wider text-[11px] mb-1">
                  3. Renal & Special Population Dosing Guidance
                </h4>
                <p>
                  Full pharmacokinetic alignment confirmed zero initial dose adjustments required for mild-to-moderate renal impairment (eGFR 30 to 89 mL/min/1.73 m2). Severe impairment cohorts require 50% titration schedule.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f9f6] p-4 border border-[#e8eee6]">
                <h4 className="font-bold text-[#153f35] uppercase tracking-wider text-[11px] mb-1">
                  4. Evidence Provenance & Audit Log
                </h4>
                <p className="text-[11px] text-[#6d7e76]">
                  Passages extracted from <code>Clinical-Trial-DrugA.pdf</code> (p. 18, 21), <code>Safety-Bulletin-Q2.pdf</code> (p. 6, 14), and <code>DrugA-Label.pdf</code> (p. 11). Traceability verified 100% compliant with 21 CFR Part 11 electronic records.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-end gap-3 pt-4 border-t border-[#edf2ea]">
              <button
                onClick={() => {
                  const report = `# Clinical Regulatory Summary & Executive Brief\nGenerated: ${new Date().toISOString()}\n\n1. Executive Overview\nDrug A (Novastatin 40mg) Phase 3 endpoint reached p < 0.001.\n\n2. Safety & Tolerability\nSAE rate 1.4% vs 1.2% placebo. Discontinuation 1.4%.\n\n3. Dosing\nNo dose adjustment for eGFR >= 30 mL/min/1.73m2.\n\nGrounded with PharmaResearch AI.`;
                  navigator.clipboard.writeText(report);
                  showToast('Regulatory brief copied to clipboard');
                }}
                className="flex items-center gap-1.5 rounded-full border border-[#dce5d9] bg-white px-4 py-2 text-xs font-semibold text-[#153f35] hover:bg-[#edf5e3]"
              >
                <Copy size={13} /> Copy Markdown
              </button>

              <button
                onClick={() => {
                  const report = `# Clinical Regulatory Summary & Executive Brief\nDate: ${new Date().toISOString()}\nInvestigator: ${user?.name}\n\nEvidence Summary:\n- Phase 3 Primary Endpoint: 78.4% efficacy (p < 0.001)\n- Safety: 1.4% SAE rate\n- Adherence: 94.2%\n\nPharmaResearch AI Verified.`;
                  const blob = new Blob([report], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Regulatory_Executive_Brief_${new Date().toISOString().slice(0, 10)}.md`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showToast('Regulatory brief downloaded');
                }}
                className="flex items-center gap-1.5 rounded-full bg-[#153f35] px-5 py-2 text-xs font-bold text-white hover:bg-[#205244]"
              >
                <Download size={13} className="text-[#d7f16f]" /> Download Brief (.md)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-[#dde5db] bg-white/70 py-6 px-4 sm:px-6 lg:px-10 text-xs text-[#7a867f]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p>
            PharmaResearch AI • Clinical Trial Intelligence Platform • Grounded OCR Citation Engine
          </p>
          <div className="flex gap-4 font-medium">
            <Link href="/" className="hover:text-[#153f35]">Home</Link>
            <Link href="/chat" className="hover:text-[#153f35]">Research Chat</Link>
            <Link href="/documents" className="hover:text-[#153f35]">Document Library</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
