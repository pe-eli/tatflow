import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { availabilityAPI } from '../services/api'
import { Availability, AvailabilityBlock, AvailabilityConfig } from '../types'

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

interface DaySchedule {
  active: boolean
  startTime: string
  endTime: string
  lunchStart: string
  lunchEnd: string
  slotDuration: number
}

interface BlockedPeriodDraft {
  date: string
  isFullDay: boolean
  startTime: string
  endTime: string
}

const defaultSchedule = (): DaySchedule[] =>
  Array.from({ length: 7 }, (_, i) => ({
    active: i >= 1 && i <= 5, // seg-sex por padrão
    startTime: '09:00',
    endTime: '18:00',
    lunchStart: '',
    lunchEnd: '',
    slotDuration: 60,
  }))

const emptyBlockedPeriod = (): BlockedPeriodDraft => ({
  date: '',
  isFullDay: true,
  startTime: '',
  endTime: '',
})

const AvailabilityManager: React.FC = () => {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriodDraft[]>([])

  useEffect(() => {
    if (!user) return
    availabilityAPI.get(user.id).then((res) => {
      const data: AvailabilityConfig = res.data
      if (data.schedule.length > 0) {
        const newSchedule = defaultSchedule().map((d) => ({ ...d, active: false }))
        data.schedule.forEach((a: Availability) => {
          newSchedule[a.dayOfWeek] = {
            active: true,
            startTime: a.startTime,
            endTime: a.endTime,
            lunchStart: a.lunchStart || '',
            lunchEnd: a.lunchEnd || '',
            slotDuration: a.slotDuration,
          }
        })
        setSchedule(newSchedule)
        setBlockedPeriods(
          data.blockedPeriods.map((block: AvailabilityBlock) => ({
            date: block.date,
            isFullDay: !block.startTime && !block.endTime,
            startTime: block.startTime || '',
            endTime: block.endTime || '',
          }))
        )
      } else {
        // No availability saved yet — persist the defaults so clients see them immediately
        const defaults = defaultSchedule()
        const scheduleEntries = defaults
          .map((d, i) =>
            d.active
              ? {
                  dayOfWeek: i,
                  startTime: d.startTime,
                  endTime: d.endTime,
                  lunchStart: d.lunchStart || undefined,
                  lunchEnd: d.lunchEnd || undefined,
                  slotDuration: d.slotDuration,
                }
              : null
          )
          .filter(Boolean) as {
            dayOfWeek: number
            startTime: string
            endTime: string
            lunchStart?: string
            lunchEnd?: string
            slotDuration: number
          }[]
        availabilityAPI.set({ schedule: scheduleEntries, blockedPeriods: [] }).catch(() => {})
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

  const updateBlockedPeriod = (index: number, updates: Partial<BlockedPeriodDraft>) => {
    setBlockedPeriods((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)))
    setSaved(false)
  }

  const addBlockedPeriod = () => {
    setBlockedPeriods((prev) => [...prev, emptyBlockedPeriod()])
    setSaved(false)
  }

  const removeBlockedPeriod = (index: number) => {
    setBlockedPeriods((prev) => prev.filter((_, i) => i !== index))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const entries = schedule
      .map((d, i) =>
        d.active
          ? {
              dayOfWeek: i,
              startTime: d.startTime,
              endTime: d.endTime,
              lunchStart: d.lunchStart || undefined,
              lunchEnd: d.lunchEnd || undefined,
              slotDuration: d.slotDuration,
            }
          : null
      )
      .filter(Boolean) as {
        dayOfWeek: number
        startTime: string
        endTime: string
        lunchStart?: string
        lunchEnd?: string
        slotDuration: number
      }[]

    const blockEntries = blockedPeriods
      .filter((block) => block.date)
      .map((block) => ({
        date: block.date,
        startTime: block.isFullDay ? undefined : block.startTime,
        endTime: block.isFullDay ? undefined : block.endTime,
      }))

    try {
      await availabilityAPI.set({ schedule: entries, blockedPeriods: blockEntries })
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
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Almoço</label>
                  <input
                    type="time"
                    value={day.lunchStart}
                    onChange={(e) => updateDay(index, { lunchStart: e.target.value })}
                    className="input w-auto py-1.5 px-3 text-sm"
                  />
                  <span className="text-xs text-gray-500">até</span>
                  <input
                    type="time"
                    value={day.lunchEnd}
                    onChange={(e) => updateDay(index, { lunchEnd: e.target.value })}
                    className="input w-auto py-1.5 px-3 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 card space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-widest">
            Bloqueios Pontuais
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Desative datas inteiras ou apenas faixas de horário específicas sem mexer na sua agenda semanal.
          </p>
        </div>

        <div className="space-y-3">
          {blockedPeriods.length === 0 && (
            <div className="text-sm text-gray-500">Nenhum bloqueio cadastrado.</div>
          )}

          {blockedPeriods.map((block, index) => (
            <div key={`${block.date}-${index}`} className="rounded-xl border border-gray-800 p-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Data</label>
                  <input
                    type="date"
                    value={block.date}
                    onChange={(e) => updateBlockedPeriod(index, { date: e.target.value })}
                    className="input"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={block.isFullDay}
                    onChange={(e) =>
                      updateBlockedPeriod(index, {
                        isFullDay: e.target.checked,
                        startTime: e.target.checked ? '' : block.startTime,
                        endTime: e.target.checked ? '' : block.endTime,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-ink-600 focus:ring-ink-500 focus:ring-offset-0"
                  />
                  Dia inteiro
                </label>
                {!block.isFullDay && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={block.startTime}
                      onChange={(e) => updateBlockedPeriod(index, { startTime: e.target.value })}
                      className="input w-auto py-1.5 px-3 text-sm"
                    />
                    <span className="text-xs text-gray-500">até</span>
                    <input
                      type="time"
                      value={block.endTime}
                      onChange={(e) => updateBlockedPeriod(index, { endTime: e.target.value })}
                      className="input w-auto py-1.5 px-3 text-sm"
                    />
                  </div>
                )}
                <button type="button" onClick={() => removeBlockedPeriod(index)} className="text-sm text-red-400 hover:text-red-300">
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <button type="button" onClick={addBlockedPeriod} className="btn-secondary text-sm">
            Adicionar Bloqueio
          </button>
        </div>
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
