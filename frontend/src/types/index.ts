export type Role = 'ARTIST' | 'CLIENT'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  studioName?: string
  city?: string
  instagram?: string
  slug?: string
  whatsappMessage?: string
}

export type RequestStatus = 'PENDING' | 'QUOTED' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'CANCELLED'
export type QuoteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface TattooRequest {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  placement: string
  size: string
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
  requestId: string | null
  clientName?: string
  date: string
  startTime: string
  endTime: string
  notes?: string
  createdAt: string
  request?: TattooRequest
}

export interface Availability {
  id: string
  artistId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDuration: number
}

export interface TimeSlot {
  startTime: string
  endTime: string
}
