import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { ConditionalTopBar, ConditionalFooter } from '../components/ConditionalLayout'
import { ThemeProvider } from '../components/ThemeProvider'
import { SubscriptionProvider } from '../components/subscription-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Remodely Ai - Construction Management Platform',
  description: 'Enterprise CRM solution for general contractors and construction companies. Manage clients, projects, estimates, invoices, and teams in one platform.',
  keywords: 'construction CRM, contractor software, project management, estimation software, construction business management',
  authors: [{ name: 'Remodely Ai' }],
  creator: 'Remodely Ai',
  publisher: 'Remodely Ai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Remodely Ai - Construction Management Platform',
    description: 'Enterprise CRM solution for general contractors and construction companies. Manage clients, projects, estimates, invoices, and teams in one platform.',
    siteName: 'Remodely Ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remodely Ai - Construction Management Platform',
    description: 'Enterprise CRM solution for general contractors and construction companies. Manage clients, projects, estimates, invoices, and teams in one platform.',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased transition-colors duration-300`}>
        <ThemeProvider>
          <SubscriptionProvider>
            <Providers>
              <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
                <ConditionalTopBar />
                <main className="flex-1">
                  {children}
                </main>
                <ConditionalFooter>
              <footer className="mt-20 border-t border-[var(--border)] bg-[var(--surface-1)] backdrop-blur-sm relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                  <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-amber-600/5 blur-3xl" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
                    <div className="col-span-2 md:col-span-2">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-9 w-9 rounded-md bg-amber-600 flex items-center justify-center shadow-inner ring-1 ring-amber-400/40">
                          <span className="text-xs font-bold tracking-wide text-white">RA</span>
                        </div>
                        <span className="font-semibold text-[var(--text)] tracking-tight">Remodely Ai</span>
                      </div>
                      <p className="text-[var(--text-dim)] text-xs leading-relaxed max-w-sm">
                        Purpose‑built CRM & operations platform for construction teams. Increase efficiency, profitability, and client satisfaction with a unified workflow.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--text)] mb-3 text-xs uppercase tracking-wide">Product</h4>
                      <ul className="space-y-2 text-[var(--text-dim)]">
                        <li><a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/features">Features</a></li>
                        <li><a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/pricing">Pricing</a></li>
                        <li><a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/demo">Demo</a></li>
                        <li><a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/roadmap">Roadmap</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--text)] mb-3 text-xs uppercase tracking-wide">Resources</h4>
                      <ul className="space-y-2 text-[var(--text-dim)]">
                        <li><a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/docs">Docs</a></li>
                        <li><a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/integrations">Integrations</a></li>
                        <li><a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/blog">Blog</a></li>
                        <li><a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/support">Support</a></li>
                        <li><a className="hover:text-[var(--text-dim)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/status">Status</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--text)] mb-3 text-xs uppercase tracking-wide">Company</h4>
                      <ul className="space-y-2 text-[var(--text-dim)]">
                        <li><a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/about">About</a></li>
                        <li><a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/careers">Careers</a></li>
                        <li><a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/privacy">Privacy</a></li>
                        <li><a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/terms">Terms</a></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[var(--text-faint)]">© {new Date().getFullYear()} Remodely Ai. All rights reserved. <span className="ml-2 text-[var(--text-faint)]" data-build="ddf068b">build ddf068b</span></p>
                    <div className="flex items-center gap-5 text-xs text-[var(--text-faint)]">
                      <a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/security">Security</a>
                      <a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/legal">Legal</a>
                      <a className="hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/contact">Contact</a>
                    </div>
                  </div>
                </div>
              </footer>
            </ConditionalFooter>
          </div>
        </Providers>
        </SubscriptionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
