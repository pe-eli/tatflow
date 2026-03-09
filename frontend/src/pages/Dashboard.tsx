import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { requestAPI } from '../services/api'
import { TattooRequest } from '../types'
import StatusBadge from '../components/StatusBadge'

const TABS = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PENDING', label: 'Novos' },
  { key: 'QUOTED', label: 'Orçados' },
  { key: 'APPROVED', label: 'Aprovados' },
  { key: 'SCHEDULED', label: 'Agendados' },
  { key: 'REJECTED', label: 'Recusados' },
  { key: 'CANCELLED', label: 'Cancelados' },
] as const

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<TattooRequest[]>([])
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const requestLink = `${window.location.origin}/request/${user?.slug || user?.id}`

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const status = activeTab === 'ALL' ? undefined : activeTab
        const res = await requestAPI.list(status)
        setRequests(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [activeTab])

  const counts = requests.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const copyLink = () => {
    navigator.clipboard.writeText(requestLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Painel</h1>
          <p className="text-gray-400 text-sm mt-1">
            {user?.studioName || user?.name}
          </p>
        </div>
        <button onClick={copyLink} className={`btn-secondary flex items-center gap-2 text-sm transition-colors ${copied ? 'border-green-600 text-green-400' : ''}`}>
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copiado!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar Link de Solicitação
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: requests.length, color: 'text-white' },
          { label: 'Pendentes', value: counts['PENDING'] || 0, color: 'text-yellow-400' },
          { label: 'Orçados', value: counts['QUOTED'] || 0, color: 'text-blue-400' },
          { label: 'Agendados', value: counts['SCHEDULED'] || 0, color: 'text-purple-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-gray-400 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg p-1 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === key
                ? 'bg-ink-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Request list */}
      <div key={activeTab} className="tab-enter">
      {loading ? (
        <div className="text-center py-16 text-gray-500">Carregando...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">Nenhuma solicitação encontrada.</p>
          <p className="text-gray-600 text-sm mt-2">
            Compartilhe seu link de solicitação com clientes para começar a receber pedidos.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Link
              key={req.id}
              to={`/requests/${req.id}`}
              className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-700 transition-colors cursor-pointer block"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-white">{req.clientName}</span>
                  <StatusBadge status={req.status} />
                </div>
                <div className="text-sm text-gray-400 flex flex-wrap gap-2">
                  <span className="bg-gray-800 px-2.5 py-0.5 rounded-full">{req.style}</span>
                  <span className="bg-gray-800 px-2.5 py-0.5 rounded-full">{req.size} cm</span>
                  <span className="bg-gray-800 px-2.5 py-0.5 rounded-full capitalize">{req.placement}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(req.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {req.quote && (
                  <span className="text-ink-400 font-semibold text-sm">
                    R$ {req.quote.priceEstimate}
                  </span>
                )}
                <span className="text-gray-500 text-sm">Ver →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

export default Dashboard
