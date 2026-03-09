import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { requestAPI, availabilityAPI } from '../services/api'
import { Availability, TimeSlot } from '../types'
import { BodySelector, BodyPartSelection, BODY_REGION_LABELS } from '../components/BodySelector'

const STYLES = [
  'Traço Fino', 'Realismo', 'Tradicional', 'Neo-Tradicional', 'Blackwork',
  'Geométrico', 'Aquarela', 'Japonesa', 'Tribal', 'Minimalista', 'Outro',
]

/** Apply visual phone mask: (XX) XXXXX-XXXX */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const RequestForm: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [artistName, setArtistName] = useState('')
  const [resolvedArtistId, setResolvedArtistId] = useState<string | null>(null)
  const [loadingArtist, setLoadingArtist] = useState(true)

  // Availability state
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  // Calendar navigation
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [form, setForm] = useState({
    clientName: '', clientEmail: '', clientPhone: '',
    placement: '', size: '', style: STYLES[0],
    description: '',
  })

  // Resolve artist by slug or ID
  useEffect(() => {
    if (!artistId) return
    requestAPI.resolveArtist(artistId).then((res) => {
      setResolvedArtistId(res.data.id)
      setArtistName(res.data.studioName || res.data.name)
      setLoadingArtist(false)
    }).catch(() => {
      setLoadingArtist(false)
      setError('Tatuador não encontrado.')
    })
  }, [artistId])

  // Fetch artist availability on mount
  useEffect(() => {
    if (!resolvedArtistId) return
    availabilityAPI.get(resolvedArtistId).then((res) => {
      setAvailability(res.data)
      setLoadingAvailability(false)
    }).catch(() => setLoadingAvailability(false))
  }, [resolvedArtistId])

  // Fetch slots when date is selected
  useEffect(() => {
    if (!selectedDate || !resolvedArtistId) return
    setLoadingSlots(true)
    setSelectedSlot(null)
    availabilityAPI.getSlots(resolvedArtistId, selectedDate).then((res) => {
      setSlots(res.data.slots)
      setLoadingSlots(false)
    }).catch(() => setLoadingSlots(false))
  }, [selectedDate, artistId])

  // Available days of the week (Set of dayOfWeek numbers)
  const availableDays = new Set(availability.map((a) => a.dayOfWeek))

  // Calendar helpers
  const calendarDays = useCallback(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const cells: { date: Date; enabled: boolean; isCurrentMonth: boolean }[] = []

    // Leading blanks
    for (let i = 0; i < firstDay; i++) {
      const d = new Date(year, month, -firstDay + i + 1)
      cells.push({ date: d, enabled: false, isCurrentMonth: false })
    }

    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const dayOfWeek = date.getDay()
      const inFuture = date >= today
      const enabled = inFuture && availableDays.has(dayOfWeek)
      cells.push({ date, enabled, isCurrentMonth: true })
    }

    // Trailing blanks
    const remaining = 7 - (cells.length % 7)
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i)
        cells.push({ date: d, enabled: false, isCurrentMonth: false })
      }
    }

    return cells
  }, [calendarMonth, availableDays])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, clientPhone: formatPhone(e.target.value) })
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files).slice(0, 5))
  }

  const selectDate = (dateStr: string) => {
    setSelectedDate(dateStr)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedDate || !selectedSlot) {
      setError('Selecione uma data e horário disponível.')
      return
    }

    if (!form.placement || !form.size) {
      setError('Selecione a localização e o tamanho da tatuagem no modelo 3D.')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, k === 'clientPhone' ? v.replace(/\D/g, '') : v)
      })
      fd.append('artistId', resolvedArtistId!)
      fd.append('preferredDate', selectedDate)
      fd.append('preferredTime', selectedSlot.startTime)
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

  const formatDateLabel = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-3">Solicitação Enviada!</h1>
          <p className="text-gray-400 leading-relaxed">
            Sua solicitação de tatuagem foi enviada com sucesso. O tatuador vai analisá-la e entrar
            em contato pelo seu WhatsApp <strong className="text-white">{form.clientPhone}</strong>.
          </p>
        </div>
      </div>
    )
  }

  if (loadingArtist) {
    return <div className="text-center py-20 text-gray-500">Carregando...</div>
  }

  if (!resolvedArtistId) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg font-semibold">Tatuador não encontrado</p>
        <p className="text-gray-500 text-sm mt-2">Verifique se o link está correto.</p>
      </div>
    )
  }

  const monthLabel = calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const days = calendarDays()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Solicitar Orçamento de Tatuagem</h1>
        {artistName && <p className="text-gray-300 mt-1">Tatuador(a): <strong>{artistName}</strong></p>}
        <p className="text-gray-400 mt-2">Preencha os detalhes abaixo e o tatuador retornará em breve.</p>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seus Dados */}
          <section>
            <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-4">
              Seus Dados
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Nome *</label>
                <input name="clientName" value={form.clientName} onChange={handleChange} className="input" placeholder="Seu nome completo" maxLength={50} required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input name="clientEmail" type="email" value={form.clientEmail} onChange={handleChange} className="input" placeholder="seu@email.com" maxLength={50} required />
              </div>
              <div>
                <label className="label">WhatsApp / Telefone *</label>
                <input name="clientPhone" value={form.clientPhone} onChange={handlePhoneChange} className="input" placeholder="(11) 99999-9999" required />
                <p className="text-xs text-gray-500 mt-1">Este número será usado pelo tatuador para enviar o orçamento via WhatsApp.</p>
              </div>
            </div>
          </section>

          {/* Detalhes da Tatuagem */}
          <section>
            <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-4">
              Detalhes da Tatuagem
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Localização e Tamanho *</label>
                <BodySelector
                  onSelect={(data: BodyPartSelection) => {
                    setForm((prev) => ({
                      ...prev,
                      placement: data.bodyParts.map((bp) => BODY_REGION_LABELS[bp]).join(', '),
                      size: String(data.estimatedCm),
                    }))
                  }}
                />
                {form.placement && form.size && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selecionado: <strong className="text-gray-300">{form.placement}</strong> — {form.size} cm
                  </p>
                )}
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
                  maxLength={300}
                  required
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{form.description.length}/300</p>
              </div>
              <div>
                <label className="label">Imagens de Referência (até 5)</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="inline-flex items-center gap-2 bg-ink-700 hover:bg-ink-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Escolher arquivos
                  </span>
                  <span className="text-sm text-gray-500">
                    {files.length > 0 ? `${files.length} arquivo(s) selecionado(s)` : 'Nenhum arquivo selecionado'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFiles}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Disponibilidade */}
          <section>
            <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-4">
              Disponibilidade
            </h2>

            {loadingAvailability ? (
              <div className="text-gray-500 text-sm py-4">Carregando disponibilidade...</div>
            ) : availability.length === 0 ? (
              <div className="rounded-lg bg-yellow-900/20 border border-yellow-700 p-4 text-sm text-yellow-300">
                O tatuador ainda não configurou seus horários de atendimento. Escolha uma data e horário de sua preferência.
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="label">Data Preferida</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Horário Preferido</label>
                    <input
                      type="time"
                      value={selectedSlot?.startTime || ''}
                      onChange={(e) => setSelectedSlot({ startTime: e.target.value, endTime: '' })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Calendar */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
                      }
                      className="text-gray-400 hover:text-white text-sm px-2 py-1"
                    >
                      ←
                    </button>
                    <span className="text-gray-200 font-medium capitalize text-sm">{monthLabel}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
                      }
                      className="text-gray-400 hover:text-white text-sm px-2 py-1"
                    >
                      →
                    </button>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                      <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map(({ date, enabled, isCurrentMonth }, idx) => {
                      const dateStr = date.toISOString().split('T')[0]
                      const isSelected = dateStr === selectedDate
                      const isToday = date.toDateString() === new Date().toDateString()

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!enabled}
                          onClick={() => enabled && selectDate(dateStr)}
                          className={`py-2 rounded-md text-sm transition-colors ${
                            !isCurrentMonth
                              ? 'text-gray-700'
                              : isSelected
                              ? 'bg-ink-600 text-white font-semibold'
                              : enabled
                              ? 'text-gray-200 hover:bg-gray-800 cursor-pointer'
                              : 'text-gray-700 cursor-not-allowed'
                          } ${isToday && !isSelected ? 'ring-1 ring-ink-500/50' : ''}`}
                        >
                          {date.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Selected date info */}
                {selectedDate && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-300 mb-3">
                      Horários disponíveis em{' '}
                      <strong className="text-white">{formatDateLabel(new Date(selectedDate + 'T12:00:00'))}</strong>:
                    </p>

                    {loadingSlots ? (
                      <div className="text-gray-500 text-sm">Carregando horários...</div>
                    ) : slots.length === 0 ? (
                      <div className="text-yellow-400 text-sm">
                        Nenhum horário disponível nesta data. Escolha outra data.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => {
                          const isSelected =
                            selectedSlot?.startTime === slot.startTime &&
                            selectedSlot?.endTime === slot.endTime
                          return (
                            <button
                              key={slot.startTime}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 px-4 rounded-lg text-sm font-medium border-2 transition-colors ${
                                isSelected
                                  ? 'border-ink-500 bg-ink-900/30 text-ink-300'
                                  : 'border-gray-700 text-gray-300 hover:border-gray-600'
                              }`}
                            >
                              {slot.startTime}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {selectedSlot && (
                      <p className="text-xs text-gray-500 mt-2">
                        Horário selecionado: {selectedSlot.startTime} – {selectedSlot.endTime}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
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
