import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

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
