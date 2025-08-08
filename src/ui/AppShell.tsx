import { ReactNode } from 'react'
import { Building2, Map, Users, Upload, Download, Settings, Search } from 'lucide-react'

export type NavItem = { id: string; label: string; href?: string; onClick?: () => void; active?: boolean; icon?: ReactNode }

const DEFAULT_NAV: NavItem[] = [
  { id: 'streets', label: 'רחובות', href: '#/streets', icon: <Map size={18} /> },
  { id: 'buildings', label: 'בניינים', href: '#/buildings', icon: <Building2 size={18} /> },
  { id: 'residents', label: 'דיירים', href: '#/residents', icon: <Users size={18} /> },
  { id: 'import', label: 'ייבוא', href: '#/import', icon: <Upload size={18} /> },
  { id: 'export', label: 'ייצוא', href: '#/export', icon: <Download size={18} /> },
  { id: 'settings', label: 'הגדרות', href: '#/settings', icon: <Settings size={18} /> }
]

export default function AppShell({
  title,
  navItems = DEFAULT_NAV,
  onSearch,
  searchPlaceholder = 'חיפוש…',
  headerExtra,
  children
}: {
  title?: string
  navItems?: NavItem[]
  onSearch?: (q: string) => void
  searchPlaceholder?: string
  headerExtra?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="u-shell">
      {/* Sidebar */}
      <aside className="u-sidebar">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="size-8 rounded-xl bg-sky-600" />
          <div className="font-semibold">מעקב חלוקת דואר</div>
        </div>
        <nav className="mt-3 grid gap-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={item.onClick}
              className={`u-btn justify-start ${item.active ? 'bg-slate-100' : ''}`}
            >
              {item.icon}<span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="min-h-screen flex flex-col">
        <header className="u-topbar">
          <div className="u-container py-3 flex items-center gap-3">
            <h1 className="text-lg font-semibold">{title}</h1>
            <div className="ml-auto flex items-center gap-2">
              {!!onSearch && (
                <div className="relative">
                  <input
                    className="u-input ps-9 min-w-[220px]"
                    placeholder={searchPlaceholder}
                    onChange={(e) => onSearch?.(e.target.value)}
                    aria-label="חיפוש"
                  />
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70" size={18} />
                </div>
              )}
              {headerExtra}
            </div>
          </div>
        </header>

        <main className="u-container w-full py-4 grid gap-4">
          {children}
        </main>
      </div>
    </div>
  )
}
