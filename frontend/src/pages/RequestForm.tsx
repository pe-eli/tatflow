import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { requestAPI } from '../services/api'

const PLACEMENTS = [
  'Braço', 'Antebraço', 'Braço Superior', 'Pulso', 'Mão', 'Peito', 'Costas', 'Ombro',
  'Costela', 'Quadril', 'Coxa', 'Panturrilha', 'Tornozelo', 'Pé', 'Pescoço', 'Atrás da Orelha', 'Outro',
]

const STYLES = [
  'Traço Fino', 'Realismo', 'Tradicional', 'Neo-Tradicional', 'Blackwork',
  'Geométrico', 'Aquarela', 'Japonesa', 'Tribal', 'Minimalista', 'Outro',
]

const RequestForm: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const [form, setForm] = useState({
    clientName: '', clientEmail: '', clientPhone: '',
    placement: PLACEMENTS[0], size: 'MEDIUM', style: STYLES[0],
    description: '', preferredDate: '', preferredTime: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files).slice(0, 5))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('artistId', artistId!)
      files.forEach((f) => fd.append('referenceImages', f))
      await requestAPI.create(fd)
      setSubmitted(true)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(message || 'Falha ao enviar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-3">Solicitação Enviada!</h1>
          <p className="text-gray-400 leading-relaxed">
            Sua solicitação de tatuagem foi enviada com sucesso. O tatuador vai analisá-la e entrar
            em contato em breve pelo e-mail <strong className="text-white">{form.clientEmail}</strong>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Solicitar Orçamento de Tatuagem</h1>
        <p className="text-gray-400 mt-2">Preencha os detalhes abaixo e o tatuador retornará em breve.</p>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-4">
              Seus Dados
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Nome *</label>
                <input name="clientName" value={form.clientName} onChange={handleChange} className="input" placeholder="Seu nome completo" required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input name="clientEmail" type="email" value={form.clientEmail} onChange={handleChange} className="input" placeholder="seu@email.com" required />
              </div>
              <div>
                <label className="label">WhatsApp / Telefone *</label>
                <input name="clientPhone" value={form.clientPhone} onChange={handleChange} className="input" placeholder="(11) 99999-9999" required />
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-4">
              Detalhes da Tatuagem
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Localização no Corpo *</label>
                <select name="placement" value={form.placement} onChange={handleChange} className="input">
                  {PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tamanho Aproximado *</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'SMALL', label: 'Pequena' },
                    { key: 'MEDIUM', label: 'Média' },
                    { key: 'LARGE', label: 'Grande' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, size: key })}
                      className={`py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        form.size === key
                          ? 'border-ink-500 bg-ink-900/30 text-ink-300'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Estilo *</label>
                <select name="style" value={form.style} onChange={handleChange} className="input">
                  {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Descrição *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="input min-h-[120px] resize-none"
                  placeholder="Descreva sua ideia de tatuagem com o máximo de detalhes possível..."
                  required
                />
              </div>
              <div>
                <label className="label">Imagens de Referência (até 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFiles}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-ink-700 file:text-white hover:file:bg-ink-600 cursor-pointer"
                />
                {files.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{files.length} arquivo(s) selecionado(s)</p>
                )}
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-4">
              Disponibilidade
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Data Preferida</label>
                <input name="preferredDate" type="date" value={form.preferredDate} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Horário Preferido</label>
                <input name="preferredTime" type="time" value={form.preferredTime} onChange={handleChange} className="input" />
              </div>
            </div>
          </section>
          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-700 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <button type="submit" className="btn-primary w-full text-base py-3" disabled={loading}>
            {loading ? 'Enviando...' : 'Solicitar Orçamento'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RequestForm
