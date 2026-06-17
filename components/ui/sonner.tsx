'use client'

import type { CSSProperties } from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

/** Toaster without next-themes (ThemeProvider is optional in this app). */
const Toaster = ({ theme = 'system', ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
