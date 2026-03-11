import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI, extractApiError } from '../services/api'

type Role = 'ARTIST' | 'CLIENT'

interface IBGEState {
  id: number
  sigla: string
  nome: string
}

interface IBGECity {
  id: number
  nome: string
}

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: 'Uma letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Uma letra minúscula', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Um número', test: (v: string) => /[0-9]/.test(v) },
]

const Register: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('ARTIST')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', studioName: '', instagram: '',
  })
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)

  const [states, setStates] = useState<IBGEState[]>([])
  const [cities, setCities] = useState<IBGECity[]>([])
  const [loadingCities, setLoadingCities] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch Brazilian states on mount
  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(r => r.json())
      .then((data: IBGEState[]) => setStates(data))
      .catch(() => {})
  }, [])

  // Fetch cities when state changes
  useEffect(() => {
    if (!selectedState) {
      setCities([])
      setSelectedCity('')
      setCitySearch('')
      return
    }
    setLoadingCities(true)
    setSelectedCity('')
    setCitySearch('')
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then((data: IBGECity[]) => {
        setCities(data)
        setLoadingCities(false)
      })
      .catch(() => setLoadingCities(false))
  }, [selectedState])

  // Filtered cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities
    const term = citySearch.toLowerCase()
    return cities.filter(c => c.nome.toLowerCase().includes(term))
  }, [cities, citySearch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName)
    setCitySearch(cityName)
    setShowCityDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (role === 'CLIENT') {
      setError('Clientes não precisam de conta. Peça o link de solicitação ao seu tatuador.')
      return
    }

    const name = `${form.firstName.trim()} ${form.lastName.trim()}`

    setLoading(true)
    try {
      const res = await authAPI.register({
        name,
        email: form.email,
        password: form.password,
        studioName: form.studioName,
        state: selectedState,
        city: selectedCity,
        instagram: form.instagram,
        role,
      })
      login(res.data.token, res.data.user, true)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(extractApiError(err, 'Falha no cadastro. Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  const passwordStarted = form.password.length > 0

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
              {/* First Name / Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nome *</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} className="input" placeholder="João" maxLength={50} required />
                </div>
                <div>
                  <label className="label">Sobrenome *</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} className="input" placeholder="Silva" maxLength={50} required />
                </div>
              </div>

              <div>
                <label className="label">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="voce@estudio.com.br" maxLength={150} required />
              </div>

              {/* Password with real-time validation */}
              <div>
                <label className="label">Senha *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="input" placeholder="Crie uma senha forte" maxLength={128} required />
                {passwordStarted && (
                  <ul className="mt-2 space-y-1">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(form.password)
                      return (
                        <li key={rule.label} className={`flex items-center gap-2 text-xs ${passed ? 'text-green-400' : 'text-gray-500'}`}>
                          {passed ? (
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <circle cx="12" cy="12" r="9" />
                            </svg>
                          )}
                          {rule.label}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div>
                <label className="label">Nome do Estúdio</label>
                <input name="studioName" value={form.studioName} onChange={handleChange} className="input" placeholder="Estúdio Ink & Soul" maxLength={100} />
              </div>

              {/* State / City selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Estado</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="input"
                  >
                    <option value="">Selecione</option>
                    {states.map((s) => (
                      <option key={s.sigla} value={s.sigla}>{s.sigla}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="label">Cidade</label>
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value)
                      setSelectedCity('')
                      setShowCityDropdown(true)
                    }}
                    onFocus={() => { if (selectedState) setShowCityDropdown(true) }}
                    onBlur={() => setTimeout(() => setShowCityDropdown(false), 150)}
                    className="input"
                    placeholder={!selectedState ? 'Selecione o estado' : loadingCities ? 'Carregando...' : 'Buscar cidade'}
                    disabled={!selectedState || loadingCities}
                  />
                  {showCityDropdown && filteredCities.length > 0 && (
                    <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
                      {filteredCities.slice(0, 50).map((c) => (
                        <li
                          key={c.id}
                          onMouseDown={() => handleCitySelect(c.nome)}
                          className="cursor-pointer px-3 py-2 text-sm text-gray-200 hover:bg-ink-900/40"
                        >
                          {c.nome}
                        </li>
                      ))}
                      {filteredCities.length > 50 && (
                        <li className="px-3 py-2 text-xs text-gray-500">
                          Digite para refinar a busca...
                        </li>
                      )}
                    </ul>
                  )}
                </div>
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
