import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { appointmentAPI } from '../services/api'
import { Appointment } from '../types'

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am - 8pm

const CalendarPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    appointmentAPI.list().then((res) => {
      setAppointments(res.data)
      setLoading(false)
    })
  }, [])

  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

  const prevWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }

  const nextWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }

  const getApptsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter((a) => a.date === dateStr)
  }

  const monthLabel = `${currentDate.toLocaleString('pt-BR', { month: 'long' })} ${currentDate.getFullYear()}`

  if (loading) return <div className="text-center py-20 text-gray-500">Carregando agenda...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Agenda</h1>
        <div className="flex items-center gap-4">
          <button onClick={prevWeek} className="btn-secondary text-sm py-1.5 px-3">← Ant.</button>
          <span className="text-gray-300 font-medium">{monthLabel}</span>
          <button onClick={nextWeek} className="btn-secondary text-sm py-1.5 px-3">Prox. →</button>
        </div>
      </div>

      {appointments.length === 0 && (
        <div className="card text-center py-12 mb-6">
          <p className="text-gray-400">Nenhum agendamento ainda.</p>
          <p className="text-gray-600 text-sm mt-1">Aprove solicitações e crie agendamentos para vê-los aqui.</p>
        </div>
      )}

      <div className="card overflow-x-auto">
        <div className="grid grid-cols-8 min-w-[700px]">
          <div className="border-b border-gray-800 py-3" />
          {weekDays.map((day) => {
            const isToday = day.toDateString() === new Date().toDateString()
            return (
              <div
                key={day.toISOString()}
                className={`border-b border-l border-gray-800 py-3 text-center text-sm ${
                  isToday ? 'bg-ink-900/20' : ''
                }`}
              >
                <div className="text-gray-500 font-medium">
                  {day.toLocaleString('pt-BR', { weekday: 'short' })}
                </div>
                <div
                  className={`text-lg font-bold mt-0.5 ${
                    isToday ? 'text-ink-400' : 'text-gray-200'
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            )
          })}
          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              <div className="border-b border-gray-800 py-2 pr-3 text-right text-xs text-gray-600">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {weekDays.map((day) => {
                const dayAppts = getApptsForDay(day).filter((a) => {
                  const startHour = parseInt(a.startTime.split(':')[0])
                  return startHour === hour
                })
                return (
                  <div
                    key={day.toISOString()}
                    className="border-b border-l border-gray-800 min-h-[52px] p-1 relative"
                  >
                    {dayAppts.map((appt) => (
                      <button
                        key={appt.id}
                        onClick={() => navigate(`/requests/${appt.requestId}`)}
                        className="w-full text-left bg-ink-700 hover:bg-ink-600 rounded p-1.5 mb-1 transition-colors"
                      >
                        <div className="text-xs font-semibold text-white truncate">
                          {appt.request?.clientName || 'Cliente'}
                        </div>
                        <div className="text-xs text-ink-300">
                          {appt.startTime} – {appt.endTime}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Próximos Agendamentos</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum agendamento.</p>
        ) : (
          <div className="space-y-3">
            {appointments
              .filter((a) => new Date(a.date) >= new Date())
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((appt) => (
                <button
                  key={appt.id}
                  onClick={() => navigate(`/requests/${appt.requestId}`)}
                  className="card w-full text-left flex items-center justify-between hover:border-gray-700 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">{appt.request?.clientName || 'Cliente'}</div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      {appt.date} · {appt.startTime} – {appt.endTime}
                    </div>
                    {appt.notes && <div className="text-xs text-gray-500 mt-1">{appt.notes}</div>}
                  </div>
                  <span className="text-gray-500 text-sm ml-4">Ver →</span>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarPage
