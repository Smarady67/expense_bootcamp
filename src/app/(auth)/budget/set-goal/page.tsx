'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { handleSetBudget } from '@/src/lib/actions/transactions';

export default function SetGoalPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // We wrap the Server Action to handle the client-side state
  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const result = await handleSetBudget(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Success redirect is handled inside handleSetBudget
  }

  return (
    <div className="min-h-screen bg-[#090A0C] text-white p-8 md:p-24 flex items-center justify-center font-sans">
      <div className="w-full max-w-xl">
        <Link href="/budget" className="text-[10px] font-bold text-[#00D1B2] uppercase tracking-[0.3em] mb-12 block hover:opacity-70 transition-opacity">
          ← Back to Budget Tracker
        </Link>
        
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Set Budget <span className="text-[#00D1B2]">Goal</span>
          </h1>
        </header>
        
        {/* We use action={onSubmit} instead of calling handleSetBudget directly */}
        <form action={onSubmit} className="bg-[#111319] p-10 rounded-[32px] border border-white/5 space-y-8 shadow-2xl">
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Category</label>
            <select name="category" required className="w-full bg-[#1A1C23] border border-white/5 rounded-2xl p-4 text-white outline-none appearance-none cursor-pointer focus:ring-1 ring-[#00D1B2]">
              <option value="">Select Category</option>
              <option value="Housing">Housing</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Monthly Limit ($)</label>
            <input name="limit" type="number" step="0.01" required placeholder="1500.00" className="w-full bg-[#1A1C23] border border-white/5 rounded-2xl p-4 text-white outline-none focus:ring-1 ring-[#00D1B2]" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#00D1B2] text-black py-4 rounded-full font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-white transition-all disabled:opacity-50"
          >
            {loading ? "Saving Goal..." : "Set Monthly Goal"}
          </button>
        </form>
      </div>
    </div>
  );
}