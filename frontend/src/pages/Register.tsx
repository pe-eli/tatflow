import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

type Role = 'ARTIST' | 'CLIENT'

const Register: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('ARTIST')
  const [form, setForm] = useState({
    name: '', email: '', password: '', studioName: '', city: '', instagram: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (role === 'CLIENT') {
      setError('Clientes não precisam de conta. Peça o link de solicitação ao seu tatuador.')
      return
    }

    setLoading(true)
    try {
      const res = await authAPI.register({ ...form, role })
      login(res.data.token, res.data.user, true)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(message || 'Falha no cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Crie sua conta</h1>
          <p className="text-gray-400 mt-2">Entre no TatFlow e gerencie seu estúdio</p>
        </div>

        <div className="card">
          {/* Role selector */}
          <div className="mb-6">
            <label className="label">Sou...</label>
            <div className="grid grid-cols-2 gap-3">
              {(['ARTIST', 'CLIENT'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors text-sm ${
                    role === r
                      ? 'border-ink-500 bg-ink-900/30 text-ink-300'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {r === 'ARTIST' ? 'Tatuador' : 'Cliente'}
                </button>
              ))}
            </div>
          </div>

          {role === 'CLIENT' ? (
            <div className="rounded-lg bg-yellow-900/20 border border-yellow-700 p-4 text-sm text-yellow-300">
              <strong>Clientes não precisam de conta.</strong>
              <br />
              Para solicitar um orçamento de tatuagem, peça o link de solicitação ao seu tatuador.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nome Completo *</label>
                <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Seu nome" maxLength={100} required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="voce@estudio.com.br" maxLength={150} required />
              </div>
              <div>
                <label className="label">Senha *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="input" placeholder="Mín. 8 caracteres" minLength={8} maxLength={128} required />
              </div>
              <div>
                <label className="label">Nome do Estúdio</label>
                <input name="studioName" value={form.studioName} onChange={handleChange} className="input" placeholder="Estúdio Ink & Soul" maxLength={100} />
              </div>
              <div>
                <label className="label">Cidade</label>
                <input name="city" value={form.city} onChange={handleChange} className="input" placeholder="São Paulo" maxLength={80} />
              </div>
              <div>
                <label className="label">Instagram (opcional)</label>
                <input name="instagram" value={form.instagram} onChange={handleChange} className="input" placeholder="@seuEstudio" maxLength={50} />
              </div>

              {error && (
                <div className="rounded-lg bg-red-900/20 border border-red-700 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar Conta de Tatuador'}
              </button>
            </form>
          )}

          <p className="text-center text-gray-500 text-sm mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-ink-400 hover:text-ink-300 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
