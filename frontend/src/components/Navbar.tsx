import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/TatFlow.png" alt="TatFlow" className="h-8 w-auto" />
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Painel
                </Link>
                <Link to="/calendar" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Agenda
                </Link>
                <span className="text-gray-500 text-sm">{user?.name}</span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-4">
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Entrar
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
