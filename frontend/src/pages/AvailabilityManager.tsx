import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { availabilityAPI } from '../services/api'
import { Availability } from '../types'

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

interface DaySchedule {
  active: boolean
  startTime: string
  endTime: string
  slotDuration: number
}

const defaultSchedule = (): DaySchedule[] =>
  Array.from({ length: 7 }, (_, i) => ({
    active: i >= 1 && i <= 5, // seg-sex por padrão
    startTime: '09:00',
    endTime: '18:00',
    slotDuration: 60,
  }))

const AvailabilityManager: React.FC = () => {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    availabilityAPI.get(user.id).then((res) => {
      const data: Availability[] = res.data
      if (data.length > 0) {
        const newSchedule = defaultSchedule().map((d) => ({ ...d, active: false }))
        data.forEach((a) => {
          newSchedule[a.dayOfWeek] = {
            active: true,
            startTime: a.startTime,
            endTime: a.endTime,
            slotDuration: a.slotDuration,
          }
        })
        setSchedule(newSchedule)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [user])

  const updateDay = (index: number, updates: Partial<DaySchedule>) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...updates } : d))
    )
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const entries = schedule
      .map((d, i) =>
        d.active
          ? { dayOfWeek: i, startTime: d.startTime, endTime: d.endTime, slotDuration: d.slotDuration }
          : null
      )
      .filter(Boolean) as { dayOfWeek: number; startTime: string; endTime: string; slotDuration: number }[]

    try {
      await availabilityAPI.set(entries)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Carregando...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Meus Horários</h1>
        <p className="text-gray-400 text-sm mt-1">
          Configure os dias e horários em que você está disponível para atendimento.
          Os clientes só poderão agendar nos horários indicados aqui.
        </p>
      </div>

      <div className="space-y-3">
        {schedule.map((day, index) => (
          <div
            key={index}
            className={`card flex flex-col sm:flex-row sm:items-center gap-4 transition-opacity ${
              !day.active ? 'opacity-50' : ''
            }`}
          >
            {/* Toggle + day name */}
            <label className="flex items-center gap-3 sm:w-32 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={day.active}
                onChange={(e) => updateDay(index, { active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-ink-600 focus:ring-ink-500 focus:ring-offset-0"
              />
              <span className={`text-sm font-medium ${day.active ? 'text-white' : 'text-gray-500'}`}>
                {DAYS[index]}
              </span>
            </label>

            {day.active && (
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">De</label>
                  <input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateDay(index, { startTime: e.target.value })}
                    className="input w-auto py-1.5 px-3 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Até</label>
                  <input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateDay(index, { endTime: e.target.value })}
                    className="input w-auto py-1.5 px-3 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Duração do slot</label>
                  <select
                    value={day.slotDuration}
                    onChange={(e) => updateDay(index, { slotDuration: Number(e.target.value) })}
                    className="input w-auto py-1.5 px-3 text-sm"
                  >
                    <option value={30}>30 min</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1h30</option>
                    <option value={120}>2 horas</option>
                    <option value={180}>3 horas</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button onClick={handleSave} className="btn-primary" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Horários'}
        </button>
        {saved && <span className="text-green-400 text-sm">Horários salvos com sucesso!</span>}
      </div>
    </div>
  )
}

export default AvailabilityManager
