import React from 'react'
import { RequestStatus, QuoteStatus } from '../types'

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' },
  QUOTED: { label: 'Orçado', className: 'bg-blue-900/50 text-blue-300 border border-blue-700' },
  APPROVED: { label: 'Aprovado', className: 'bg-green-900/50 text-green-300 border border-green-700' },
  REJECTED: { label: 'Recusado', className: 'bg-red-900/50 text-red-300 border border-red-700' },
  SCHEDULED: { label: 'Agendado', className: 'bg-purple-900/50 text-purple-300 border border-purple-700' },
  ACCEPTED: { label: 'Aceito', className: 'bg-green-900/50 text-green-300 border border-green-700' },
}

interface Props {
  status: RequestStatus | QuoteStatus | string
}

const StatusBadge: React.FC<Props> = ({ status }) => {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-800 text-gray-300' }
  return <span className={`badge ${config.className}`}>{config.label}</span>
}

export default StatusBadge
