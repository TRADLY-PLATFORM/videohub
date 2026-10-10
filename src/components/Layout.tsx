import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, ChevronDown, User, LogOut } from 'lucide-react'
import { useAuthSelector } from '@/state/auth/selectors'
import { logout } from '@/state/auth/slice'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/state/store'
import { cn } from '@/src/lib/utils'
import MiniPlayer from '@/src/components/podcast/MiniPlayer'

function Header({ search, onSearch }: { search?: string; onSearch?: (v: string) => void }) {
  const isAuthenticated = useAuthSelector(s => s.isAuthenticated)
  const firstName = useAuthSelector(s => s.firstName)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const loc = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(!!search || false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const link = (to: string, label: string) => (
    <Link
      key={to}
      to={to}
      className={cn(
        'text-[13px] transition-colors',
        loc.pathname === to ? 'font-semibold text-white' : 'text-zinc-300 hover:text-zinc-400',
      )}
    >
      {label}
    </Link>
  )

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors',
        scrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent',
      )}
    >
      <div className="flex items-center gap-8 px-4 py-3 md:px-12">
        <Link to="/" className="text-xl font-black tracking-tight text-red-600 md:text-2xl">
          VIDEOHUB
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {link('/', 'Home')}
          {link('/movies', 'Movies')}
          {link('/series', 'TV Shows')}
          {link('/my-list', 'My List')}
          {link('/plans', 'Plans')}
          {link('/podcasts', 'Podcasts')}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-white">
          <div className="flex items-center">
            {showSearch ? (
              <input
                autoFocus
                value={search ?? ''}
                onChange={(e) => onSearch?.(e.target.value)}
                placeholder="Titles, genres..."
                className="w-44 rounded border border-white/40 bg-black/80 px-2 py-1 text-sm outline-none md:w-56"
              />
            ) : (
              <button onClick={() => setShowSearch(true)} aria-label="Search">
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>
          <Bell className="hidden h-5 w-5 sm:block" />
          {isAuthenticated ? (
            <div className="group relative flex items-center gap-1">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-red-600 text-xs font-bold">
                {(firstName?.[0] ?? 'U').toUpperCase()}
              </span>
              <ChevronDown className="h-4 w-4" />
              <div className="absolute right-0 top-8 hidden w-44 rounded bg-black/95 p-2 text-sm group-hover:block">
                <button
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-white/10"
                  onClick={() => navigate('/orders')}
                >
                  <User className="h-4 w-4" /> Purchases
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-white/10"
                  onClick={() => { dispatch(logout()); navigate('/'); }}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <Link to="/sign-in" className="hidden sm:inline">Sign in</Link>
              <Link to="/sign-up" className="rounded bg-red-600 px-3 py-1 font-semibold">
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
      {/* mobile nav */}
      <nav className="flex items-center gap-5 overflow-x-auto px-4 pb-2 lg:hidden">
        {link('/', 'Home')}
        {link('/movies', 'Movies')}
        {link('/series', 'TV Shows')}
        {link('/my-list', 'My List')}
          {link('/plans', 'Plans')}
        {link('/podcasts', 'Podcasts')}
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-[#141414] px-4 py-10 text-xs text-zinc-500 md:px-12">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 sm:grid-cols-4">
        {['Audio Description', 'Help Center', 'Gift Cards', 'Media Center', 'Investor Relations', 'Jobs', 'Terms of Use', 'Privacy', 'Legal Notices', 'Cookie Preferences', 'Corporate Information', 'Contact Us'].map((x) => (
          <span key={x} className="cursor-pointer hover:underline">{x}</span>
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-5xl">© {new Date().getFullYear()} VideoHub — Movies & Series.</p>
    </footer>
  )
}

export default function Layout({
  children,
  className,
  search,
  onSearch,
  minimalPadding,
}: {
  children: React.ReactNode
  className?: string
  search?: string
  onSearch?: (v: string) => void
  minimalPadding?: boolean
}) {
  return (
    <div className="min-h-screen bg-[#141414] flex flex-col text-white">
      <Header search={search} onSearch={onSearch} />
      <main className={cn('flex-1 pb-28', minimalPadding ? '' : 'px-4 md:px-12 pt-24', className)}>
        {children}
      </main>
      <Footer />
      <MiniPlayer />
    </div>
  )
}
