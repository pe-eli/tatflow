import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { requestAPI, quoteAPI, appointmentAPI } from '../services/api'
import { TattooRequest } from '../types'
import StatusBadge from '../components/StatusBadge'

const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [request, setRequest] = useState<TattooRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [showApptForm, setShowApptForm] = useState(false)
  const [quoteForm, setQuoteForm] = useState({ priceEstimate: '', sessionTime: '', message: '' })
  const [apptForm, setApptForm] = useState({ date: '', startTime: '', endTime: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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

  const handleReject = async () => {
    if (!confirm('Recusar esta solicitação?')) return
    await requestAPI.updateStatus(id!, 'REJECTED')
    fetchRequest()
  }

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await quoteAPI.create({
        requestId: id!,
        priceEstimate: parseFloat(quoteForm.priceEstimate),
        sessionTime: quoteForm.sessionTime,
        message: quoteForm.message,
      })
      setShowQuoteForm(false)
      fetchRequest()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao enviar orçamento')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await appointmentAPI.create({ requestId: id!, ...apptForm })
      setShowApptForm(false)
      fetchRequest()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao criar agendamento')
    } finally {
      setSubmitting(false)
    }
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
            Enviado em {new Date(request.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="card mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Dados do Cliente</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Email</div>
            <div className="text-white">{request.clientEmail}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">WhatsApp</div>
            <div className="text-white">{request.clientPhone}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Data Preferida</div>
            <div className="text-white">{request.preferredDate || '—'} {request.preferredTime}</div>
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
            <div className="text-white">{request.size === 'SMALL' ? 'Pequena' : request.size === 'MEDIUM' ? 'Média' : 'Grande'}</div>
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
        </div>
      )}

      {request.appointment && (
        <div className="card mb-4 border-purple-800">
          <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wide mb-4">Agendamento</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Data</div>
              <div className="text-white">{request.appointment.date}</div>
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

      {request.status !== 'REJECTED' && request.status !== 'SCHEDULED' && (
        <div className="flex flex-wrap gap-3 mt-6">
          {!request.quote && (
            <button onClick={() => setShowQuoteForm(!showQuoteForm)} className="btn-primary">
              Enviar Orçamento
            </button>
          )}
          {(request.status === 'APPROVED' || request.status === 'QUOTED') && !request.appointment && (
            <button onClick={() => setShowApptForm(!showApptForm)} className="btn-secondary">
              Agendar Sessão
            </button>
          )}
          {request.status === 'PENDING' && (
            <button onClick={handleReject} className="btn-danger">
              Recusar
            </button>
          )}
        </div>
      )}
      {showQuoteForm && (
        <form onSubmit={handleQuoteSubmit} className="card mt-4 space-y-4">
          <h3 className="font-semibold text-white">Enviar Orçamento</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Valor Estimado (R$) *</label>
              <input
                type="number" min="0" step="0.01"
                value={quoteForm.priceEstimate}
                onChange={(e) => setQuoteForm({ ...quoteForm, priceEstimate: e.target.value })}
                className="input" placeholder="350" required
              />
            </div>
            <div>
              <label className="label">Duração da Sessão *</label>
              <input
                value={quoteForm.sessionTime}
                onChange={(e) => setQuoteForm({ ...quoteForm, sessionTime: e.target.value })}
                className="input" placeholder="2 a 3 horas" required
              />
            </div>
          </div>
          <div>
            <label className="label">Mensagem para o Cliente *</label>
            <textarea
              value={quoteForm.message}
              onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
              className="input min-h-[100px] resize-none"
              placeholder="Oi! Adorei sua ideia. Segue meu orçamento..."
              required
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar Orçamento'}
            </button>
            <button type="button" onClick={() => setShowQuoteForm(false)} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {showApptForm && (
        <form onSubmit={handleApptSubmit} className="card mt-4 space-y-4">
          <h3 className="font-semibold text-white">Criar Agendamento</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Data *</label>
              <input type="date" value={apptForm.date} onChange={(e) => setApptForm({ ...apptForm, date: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Horário de Início *</label>
              <input type="time" value={apptForm.startTime} onChange={(e) => setApptForm({ ...apptForm, startTime: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Horário de Término *</label>
              <input type="time" value={apptForm.endTime} onChange={(e) => setApptForm({ ...apptForm, endTime: e.target.value })} className="input" required />
            </div>
          </div>
          <div>
            <label className="label">Observações</label>
            <input value={apptForm.notes} onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })} className="input" placeholder="Alguma observação para a sessão..." />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Agendando...' : 'Criar Agendamento'}
            </button>
            <button type="button" onClick={() => setShowApptForm(false)} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default RequestDetails
