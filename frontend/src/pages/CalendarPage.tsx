import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { appointmentAPI } from '../services/api'
import { Appointment } from '../types'

interface ManualForm {
  clientName: string
  date: string
  startTime: string
  endTime: string
  notes: string
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const CalendarPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newForm, setNewForm] = useState<ManualForm>({ clientName: '', date: '', startTime: '', endTime: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const loadAppointments = () => {
    appointmentAPI.list().then((res) => {
      setAppointments(res.data)
      setLoading(false)
    })
  }

  useEffect(() => { loadAppointments() }, [])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = new Date().toISOString().split('T')[0]

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const toDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const hasAppts = (day: number) => appointments.some((a) => a.date === toDateStr(day))

  const apptsForSelected = selectedDay
    ? appointments
        .filter((a) => a.date === selectedDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    : []

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const monthLabel = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  if (loading) return <div className="text-center py-20 text-gray-500">Carregando agenda...</div>

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.clientName || !newForm.date || !newForm.startTime || !newForm.endTime) return
    setSaving(true)
    try {
      await appointmentAPI.createManual(newForm)
      setNewForm({ clientName: '', date: '', startTime: '', endTime: '', notes: '' })
      setShowNewModal(false)
      loadAppointments()
    } catch {
      alert('Erro ao criar agendamento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Agenda</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Agendamento
        </button>
      </div>

      {/* Manual appointment modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Novo Agendamento</h2>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label className="label">Nome do Cliente *</label>
                <input
                  className="input w-full"
                  value={newForm.clientName}
                  onChange={(e) => setNewForm({ ...newForm, clientName: e.target.value })}
                  placeholder="Nome do cliente"
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="label">Data *</label>
                <input
                  type="date"
                  className="input w-full"
                  value={newForm.date}
                  onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Início *</label>
                  <input
                    type="time"
                    className="input w-full"
                    value={newForm.startTime}
                    onChange={(e) => setNewForm({ ...newForm, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Fim *</label>
                  <input
                    type="time"
                    className="input w-full"
                    value={newForm.endTime}
                    onChange={(e) => setNewForm({ ...newForm, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Notas (opcional)</label>
                <textarea
                  className="input w-full resize-none"
                  value={newForm.notes}
                  onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                  rows={2}
                  maxLength={300}
                  placeholder="Estilo, tamanho, local..."
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-40">
                  {saving ? 'Salvando...' : 'Criar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Month calendar card */}
      <div className="card mb-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white font-semibold capitalize">{monthLabel}</span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEK_DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />
            const dateStr = toDateStr(day)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDay
            const hasDot = hasAppts(day)

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={`relative flex flex-col items-center justify-center w-9 h-9 mx-auto rounded-full text-sm font-medium transition-colors
                  ${isSelected
                    ? 'bg-ink-600 text-white'
                    : isToday
                    ? 'ring-1 ring-ink-500 text-ink-400 hover:bg-gray-800'
                    : 'text-gray-300 hover:bg-gray-800'
                  }`}
              >
                {day}
                {hasDot && (
                  <span
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-ink-400'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDay && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </h2>
          {apptsForSelected.length === 0 ? (
            <div className="card text-center py-6">
              <p className="text-gray-500 text-sm">Nenhum agendamento neste dia.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {apptsForSelected.map((appt) => (
                <button
                  key={appt.id}
                  onClick={() => appt.requestId ? navigate(`/requests/${appt.requestId}`) : undefined}
                  className={`card w-full text-left flex items-center gap-4 transition-colors ${appt.requestId ? 'hover:border-gray-700 cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="w-1 self-stretch rounded-full bg-ink-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">
                      {appt.clientName || appt.request?.clientName || 'Cliente'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {appt.startTime} – {appt.endTime}
                    </div>
                    {appt.notes && (
                      <div className="text-xs text-gray-500 mt-1 truncate">{appt.notes}</div>
                    )}
                  </div>
                  {appt.requestId && <span className="text-gray-600 text-xs flex-shrink-0">Ver →</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming appointments */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Próximos Agendamentos</h2>
        {appointments.filter((a) => a.date >= todayStr).length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-400">Nenhum agendamento futuro.</p>
            <p className="text-gray-600 text-sm mt-1">
              Confirme solicitações para criar agendamentos.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments
              .filter((a) => a.date >= todayStr)
              .sort(
                (a, b) =>
                  a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
              )
              .map((appt) => (
                <button
                  key={appt.id}
                  onClick={() => appt.requestId ? navigate(`/requests/${appt.requestId}`) : undefined}
                  className={`card w-full text-left flex items-center justify-between transition-colors ${appt.requestId ? 'hover:border-gray-700 cursor-pointer' : 'cursor-default'}`}
                >
                  <div>
                    <div className="font-semibold text-white">
                      {appt.clientName || appt.request?.clientName || 'Cliente'}
                    </div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      {appt.date.split('-').reverse().join('/')} · {appt.startTime} –{' '}
                      {appt.endTime}
                    </div>
                    {appt.notes && (
                      <div className="text-xs text-gray-500 mt-1">{appt.notes}</div>
                    )}
                  </div>
                  {appt.requestId && <span className="text-gray-500 text-sm ml-4">Ver →</span>}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarPage
