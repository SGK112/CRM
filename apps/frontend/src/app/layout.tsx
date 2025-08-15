import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Remodely CRM - Construction Management Platform',
  description: 'Enterprise CRM solution for general contractors and construction companies',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + ' bg-slate-950 text-slate-100 antialiased'}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">
              {children}
            </main>
            <footer className="mt-20 border-t border-slate-800 bg-slate-950 supports-[backdrop-filter]:bg-slate-950/95 relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-amber-600/5 blur-3xl" />
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
                  <div className="col-span-2 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-9 w-9 rounded-md bg-amber-600 flex items-center justify-center shadow-inner ring-1 ring-amber-400/40">
                        <span className="text-xs font-bold tracking-wide text-white">RC</span>
                      </div>
                      <span className="font-semibold text-slate-100 tracking-tight">Remodely CRM</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                      Purpose‑built CRM & operations platform for construction teams. Increase efficiency, profitability, and client satisfaction with a unified workflow.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wide">Product</h4>
                    <ul className="space-y-2 text-slate-400">
                      <li><a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/trial">Features</a></li>
                      <li><a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/trial#pricing">Pricing</a></li>
                      <li><a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/demo">Demo</a></li>
                      <li><a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/roadmap">Roadmap</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wide">Resources</h4>
                    <ul className="space-y-2 text-slate-400">
                      <li><a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/docs">Docs</a></li>
                      <li><a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/blog">Blog</a></li>
                      <li><a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/support">Support</a></li>
                      <li><a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/status">Status</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wide">Company</h4>
                    <ul className="space-y-2 text-slate-400">
                      <li><a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/about">About</a></li>
                      <li><a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/careers">Careers</a></li>
                      <li><a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/privacy">Privacy</a></li>
                      <li><a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/terms">Terms</a></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-500">© {new Date().getFullYear()} Remodely CRM. All rights reserved. <span className="ml-2 text-slate-600" data-build="ddf068b">build ddf068b</span></p>
                  <div className="flex items-center gap-5 text-xs text-slate-500">
                    <a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/security">Security</a>
                    <a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/legal">Legal</a>
                    <a className="hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm transition-colors" href="/contact">Contact</a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}

// Note: Dark mode will be applied selectively (scoped) rather than forced globally.
