import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  const close = () => setOpen(false)

  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" onClick={close} className="flex items-center gap-2">
              <img src="/TatFlow.png" alt="TatFlow" className="h-8 w-auto" />
              <span className="text-white font-bold text-lg tracking-tight">TatFlow</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Painel</Link>
                  <Link to="/availability" className="text-gray-300 hover:text-white transition-colors text-sm">Horários</Link>
                  <Link to="/calendar" className="text-gray-300 hover:text-white transition-colors text-sm">Agenda</Link>
                  <Link to="/settings" className="text-gray-300 hover:text-white transition-colors text-sm">Configurações</Link>
                  <span className="text-gray-500 text-sm">{user?.name}</span>
                  <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-4">Sair</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm">Entrar</Link>
                  <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Cadastrar</Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
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
          className="fixed inset-0 bg-black/60 z-40 sm:hidden"
          onClick={close}
        />
      )}

      {/* Mobile side drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-gray-900 border-l border-gray-800 z-50 flex flex-col sm:hidden transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src="/TatFlow.png" alt="TatFlow" className="h-7 w-auto" />
            <span className="text-white font-bold tracking-tight">TatFlow</span>
          </div>
          <button
            onClick={close}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
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
              <div className="px-3 py-2 mb-3">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Usuário</p>
                <p className="text-white font-semibold text-sm">{user?.name}</p>
                {user?.studioName && (
                  <p className="text-gray-400 text-xs mt-0.5">{user.studioName}</p>
                )}
              </div>
              <div className="space-y-1">
                {[
                  { to: '/dashboard', label: 'Painel', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
                  { to: '/availability', label: 'Horários', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                  { to: '/calendar', label: 'Agenda', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
                  { to: '/settings', label: 'Configurações', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
                ].map(({ to, label, icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={close}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
                    {label}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <Link to="/login" onClick={close} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium">
                Entrar
              </Link>
              <Link to="/register" onClick={close} className="flex items-center justify-center gap-2 mx-3 py-2.5 rounded-lg bg-ink-600 text-white text-sm font-medium hover:bg-ink-500 transition-colors">
                Cadastrar
              </Link>
            </div>
          )}
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <div className="px-3 py-4 border-t border-gray-800 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors text-sm font-medium"
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
