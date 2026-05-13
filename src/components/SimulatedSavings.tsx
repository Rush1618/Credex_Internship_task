'use client'

import { useState, useEffect } from 'react'
import { TrendingDown } from 'lucide-react'

const SAVINGS_EXAMPLES = [
  { tool: 'Cursor', amount: 240, action: 'Asset Optimization' },
  { tool: 'Claude', amount: 1200, action: 'Resource Consolidation' },
  { tool: 'ChatGPT', amount: 600, action: 'Efficiency Protocol' },
  { tool: 'OpenAI API', amount: 3500, action: 'Private Procurement' },
  { tool: 'Copilot', amount: 480, action: 'Redundancy Breach Fixed' },
]

export function SimulatedSavings() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % SAVINGS_EXAMPLES.length)
        setVisible(true)
      }, 500)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const current = SAVINGS_EXAMPLES[index]

  return (
    <div className={`transition-all duration-700 transform ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'} flex items-center gap-4 bg-white/[0.03] backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl no-print`}>
      <div className="relative">
        <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <TrendingDown className="h-4 w-4 text-blue-400 animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500 animate-ping" />
      </div>
      <div className="flex flex-col">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Live Savings Engine</p>
        <p className="text-[11px] font-bold text-slate-300">
          <span className="text-white font-black italic tracking-tight">${current.amount} RECAPTURED</span> on <span className="text-blue-400 uppercase italic">{current.tool}</span>: <span className="opacity-60">{current.action}</span>
        </p>
      </div>
    </div>
  )
}
