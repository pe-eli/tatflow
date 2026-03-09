import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  const close = () => setOpen(false)

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    { to: '/dashboard', label: 'Painel', iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/availability', label: 'Horários', iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { to: '/calendar', label: 'Agenda', iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to: '/settings', label: 'Config.', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/60">
        {/* Top accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-ink-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" onClick={close} className="flex items-center gap-2.5 group">
              <img src="/TatFlow.png" alt="TatFlow" className="h-8 w-auto" />
              <span className="text-white font-bold text-lg tracking-tight group-hover:text-ink-300 transition-colors">TatFlow</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-1">
              {isAuthenticated ? (
                <>
                  {navLinks.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isActive(to)
                          ? 'bg-ink-600/20 text-ink-300 ring-1 ring-ink-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                  <div className="w-px h-5 bg-gray-700 mx-2" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50">
                    <div className="w-6 h-6 rounded-full bg-ink-600/30 ring-1 ring-ink-500/40 flex items-center justify-center">
                      <span className="text-ink-300 text-xs font-bold leading-none">
                        {user?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-300 text-sm max-w-[100px] truncate">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all">Entrar</Link>
                  <Link to="/register" className="ml-1 px-4 py-1.5 rounded-lg text-sm font-semibold bg-ink-600 text-white hover:bg-ink-500 transition-all shadow-lg shadow-ink-900/30">Cadastrar</Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 sm:hidden"
          onClick={close}
        />
      )}

      {/* Mobile side drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-gray-950 border-l border-gray-800/60 z-50 flex flex-col sm:hidden transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-800/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/TatFlow.png" alt="TatFlow" className="h-7 w-auto" />
            <span className="text-white font-bold tracking-tight">TatFlow</span>
          </div>
          <button
            onClick={close}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
            aria-label="Fechar menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer links */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-gray-800/50 ring-1 ring-gray-700/50">
                <div className="w-9 h-9 rounded-full bg-ink-600/30 ring-1 ring-ink-500/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-ink-300 font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                  {user?.studioName && (
                    <p className="text-gray-400 text-xs truncate">{user.studioName}</p>
                  )}
                </div>
              </div>
              <div className="space-y-0.5">
                {[
                  { to: '/dashboard', label: 'Painel', iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                  { to: '/availability', label: 'Horários', iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { to: '/calendar', label: 'Agenda', iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { to: '/settings', label: 'Configurações', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                ].map(({ to, label, iconPath }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={close}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive(to)
                        ? 'bg-ink-600/20 text-ink-300 ring-1 ring-ink-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                    </svg>
                    {label}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <Link to="/login" onClick={close} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors text-sm font-medium">
                Entrar
              </Link>
              <Link to="/register" onClick={close} className="flex items-center justify-center gap-2 mx-0 py-2.5 rounded-lg bg-ink-600 text-white text-sm font-semibold hover:bg-ink-500 transition-colors shadow-lg shadow-ink-900/30">
                Cadastrar
              </Link>
            </div>
          )}
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <div className="px-3 py-4 border-t border-gray-800/60 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair da conta
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default Navbar
