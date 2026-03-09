export type BodyRegion =
  | 'head' | 'neck' | 'chest' | 'stomach' | 'back' | 'hips'
  | 'left_shoulder' | 'right_shoulder'
  | 'left_upper_arm' | 'right_upper_arm'
  | 'left_forearm' | 'right_forearm'
  | 'left_hand' | 'right_hand'
  | 'left_thigh' | 'right_thigh'
  | 'left_calf' | 'right_calf'
  | 'left_foot' | 'right_foot'

export type TattooSize = 'small' | 'medium' | 'large' | 'custom'

export type SilhouetteView = 'front' | 'back'

export interface BodyPartSelection {
  bodyParts: BodyRegion[]
  size: TattooSize
  estimatedCm: number
}

export const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  head: 'Cabeca',
  neck: 'Pescoco',
  chest: 'Peito',
  stomach: 'Abdomen',
  back: 'Costas',
  hips: 'Quadril',
  left_shoulder: 'Ombro Esquerdo',
  right_shoulder: 'Ombro Direito',
  left_upper_arm: 'Braco Esquerdo',
  right_upper_arm: 'Braco Direito',
  left_forearm: 'Antebraco Esquerdo',
  right_forearm: 'Antebraco Direito',
  left_hand: 'Mao Esquerda',
  right_hand: 'Mao Direita',
  left_thigh: 'Coxa Esquerda',
  right_thigh: 'Coxa Direita',
  left_calf: 'Panturrilha Esquerda',
  right_calf: 'Panturrilha Direita',
  left_foot: 'Pe Esquerdo',
  right_foot: 'Pe Direito',
}

export const SIZE_OPTIONS: { key: TattooSize; label: string; range: string; defaultCm: number }[] = [
  { key: 'small', label: 'Pequena', range: '5-10 cm', defaultCm: 7 },
  { key: 'medium', label: 'Media', range: '10-20 cm', defaultCm: 15 },
  { key: 'large', label: 'Grande', range: '20-40 cm', defaultCm: 30 },
  { key: 'custom', label: 'Personalizado', range: 'cm', defaultCm: 15 },
]

/** Regions visible in the front view */
export const FRONT_REGIONS: BodyRegion[] = [
  'head', 'neck', 'chest', 'stomach', 'hips',
  'left_shoulder', 'right_shoulder',
  'left_upper_arm', 'right_upper_arm',
  'left_forearm', 'right_forearm',
  'left_hand', 'right_hand',
  'left_thigh', 'right_thigh',
  'left_calf', 'right_calf',
  'left_foot', 'right_foot',
]

/** Regions visible in the back view */
export const BACK_REGIONS: BodyRegion[] = [
  'head', 'neck', 'back', 'hips',
  'left_shoulder', 'right_shoulder',
  'left_upper_arm', 'right_upper_arm',
  'left_forearm', 'right_forearm',
  'left_hand', 'right_hand',
  'left_thigh', 'right_thigh',
  'left_calf', 'right_calf',
  'left_foot', 'right_foot',
]
