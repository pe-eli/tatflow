export type Role = 'ARTIST' | 'CLIENT'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  studioName?: string
  city?: string
  instagram?: string
}

export type RequestStatus = 'PENDING' | 'QUOTED' | 'APPROVED' | 'REJECTED' | 'SCHEDULED'
export type Size = 'SMALL' | 'MEDIUM' | 'LARGE'
export type QuoteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface TattooRequest {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  placement: string
  size: Size
  style: string
  description: string
  referenceImages: string[]
  preferredDate: string
  preferredTime: string
  status: RequestStatus
  artistId: string
  createdAt: string
  quote?: Quote
  appointment?: Appointment
}

export interface Quote {
  id: string
  requestId: string
  priceEstimate: number
  sessionTime: string
  message: string
  status: QuoteStatus
  createdAt: string
}

export interface Appointment {
  id: string
  artistId: string
  requestId: string
  date: string
  startTime: string
  endTime: string
  notes?: string
  createdAt: string
  request?: TattooRequest
}
