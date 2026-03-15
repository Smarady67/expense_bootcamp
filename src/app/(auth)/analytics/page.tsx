import React from 'react';
import Link from 'next/link';
import { db } from "@/src/lib/db";
import { transactions } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function AnalyticsPage() {
  // 1. Fetch all expense transactions
  const allExpenses = await db.select()
    .from(transactions)
    .where(eq(transactions.type, 'expense'))
    .orderBy(desc(transactions.date));

  // 2. Group expenses by month in JavaScript (More reliable for SQLite)
  const groupedData: Record<string, number> = {};
  
  allExpenses.forEach((t) => {
    if (!t.date || t.amount === null) return;
    
    // Force conversion to number to prevent "invisible" bars
    const amount = parseFloat(String(t.amount));
    if (isNaN(amount) || amount <= 0) return;

    // Standardize the date parsing
    const date = new Date(t.date);
    if (isNaN(date.getTime())) return; // Skip invalid dates

    const monthKey = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    
    groupedData[monthKey] = (groupedData[monthKey] || 0) + amount;
  });

  // 3. Prepare Chart Data (Max 12 months)
  const chartData = Object.entries(groupedData)
    .map(([month, total]) => ({ month, total }))
    .slice(0, 12)
    .reverse();

  // Find the highest month to set the scale (prevent division by zero)
  const maxExpense = Math.max(...chartData.map(d => d.total), 0.1);

  // 4. Growth Logic (comparing most recent to previous)
  const currentMonthTotal = chartData[chartData.length - 1]?.total || 0;
  const lastMonthTotal = chartData[chartData.length - 2]?.total || 0;
  
  const growthRate = lastMonthTotal > 0 
    ? (((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-[#090A0C] font-sans text-white flex flex-col md:flex-row overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="md:w-64 bg-[#111319] border-r border-white/5 p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-8 h-8 bg-[#00D1B2] rounded-lg shadow-[0_0_15px_rgba(0,209,178,0.3)]"></div>
          <span className="text-xl font-bold tracking-tight text-white">Spendly</span>
        </div>

        <nav className="flex flex-col gap-6">
          <Link href="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/budget" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Budget Tracker</Link>
          <Link href="/analytics" className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00D1B2]">Analytics</Link>
          <Link href="/setting_privacy" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Settings</Link>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full space-y-10">
          
          <header>
            <h1 className="text-4xl font-bold tracking-tight">
              Data <span className="text-[#00D1B2]">Intelligence.</span>
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-2 uppercase tracking-tight">
              Performance Audit
            </p>
          </header>

          {/* VISUAL TRENDS CARD */}
          <div className="bg-[#111319] rounded-[24px] p-10 border border-white/5 relative">
            <div className="flex justify-between items-center mb-10">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monthly Cash Outflow</span>
              <span className="text-[11px] font-bold text-[#00D1B2] uppercase tracking-widest">Visual Trends</span>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-3 border-b border-white/10 pb-2">
              {chartData.length === 0 ? (
                <div className="w-full text-center text-slate-700 text-[10px] uppercase tracking-widest pb-20 italic">
                  No Expense Data Detected
                </div>
              ) : (
                chartData.map((d, i) => {
                  // Calculate height percentage (at least 5% if value > 0 for visibility)
                  const heightPercentage = Math.max((d.total / maxExpense) * 100, 5);
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                      <div 
                        className="w-full bg-[#134e48] group-hover:bg-[#00D1B2] transition-all duration-700 rounded-t-md relative shadow-[0_0_20px_rgba(0,209,178,0.05)]" 
                        style={{ height: `${heightPercentage}%` }}
                      >
                        {/* Tooltip Popup */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl z-20">
                          ${d.total.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider group-hover:text-white transition-colors">
                        {d.month}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* METRICS CARD */}
          <div className="bg-[#111319] rounded-[24px] p-12 border border-white/5 space-y-12">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-[#00D1B2] tracking-wide uppercase">Monthly Spend Delta</span>
                <span className={`text-sm font-bold ${Number(growthRate) > 0 ? 'text-red-400' : 'text-white'}`}>
                   {Number(growthRate) > 0 ? '+' : ''}{growthRate}%
                </span>
              </div>
              <div className="h-[2px] w-full bg-white/5 relative rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-in-out ${Number(growthRate) > 0 ? 'bg-red-500' : 'bg-[#00D1B2]'}`} 
                  style={{ width: `${Math.min(Math.abs(Number(growthRate)), 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Financial Stability</span>
              <span className="text-[11px] font-bold text-white uppercase">Optimal</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}