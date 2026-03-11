import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI, styleAPI } from '../services/api'

const Settings: React.FC = () => {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  // Studio name
  const [studioName, setStudioName] = useState(user?.studioName || '')
  const [savingStudio, setSavingStudio] = useState(false)

  // Slug
  const [slug, setSlug] = useState(user?.slug || '')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [savingSlug, setSavingSlug] = useState(false)
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // WhatsApp message
  const [whatsappMsg, setWhatsappMsg] = useState(user?.whatsappMessage || '')
  const [savingMsg, setSavingMsg] = useState(false)

  // Reference images requirement
  const [requireRefImages, setRequireRefImages] = useState(user?.requireReferenceImages ?? false)
  const [savingRefImages, setSavingRefImages] = useState(false)

  // Tattoo styles
  const [styles, setStyles] = useState<string[]>([])
  const [newStyle, setNewStyle] = useState('')
  const [savingStyles, setSavingStyles] = useState(false)
  const [loadingStyles, setLoadingStyles] = useState(true)

  useEffect(() => {
    styleAPI.getMine().then((res) => {
      setStyles(res.data)
      setLoadingStyles(false)
    }).catch(() => setLoadingStyles(false))
  }, [])

  const handleStudioNameSave = async () => {
    if (!studioName.trim() || studioName.trim().length < 2) return
    setSavingStudio(true)
    try {
      await authAPI.updateStudioName(studioName.trim())
      updateUser({ studioName: studioName.trim() })
    } catch {
      alert('Erro ao salvar nome do estúdio.')
    } finally {
      setSavingStudio(false)
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setSlug(val)
    if (slugTimer.current) clearTimeout(slugTimer.current)
    if (!val || val.length < 3) {
      setSlugStatus(val ? 'invalid' : 'idle')
      return
    }
    if (val === user?.slug) {
      setSlugStatus('idle')
      return
    }
    setSlugStatus('checking')
    slugTimer.current = setTimeout(async () => {
      try {
        const res = await authAPI.checkSlug(val)
        setSlugStatus(res.data.available ? 'available' : 'taken')
      } catch {
        setSlugStatus('invalid')
      }
    }, 500)
  }

  const saveSlug = async () => {
    if (slugStatus !== 'available' && slug !== user?.slug) return
    setSavingSlug(true)
    try {
      await authAPI.updateSlug(slug)
      updateUser({ slug })
      setSlugStatus('idle')
    } catch {
      alert('Erro ao salvar link personalizado.')
    } finally {
      setSavingSlug(false)
    }
  }

  const saveWhatsappMsg = async () => {
    setSavingMsg(true)
    try {
      await authAPI.updateWhatsappMessage(whatsappMsg)
      updateUser({ whatsappMessage: whatsappMsg })
    } catch {
      alert('Erro ao salvar mensagem.')
    } finally {
      setSavingMsg(false)
    }
  }

  const handleToggleRefImages = async (value: boolean) => {
    setRequireRefImages(value)
    setSavingRefImages(true)
    try {
      await authAPI.updateRequireReferenceImages(value)
      updateUser({ requireReferenceImages: value })
    } catch {
      alert('Erro ao salvar configuração.')
      setRequireRefImages(!value) // revert on error
    } finally {
      setSavingRefImages(false)
    }
  }

  const handleAddStyle = () => {
    const trimmed = newStyle.trim()
    if (!trimmed || styles.length >= 30) return
    if (styles.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return
    const updated = [...styles, trimmed]
    setStyles(updated)
    setNewStyle('')
    saveStyles(updated)
  }

  const handleRemoveStyle = (index: number) => {
    const updated = styles.filter((_, i) => i !== index)
    setStyles(updated)
    saveStyles(updated)
  }

  const handleMoveStyle = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= styles.length) return
    const updated = [...styles]
    ;[updated[index], updated[target]] = [updated[target], updated[index]]
    setStyles(updated)
    saveStyles(updated)
  }

  const saveStyles = async (list: string[]) => {
    setSavingStyles(true)
    try {
      const res = await styleAPI.update(list)
      setStyles(res.data)
    } catch {
      alert('Erro ao salvar estilos.')
    } finally {
      setSavingStyles(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-gray-400 text-sm mt-1">Gerencie seu estúdio e preferências</p>
      </div>

      <div className="space-y-4">
        {/* Studio name */}
        <div className="card">
          <h3 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-3">
            Nome do Estúdio
          </h3>
          <input
            value={studioName}
            onChange={(e) => setStudioName(e.target.value)}
            className="input w-full"
            placeholder="Nome do seu estúdio"
            maxLength={80}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleStudioNameSave}
              disabled={savingStudio || studioName.trim().length < 2}
              className="btn-primary text-xs px-4 py-1.5 disabled:opacity-40"
            >
              {savingStudio ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        {/* Custom link / slug */}
        <div className="card">
          <h3 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-3">
            Link Personalizado
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm whitespace-nowrap">
              {window.location.origin}/request/
            </span>
            <input
              value={slug}
              onChange={handleSlugChange}
              className="input flex-1"
              placeholder="seu-link"
              maxLength={40}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs">
              {slugStatus === 'checking' && <span className="text-gray-400">Verificando...</span>}
              {slugStatus === 'available' && <span className="text-green-400">✓ Disponível</span>}
              {slugStatus === 'taken' && <span className="text-red-400">✗ Já está em uso</span>}
              {slugStatus === 'invalid' && (
                <span className="text-yellow-400">
                  Mínimo 3 caracteres (letras, números, - e _)
                </span>
              )}
              {slugStatus === 'idle' && slug && (
                <span className="text-gray-500">Link atual</span>
              )}
            </span>
            <button
              onClick={saveSlug}
              disabled={savingSlug || (slugStatus !== 'available' && slug !== user?.slug)}
              className="btn-primary text-xs px-3 py-1 disabled:opacity-40"
            >
              {savingSlug ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        {/* WhatsApp message */}
        <div className="card">
          <h3 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-3">
            Mensagem do WhatsApp
          </h3>
          <p className="text-gray-500 text-xs mb-3">
            Texto enviado antes do orçamento ao cliente via WhatsApp.
          </p>
          <textarea
            value={whatsappMsg}
            onChange={(e) => setWhatsappMsg(e.target.value)}
            className="input w-full resize-none"
            rows={3}
            placeholder="Olá! Segue o orçamento da sua tatuagem:"
            maxLength={300}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={saveWhatsappMsg}
              disabled={savingMsg}
              className="btn-primary text-xs px-3 py-1 disabled:opacity-40"
            >
              {savingMsg ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        {/* Reference images requirement */}
        <div className="card">
          <h3 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-1">
            Imagens de Referência
          </h3>
          <p className="text-gray-500 text-xs mb-4">
            Quando ativado, os clientes só conseguem enviar a solicitação de orçamento se anexarem ao menos uma imagem de referência. Úbil para garantir que você receba inspirações visuais antes de avaliar o projeto.
          </p>
          <button
            type="button"
            role="switch"
            aria-checked={requireRefImages}
            disabled={savingRefImages}
            onClick={() => handleToggleRefImages(!requireRefImages)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
              requireRefImages ? 'bg-ink-500' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                requireRefImages ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="ml-3 text-sm text-gray-300 align-middle">
            {requireRefImages ? 'Obrigatório' : 'Opcional'}
          </span>
        </div>

        {/* Tattoo Styles */}
        <div className="card">
          <h3 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-1">
            Estilos de Tatuagem
          </h3>
          <p className="text-gray-500 text-xs mb-4">
            Configure os estilos que você trabalha. Eles aparecerão para o cliente na hora de solicitar um orçamento.
          </p>

          {loadingStyles ? (
            <p className="text-gray-500 text-sm">Carregando...</p>
          ) : (
            <>
              {/* Add new style */}
              <div className="flex gap-2 mb-4">
                <input
                  value={newStyle}
                  onChange={(e) => setNewStyle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStyle() } }}
                  className="input flex-1"
                  placeholder="Nome do estilo"
                  maxLength={60}
                />
                <button
                  onClick={handleAddStyle}
                  disabled={!newStyle.trim() || styles.length >= 30 || savingStyles}
                  className="btn-primary text-xs px-4 py-1.5 disabled:opacity-40 whitespace-nowrap"
                >
                  Adicionar
                </button>
              </div>

              {/* Styles list */}
              {styles.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4">
                  Nenhum estilo cadastrado. Os clientes verão uma lista padrão.
                </p>
              ) : (
                <ul className="space-y-2">
                  {styles.map((style, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm text-gray-200">{style}</span>
                      <button
                        type="button"
                        onClick={() => handleMoveStyle(idx, -1)}
                        disabled={idx === 0 || savingStyles}
                        className="text-gray-500 hover:text-white disabled:opacity-20 text-xs px-1"
                        title="Mover para cima"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStyle(idx, 1)}
                        disabled={idx === styles.length - 1 || savingStyles}
                        className="text-gray-500 hover:text-white disabled:opacity-20 text-xs px-1"
                        title="Mover para baixo"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStyle(idx)}
                        disabled={savingStyles}
                        className="text-red-500 hover:text-red-400 disabled:opacity-40 text-xs px-1"
                        title="Remover"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {styles.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">{styles.length}/30 estilos</p>
              )}
              {savingStyles && (
                <p className="text-xs text-gray-500 mt-1">Salvando...</p>
              )}
            </>
          )}
        </div>

        {/* Logout */}
        <div className="card">
          <h3 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-3">
            Conta
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Conectado como <span className="text-white">{user?.email}</span>
          </p>
          <button onClick={handleLogout} className="btn-danger text-sm px-4 py-2">
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
