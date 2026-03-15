'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { handleLogOut } from '@/src/lib/actions/auth';
import { clearUserData } from '@/src/lib/actions/user';
import { useRouter } from 'next/navigation';

interface SettingsProps {
  name: string;
  email: string;
}

export default function SettingsClient({ name, email }: SettingsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteData = async () => {
    const confirmed = confirm("⚠️ WARNING: This will permanently wipe all your transaction history. Continue?");
    
    if (confirmed) {
      setIsDeleting(true);
      const result = await clearUserData();
      
      if (result.success) {
        alert("All financial data has been cleared.");
        router.refresh(); 
      } else {
        alert("Error: " + result.error);
      }
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0C] font-sans text-white flex flex-col md:flex-row overflow-hidden">
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="md:w-64 bg-[#111319] border-r border-white/5 p-8 flex flex-col justify-between">
        <div>
          {/* BRANDING LOGO - MATCHES DASHBOARD EXACTLY */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-8 h-8 bg-[#00D1B2] rounded-lg shadow-[0_0_20px_rgba(0,209,178,0.3)]"></div>
            <span className="text-xl font-bold tracking-tight text-white">Spendly</span>
          </div>

          <nav className="flex flex-col gap-6">
            <Link href="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/budget" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              Budget Tracker
            </Link>
            <Link href="/analytics" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              Analytics
            </Link>
            <Link href="/setting_privacy" className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00D1B2]">
              Settings
            </Link>
          </nav>
        </div>

        {/* LOG OUT BUTTON */}
        <button 
          onClick={() => handleLogOut()}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 hover:text-white transition-all pt-8 border-t border-white/5 group"
        >
          <svg 
            className="group-hover:-translate-x-1 transition-transform" 
            xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full space-y-10">
          
          <header className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tight uppercase">Account <span className="text-[#00D1B2]">Settings</span></h1>
              <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-[0.2em]">Profile Management</p>
            </div>

            <button 
              onClick={handleDeleteData}
              disabled={isDeleting}
              className="bg-transparent border border-[#B90000] text-[#B90000] px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#B90000] hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              {isDeleting ? "Wiping..." : "Delete All Data"}
            </button>
          </header>

          {/* PROFILE CARD */}
          <div className="bg-[#111319] rounded-[32px] p-10 border border-white/5 shadow-2xl space-y-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#FF9F66] rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg uppercase">
                {name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{name}</h2>
                <p className="text-[10px] font-bold text-[#00D1B2] uppercase tracking-widest">Personal Account</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                <div className="w-full bg-white/5 border border-white/5 text-white px-8 py-4 rounded-full font-medium italic">
                  {name}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
                <div className="w-full bg-white/5 border border-white/5 text-white px-8 py-4 rounded-full font-medium italic">
                  {email}
                </div>
              </div>
            </div>
          </div>

          {/* SECURITY CARD */}
          <div className="bg-[#111319] rounded-[32px] p-10 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-8 flex-1 w-full">
              <div className="space-y-1 flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Account Password</label>
                <div className="w-full bg-white/5 border border-white/5 text-slate-400 px-8 py-4 rounded-full font-medium tracking-[0.5em]">
                  ••••••••••••
                </div>
              </div>
            </div>
            
            <Link href="/reset" className="w-full md:w-auto">
              <button 
                type="button"
                className="w-full bg-[#00D1B2] text-black px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95"
              >
                Reset Password
              </button>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}