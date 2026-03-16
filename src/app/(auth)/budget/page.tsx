export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { db } from "@/src/lib/db";
import { transactions, budgets as budgetsTable } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { handleDeleteBudget } from '@/src/lib/actions/transactions';

export default async function BudgetTrackerPage() {
  const userBudgets = await db.select().from(budgetsTable);
  const allTransactions = await db.select()
    .from(transactions)
    .where(eq(transactions.type, 'expense'));

  const budgetData = userBudgets.map((b) => {
    const totalSpent = allTransactions
      .filter((t) => t.category === b.category) 
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const rawPercentage = (totalSpent / Number(b.limit)) * 100;
    const displayPercentage = Math.round(rawPercentage);
    const barWidth = Math.min(rawPercentage, 100);

    return {
      category: b.category,
      spent: totalSpent,
      limit: Number(b.limit),
      percentage: displayPercentage,
      barWidth: barWidth,
    };
  });

  return (
    <div className="min-h-screen bg-[#090A0C] font-sans text-white flex flex-col md:flex-row">
      
      {/* --- SIDEBAR --- */}
      <aside className="md:w-64 bg-[#111319] border-r border-white/5 p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-8 h-8 bg-[#00D1B2] rounded-lg shadow-[0_0_15px_rgba(0,209,178,0.3)]"></div>
          <span className="text-xl font-bold tracking-tight text-white">Spendly</span>
        </div>
        <nav className="flex flex-col gap-6">
          <Link href="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/budget" className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00D1B2]">Budget Tracker</Link>
          <Link href="/analytics" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Analytics</Link>
          <Link href="/setting_privacy" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Settings</Link>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8 md:p-16 overflow-y-auto flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          
          <header className="flex justify-between items-start mb-24">
            <div>
              <h1 className="text-4xl font-bold tracking-tight uppercase">
                Budget <span className="text-[#00D1B2]">Tracker</span>
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wider">
                Live Analysis: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <Link href="/budget/set-goal">
              <button className="bg-[#00D1B2] text-black px-8 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95">
                Set Goal
              </button>
            </Link>
          </header>

          <div className="flex-1 flex items-start justify-center">
            <div className="w-full max-w-4xl bg-[#111319] rounded-[32px] p-12 border border-white/5 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-12">Allocations</h3>
              
              <div className="space-y-12">
                {budgetData.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-slate-500 text-sm font-medium">No budgets set. Click "Set Goal" to start tracking.</p>
                    </div>
                ) : (
                    budgetData.map((item, index) => (
                    <div key={index} className="group space-y-4">
                        <div className="flex justify-between items-center">
                          
                          {/* LEFT: INFO */}
                          <div>
                              <p className="text-lg font-bold text-white tracking-wide">{item.category}</p>
                              <p className="text-xs font-semibold text-slate-500 uppercase mt-1">
                              ${item.spent.toLocaleString()} <span className="mx-1 opacity-30">/</span> ${item.limit.toLocaleString()}
                              </p>
                          </div>

                          {/* RIGHT: STATUS & ACTION */}
                          <div className="flex flex-col items-end gap-1">
                              <span className={`text-sm font-bold ${item.percentage >= 100 ? 'text-red-400' : 'text-white'}`}>
                                  {item.percentage}%
                              </span>
                              
                              <form action={async () => {
                                "use server";
                                await handleDeleteBudget(item.category);
                              }}>
                                <button className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-slate-600 hover:text-red-500 uppercase tracking-[0.2em] transition-all cursor-pointer">
                                  [ Clear ]
                                </button>
                              </form>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                              className={`h-full transition-all duration-1000 ease-out ${item.percentage >= 100 ? 'bg-red-500' : 'bg-[#00D1B2]'}`}
                              style={{ width: `${item.barWidth}%` }}
                          ></div>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}