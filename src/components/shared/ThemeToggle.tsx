'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-full border border-border bg-muted animate-pulse" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="relative h-9 w-9 rounded-full border border-border bg-muted hover:bg-accent flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
    >
      <Sun
        className={`h-4 w-4 text-amber-500 transition-all duration-300 ${
          isDark ? 'opacity-0 rotate-90 scale-50 absolute' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
      <Moon
        className={`h-4 w-4 text-blue-400 transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50 absolute'
        }`}
      />
    </button>
  )
}
