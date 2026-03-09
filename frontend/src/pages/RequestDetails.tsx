import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { requestAPI, appointmentAPI, availabilityAPI } from '../services/api'
import { TattooRequest } from '../types'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'

const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [request, setRequest] = useState<TattooRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [manualSteps, setManualSteps] = useState({ orcado: false, agendado: false })

  const fetchRequest = async () => {
    try {
      const res = await requestAPI.get(id!)
      setRequest(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequest() }, [id])

  const openWhatsApp = () => {
    if (!request) return
    const phone = request.clientPhone.replace(/\D/g, '')
    const fullPhone = phone.length <= 11 ? `55${phone}` : phone
    const baseMsg = user?.whatsappMessage || 'Olá! Segue o orçamento da sua tatuagem:'
    const quoteInfo = request.quote
      ? `\n\nValor: R$ ${request.quote.priceEstimate}\nDuração: ${request.quote.sessionTime}\n\n${request.quote.message}`
      : ''
    const text = encodeURIComponent(`${baseMsg}${quoteInfo}`)
    window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank')
  }

  const closeSendModal = () => setShowSendModal(false)

  const openWhatsAppDirect = () => {
    if (!request) return
    const phone = request.clientPhone.replace(/\D/g, '')
    const fullPhone = phone.length <= 11 ? `55${phone}` : phone
    window.open(`https://wa.me/${fullPhone}`, '_blank')
  }

  const handleWhatsAppSend = () => {
    openWhatsApp()
    closeSendModal()
  }

  const addHours = (time: string, h: number): string => {
    if (!time) return '00:00'
    const [hh, mm] = time.split(':').map(Number)
    return `${String(Math.min(hh + h, 23)).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }

  const handleConfirm = async () => {
    if (!request) return
    if (request.preferredDate && request.preferredTime) {
      try {
        let endTime = addHours(request.preferredTime, 2)
        try {
          const slotsRes = await availabilityAPI.getSlots(request.artistId, request.preferredDate)
          const match = (slotsRes.data.slots as { startTime: string; endTime: string }[])
            ?.find((s) => s.startTime === request.preferredTime)
          if (match?.endTime) endTime = match.endTime
        } catch { /* use 2h fallback */ }
        await appointmentAPI.create({
          requestId: id!,
          date: request.preferredDate,
          startTime: request.preferredTime,
          endTime,
        })
      } catch {
        await requestAPI.updateStatus(id!, 'APPROVED')
      }
    } else {
      await requestAPI.updateStatus(id!, 'APPROVED')
    }
    fetchRequest()
  }

  const handleCancelAppointment = () => {
    if (!request?.appointment) return
    setShowCancelConfirm(true)
  }

  const confirmCancelAppointment = async () => {
    setShowCancelConfirm(false)
    if (!request?.appointment) return
    await appointmentAPI.cancel(request.appointment.id)
    fetchRequest()
  }

  const handleReject = async () => {
    if (!confirm('Recusar esta solicitação?')) return
    await requestAPI.updateStatus(id!, 'REJECTED')
    fetchRequest()
  }



  if (loading) return <div className="text-center py-20 text-gray-500">Carregando...</div>
  if (!request) return <div className="text-center py-20 text-gray-500">Solicitação não encontrada.</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1">
        ← Voltar ao Painel
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{request.clientName}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Enviado em {new Date(request.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {['APPROVED', 'QUOTED', 'SCHEDULED', 'CANCELLED'].includes(request.status) && (
        <div className="card mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-5">Andamento</h2>
          <div className="relative flex justify-between">
            <div
              className="absolute top-4 h-px bg-gray-700"
              style={{ left: 'calc(16.67% + 1rem)', right: 'calc(16.67% + 1rem)' }}
            />
            {[
              {
                label: 'Confirmado',
                desc: 'Solicitação aceita',
                done: true,
                fixed: true,
              },
              {
                label: 'Orçado',
                desc: manualSteps.orcado ? 'Concluído' : 'Pendente',
                done: manualSteps.orcado,
                fixed: false,
                toggle: () => setManualSteps((s) => ({ ...s, orcado: !s.orcado })),
              },
              {
                label: 'Agendado',
                desc: manualSteps.agendado ? 'Concluído' : 'Pendente',
                done: manualSteps.agendado,
                fixed: false,
                toggle: () => setManualSteps((s) => ({ ...s, agendado: !s.agendado })),
              },
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center w-1/3">
                <button
                  type="button"
                  disabled={step.fixed}
                  onClick={step.fixed ? undefined : step.toggle}
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    step.done
                      ? 'bg-ink-600'
                      : 'bg-gray-800 border border-gray-700'
                  } ${
                    !step.fixed ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {step.done ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-600" />
                  )}
                </button>
                <div className={`text-xs font-semibold text-center ${step.done ? 'text-white' : 'text-gray-500'}`}>
                  {step.label}
                </div>
                <div className="text-xs text-gray-500 text-center mt-0.5 leading-tight">{step.desc}</div>
                {!step.fixed && (
                  <div className="text-xs text-gray-600 mt-1">{step.done ? 'Clique para desfazer' : 'Clique para marcar'}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Dados do Cliente</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Email</div>
            <div className="text-white">{request.clientEmail}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">WhatsApp</div>
            <div className="flex items-center gap-2">
              <div className="text-white">{request.clientPhone}</div>
              <button
                type="button"
                onClick={openWhatsAppDirect}
                title="Abrir WhatsApp"
                className="flex-shrink-0 w-7 h-7 rounded-full bg-green-700 hover:bg-green-600 flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.603-1.148A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.315 0-4.458-.773-6.17-2.076l-.246-.19-3.047.76.822-3.002-.214-.266A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                </svg>
              </button>
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Data Agendada</div>
            <div className="text-white">{request.preferredDate ? request.preferredDate.split('-').reverse().join('/') : '—'} {request.preferredTime}</div>
          </div>
        </div>
      </div>
      <div className="card mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Detalhes da Tatuagem</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <div className="text-gray-500 mb-1">Localização</div>
            <div className="text-white">{request.placement}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Tamanho</div>
            <div className="text-white">{request.size} cm</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Estilo</div>
            <div className="text-white">{request.style}</div>
          </div>
        </div>
        <div>
          <div className="text-gray-500 text-sm mb-1">Descrição</div>
          <p className="text-gray-300 text-sm leading-relaxed">{request.description}</p>
        </div>
        {request.referenceImages.length > 0 && (
          <div className="mt-4">
            <div className="text-gray-500 text-sm mb-2">Imagens de Referência</div>
            <div className="flex flex-wrap gap-3">
              {request.referenceImages.map((img, i) => (
                <a key={i} href={img} target="_blank" rel="noreferrer">
                  <img
                    src={img}
                    alt={`Referência ${i + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-700 hover:opacity-80 transition"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {request.quote && (
        <div className="card mb-4 border-blue-800">
          <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-4">Orçamento Enviado</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm mb-3">
            <div>
              <div className="text-gray-500 mb-1">Valor Estimado</div>
              <div className="text-white font-semibold text-lg">R$ {request.quote.priceEstimate}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Duração da Sessão</div>
              <div className="text-white">{request.quote.sessionTime}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Status do Orçamento</div>
              <StatusBadge status={request.quote.status} />
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm mb-1">Mensagem para o Cliente</div>
            <p className="text-gray-300 text-sm">{request.quote.message}</p>
          </div>
          <button
            onClick={() => setShowSendModal(true)}
            className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.603-1.148A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.315 0-4.458-.773-6.17-2.076l-.246-.19-3.047.76.822-3.002-.214-.266A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
            Enviar Orçamento
          </button>
        </div>
      )}

      {request.appointment && (
        <div className="card mb-4 border-purple-800">
          <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wide mb-4">Agendamento</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Data</div>
              <div className="text-white">{request.appointment.date.split('-').reverse().join('/')}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Horário</div>
              <div className="text-white">{request.appointment.startTime} – {request.appointment.endTime}</div>
            </div>
            {request.appointment.notes && (
              <div className="sm:col-span-3">
                <div className="text-gray-500 mb-1">Observações</div>
                <div className="text-gray-300">{request.appointment.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {request.status !== 'REJECTED' && (
        <div className="flex flex-wrap gap-3 mt-6">
          {request.status === 'PENDING' && (
            <button onClick={handleConfirm} className="btn-primary">
              Confirmar
            </button>
          )}
          {(request.status === 'APPROVED' || request.status === 'SCHEDULED') && !request.quote && (
            <button onClick={() => setShowSendModal(true)} className="btn-primary">
              Enviar Orçamento
            </button>
          )}
          {request.appointment && (
            <button onClick={handleCancelAppointment} className="btn-danger">
              Cancelar Agendamento
            </button>
          )}
          {request.status === 'PENDING' && (
            <button onClick={handleReject} className="btn-danger">
              Recusar
            </button>
          )}
        </div>
      )}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closeSendModal}>
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-1">Enviar Orçamento</h3>
            <p className="text-gray-400 text-sm mb-6">Escolha como deseja enviar o orçamento ao cliente.</p>

            <div className="space-y-3">
              {/* Email - disabled */}
              <button
                disabled
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-700 opacity-40 cursor-not-allowed bg-gray-800"
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-300">Email</div>
                  <div className="text-xs text-gray-500">Em breve</div>
                </div>
                <span className="ml-auto text-xs bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">Indisponível</span>
              </button>

              {/* WhatsApp - enabled */}
              <button
                onClick={handleWhatsAppSend}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-green-700 bg-green-900/20 hover:bg-green-900/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.603-1.148A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.315 0-4.458-.773-6.17-2.076l-.246-.19-3.047.76.822-3.002-.214-.266A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-green-300">WhatsApp</div>
                  <div className="text-xs text-gray-400">Abrir conversa diretamente com o cliente</div>
                </div>
                <svg className="ml-auto w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <button
              onClick={closeSendModal}
              className="mt-5 w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Cancelar Agendamento</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Tem certeza que deseja cancelar este agendamento? O status da solicitação será alterado para <span className="text-orange-300 font-medium">Cancelado</span>.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="btn-secondary flex-1"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={confirmCancelAppointment}
                className="btn-danger flex-1"
              >
                Confirmar Cancel.
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default RequestDetails
