import { NavLink, Outlet } from 'react-router-dom'

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
}

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="text-lg font-semibold tracking-tight">
            Playdex
          </NavLink>
          <nav className="flex gap-6 text-sm">
            <NavLink to="/" end className={linkClass}>
              Odkrywaj
            </NavLink>
            <NavLink to="/library" className={linkClass}>
              Biblioteka
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
