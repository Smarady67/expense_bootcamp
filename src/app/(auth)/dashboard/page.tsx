import React from 'react';
import Link from 'next/link';
import { db } from "@/src/lib/db";
import { transactions } from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { handleDeleteTransaction } from '@/src/lib/actions/transactions';

export default async function DashboardPage() {
  const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.date));

  const revenue = allTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const expenses = allTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netWorth = revenue - expenses;
  
  const savingsRate = revenue > 0 
    ? Math.round(((revenue - expenses) / revenue) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#090A0C] font-sans text-white flex flex-col md:flex-row">
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="md:w-64 bg-[#111319] border-r border-white/5 p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-8 h-8 bg-[#00D1B2] rounded-lg shadow-[0_0_20px_rgba(0,209,178,0.3)]"></div>
          <span className="text-xl font-bold tracking-tight">Spendly</span>
        </div>

        <nav className="flex flex-col gap-6">
          <Link href="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00D1B2]">
            Dashboard
          </Link>
          <Link href="/budget" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
            Budget Tracker
          </Link>
          <Link href="/analytics" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
            Analytics
          </Link>
          <Link href="/setting_privacy" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
            Settings
          </Link>
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-8 md:p-16 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Capital <span className="text-[#00D1B2]">Overview</span>
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wider">
                Update: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <Link href="/dashboard/report">
              <button className="bg-[#00D1B2] text-black px-8 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg">
                Reports
              </button>
            </Link>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Net Worth" value={`$${netWorth.toLocaleString()}`} />
            <StatCard label="Monthly Revenue" value={`$${revenue.toLocaleString()}`} />
            <StatCard label="Expenses" value={`$${expenses.toLocaleString()}`} />
            <StatCard label="Savings Rate" value={`${savingsRate}%`} />
          </div>

          <div className="bg-[#111319] rounded-[24px] p-10 border border-white/5 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-10">Recent</h3>
            
            <div className="space-y-10">
              {allTransactions.length === 0 ? (
                <p className="text-slate-500 text-sm font-medium italic">No transactions reported yet.</p>
              ) : (
                allTransactions.map((t) => (
                  <LedgerRow 
                    key={t.id}
                    id={t.id} // Added id for deletion
                    title={t.title} 
                    date={t.date ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'} 
                    amount={`${t.type === 'expense' ? '-' : '+'}${Number(t.amount).toFixed(2)}$`} 
                    type={t.type as 'income' | 'expense'}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#1A1C23] p-8 rounded-[18px] border border-white/5 transition-transform hover:scale-[1.02]">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4">
        {label}
      </p>
      <h4 className="text-2xl font-bold tracking-tight text-white">{value}</h4>
    </div>
  );
}

function LedgerRow({ id, title, date, amount, type }: { id: number, title: string; date: string; amount: string, type: 'income' | 'expense' }) {
  return (
    <div className="group flex items-center justify-between border-b border-white/5 pb-8 last:border-0 last:pb-0">
      <div className="space-y-1">
        <p className="text-base font-bold text-white tracking-wide">{title}</p>
        <p className="text-xs font-semibold text-slate-500 uppercase">{date}</p>
      </div>
      
      <div className="flex items-center gap-8">
        <span className={`text-base font-bold tracking-tight ${type === 'expense' ? 'text-red-400' : 'text-[#00D1B2]'}`}>
          {amount}
        </span>
        
        {/* Delete Action Form */}
        <form action={async () => {
          "use server";
          await handleDeleteTransaction(id);
        }}>
          <button className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-slate-600 hover:text-red-500 uppercase tracking-tighter transition-all cursor-pointer">
            Clear
          </button>
        </form>
      </div>
    </div>
  );
}