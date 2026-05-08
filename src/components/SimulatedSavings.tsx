'use client'

import { useState, useEffect } from 'react'
import { TrendingDown } from 'lucide-react'

const SAVINGS_EXAMPLES = [
  { tool: 'Cursor', amount: 240, action: 'Downgraded to Pro' },
  { tool: 'Claude', amount: 1200, action: 'Consolidated Team seats' },
  { tool: 'ChatGPT', amount: 600, action: 'Switched from Plus to Team' },
  { tool: 'OpenAI API', amount: 3500, action: 'Procured via Credex' },
  { tool: 'Copilot', amount: 480, action: 'Eliminated redundancy' },
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
    <div className={`transition-all duration-500 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full`}>
      <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <TrendingDown className="h-3 w-3 text-emerald-500" />
      </div>
      <p className="text-xs font-medium text-slate-300">
        <span className="text-white font-bold">${current.amount}/yr</span> saved on <span className="text-blue-400">{current.tool}</span>: {current.action}
      </p>
    </div>
  )
}
