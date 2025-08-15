import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Remodely CRM - Construction Management Platform',
  description: 'Enterprise CRM solution for general contractors and construction companies',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // If in future you want to respect system preference, replace forcedDark with logic.
  const forcedDark = true

  return (
    <html lang="en" className={forcedDark ? 'dark' : ''} suppressHydrationWarning>
      <head>
        {/* Ensures proper form control & scrollbar colors */}
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className={`${inter.className} bg-[var(--bg)] text-[var(--text)] min-h-screen`}>        
        <Providers>
          {children}
        </Providers>
        {/* Optional script: keep dark class during hydration to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{document.documentElement.classList.add('dark');})();`
          }}
        />
      </body>
    </html>
  )
}

// ---------------------------------------------
// Notes:
// 1. All pages now inherit the dark design tokens defined in globals.css (.dark block).
// 2. The override mapping .bg-white -> var(--surface-1) keeps legacy components consistent.
// 3. To add a theme toggle later, manage a data-theme or dark class in localStorage and
//    remove the forced script above.
