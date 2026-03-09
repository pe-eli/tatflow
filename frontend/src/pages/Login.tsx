import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI, extractApiError } from '../services/api'

const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
//
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.login(email, password)
      login(res.data.token, res.data.user, remember)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(extractApiError(err, 'Falha no login. Verifique suas credenciais.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="text-gray-400 mt-2">Entre na sua conta TatFlow</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="voce@estudio.com.br"
                maxLength={150}
                required
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                maxLength={128}
                required
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-ink-600 focus:ring-ink-500 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-400">Manter conectado</span>
            </label>

            {error && (
              <div className="rounded-lg bg-red-900/20 border border-red-700 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-ink-400 hover:text-ink-300 font-medium">
              Cadastre-se como tatuador
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
