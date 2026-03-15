'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { handleAddTransaction } from '@/src/lib/actions/transactions';

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await handleAddTransaction(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Success is handled by the redirect inside the server action
  }

  return (
    <div className="min-h-screen bg-[#090A0C] text-white p-8 md:p-24 flex items-center justify-center font-sans">
      <div className="w-full max-w-xl">
        
        {/* Back Navigation */}
        <Link 
          href="/dashboard" 
          className="text-[10px] font-bold text-[#00D1B2] uppercase tracking-[0.3em] mb-12 block hover:opacity-70 transition-opacity"
        >
          ← Back to Overview
        </Link>
        
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Report <span className="text-[#00D1B2]">Update</span>
          </h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-2">
            Add a new entry to your ledger
          </p>
        </header>
        
        <form action={handleSubmit} className="bg-[#111319] p-10 rounded-[32px] border border-white/5 space-y-8 shadow-2xl">
          
          {/* Error Message Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-center">
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}

          {/* Transaction Title */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              Transaction Title
            </label>
            <input 
              name="title" 
              type="text" 
              required 
              placeholder="e.g. Apple Inc. Subscription" 
              className="w-full bg-[#1A1C23] border border-white/5 rounded-2xl p-4 text-white outline-none focus:ring-1 ring-[#00D1B2] transition-all placeholder:text-slate-600" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                Amount ($)
              </label>
              <input 
                name="amount" 
                type="number" 
                step="0.01" 
                required 
                placeholder="0.00"
                className="w-full bg-[#1A1C23] border border-white/5 rounded-2xl p-4 text-white outline-none focus:ring-1 ring-[#00D1B2] transition-all placeholder:text-slate-600" 
              />
            </div>

            {/* Type Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                Type
              </label>
              <select 
                name="type" 
                className="w-full bg-[#1A1C23] border border-white/5 rounded-2xl p-4 text-white outline-none appearance-none cursor-pointer focus:ring-1 ring-[#00D1B2]"
              >
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
              </select>
            </div>
          </div>

          {/* Category Selector (Connects to Budget Tracker) */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              Budget Category
            </label>
            <select 
              name="category" 
              required 
              className="w-full bg-[#1A1C23] border border-white/5 rounded-2xl p-4 text-white outline-none appearance-none cursor-pointer focus:ring-1 ring-[#00D1B2]"
            >
              <option value="" className="text-slate-500">Select Allocation</option>
              <option value="Housing">Housing</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
              <option value="Salary">Salary (Income)</option>
              <option value="Other">Other</option>
            </select>
            <p className="text-[9px] text-slate-600 font-medium">
              * This ensures your Budget Tracker progress bars update correctly.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#00D1B2] text-black py-4 rounded-full font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:scale-[1.02] transition-all shadow-lg shadow-[#00D1B2]/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Save Transaction"}
          </button>
        </form>

        <p className="text-center text-slate-600 text-[10px] mt-10 uppercase tracking-widest">
          Secured by Spendly Cloud Engine
        </p>
      </div>
    </div>
  );
}