'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  Clock, 
  FileText, 
  MessageSquare, 
  Shield, 
  LogOut,
  ChevronRight,
  Activity,
  Bell,
  Star
} from 'lucide-react';
import { getStoredUser, clearStoredUser, AuthUser } from '@/lib/auth';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    clearStoredUser();
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-indigo-600 p-1.5 rounded-lg text-white group-hover:scale-105 transition-transform">
                  <Activity size={20} />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">Pharma AI</span>
              </Link>
              <span className="text-slate-300 dark:text-slate-600 mx-2">/</span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">User Dashboard</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white relative transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Welcome back, {user?.name || 'Researcher'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Here is what's happening with your projects today.
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/chat"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <MessageSquare size={16} />
              New Analysis
            </Link>
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-200 dark:shadow-indigo-900/50"
            >
              <Activity size={16} />
              Clinical Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Active Projects', value: '12', icon: Activity, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
            { label: 'Saved Documents', value: '148', icon: FileText, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
            { label: 'Recent Chats', value: '34', icon: MessageSquare, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Last 30 days</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area: Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock size={18} className="text-indigo-500" />
                  Recent Activity
                </h2>
                <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  View All
                </button>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {[
                  { title: 'Analyzed Clinical Trial Protocol for Drug A', type: 'chat', time: '2 hours ago', icon: MessageSquare, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                  { title: 'Uploaded Safety Report Q2_2026.pdf', type: 'doc', time: '4 hours ago', icon: FileText, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
                  { title: 'Saved Candidate Efficacy Metrics', type: 'bookmark', time: 'Yesterday', icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
                  { title: 'Generated Pharmacokinetics Summary', type: 'chat', time: 'Yesterday', icon: MessageSquare, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                  { title: 'Updated Profile Security Settings', type: 'system', time: '3 days ago', icon: Shield, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800' },
                ].map((item, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${item.color}`}>
                        <item.icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area: Profile & Settings */}
          <div className="space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20"></div>
              
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 mb-4 relative z-10">
                {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'R'}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 z-10">
                {user?.name || 'Researcher'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 z-10">
                {user?.email || 'researcher@pharma.ai'}
              </p>
              
              <div className="w-full grid grid-cols-2 gap-3 mb-6">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <User size={16} />
                  Profile
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <Settings size={16} />
                  Settings
                </button>
              </div>

              <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 text-left border border-slate-100 dark:border-slate-700/50">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Subscription</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Pro Plan Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Renews on Oct 24, 2026</p>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
