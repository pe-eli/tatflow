import React from 'react'
import { BodyRegion, SilhouetteView } from './types'

interface BodySilhouetteProps {
  view: SilhouetteView
  selectedRegions: BodyRegion[]
  hoveredRegion: BodyRegion | null
  onSelect: (region: BodyRegion) => void
  onHover: (region: BodyRegion | null) => void
}

// ─── Polygon data derived from react-body-highlighter SVG assets ─────────────
// viewBox "0 0 100 220"
// Per-side selection: each polygon maps to exactly one BodyRegion (left OR right),
// so clicking any part of an arm/leg/shoulder only highlights that specific side.

interface MusclePolygon {
  region: BodyRegion
  points: string
}

// ─── ANTERIOR (front view) ───────────────────────────────────────────────────
const ANTERIOR: MusclePolygon[] = [
  // HEAD
  { region: 'head', points: '42.4 2.9 40 11.8 42 19.6 46.1 23.3 49.8 25.3 54.7 22.4 57.6 19.2 59.2 10.2 57.1 2.4 49.8 0' },
  // NECK
  { region: 'neck', points: '55.5 23.7 50.6 33.5 50.6 39.2 61.6 40 70.6 44.9 69.4 36.7 63.3 35.1 58.4 30.6' },
  { region: 'neck', points: '29 44.9 30.2 37.1 36.3 35.1 41.2 30.2 44.5 24.5 49 33.9 48.6 39.2 38 39.6' },
  // CHEST — right half (viewer left = anatomical right)
  { region: 'right_shoulder', points: '78.4 53.1 79.6 47.8 79.2 41.2 75.9 38 71 36.3 72.2 42.9 71.4 47.3' },
  { region: 'left_shoulder',  points: '28.2 47.3 21.2 53.1 20 47.8 20.4 40.8 24.5 37.1 28.6 37.1 26.9 43.3' },
  { region: 'chest', points: '51.8 41.6 51 55.1 58 57.9 67.8 55.5 70.6 47.3 62 41.6' },
  { region: 'chest', points: '29.8 46.5 31.4 55.5 40.8 57.9 48.2 55.1 47.8 42 37.6 42' },
  // ABS / OBLIQUES / STOMACH
  { region: 'stomach', points: '68.6 63.3 67.3 57.1 58.8 59.6 60 64.1 60.4 83.3 65.7 78.8 66.5 69.8' },
  { region: 'stomach', points: '33.9 78.4 33.1 71.8 31 63.3 32.2 57.1 40.8 59.2 39.2 63.3 39.2 83.7' },
  { region: 'stomach', points: '56.3 59.2 57.9 64.1 58.4 78 58.4 92.7 56.3 98.4 55.1 104.1 51.4 107.8 51 84.5 50.6 67.3 51 57.1' },
  { region: 'stomach', points: '43.7 58.8 48.6 57.1 49 67.3 48.6 84.5 48.2 107.3 44.5 103.7 40.8 91.4 40.8 78.4 41.2 64.5' },
  // BICEPS — right
  { region: 'right_upper_arm', points: '16.7 68.2 18 71.4 22.9 66.1 29 53.9 27.8 49.4 20.4 55.9' },
  { region: 'left_upper_arm',  points: '71.4 49.4 70.2 54.7 76.3 66.1 81.6 71.8 82.9 69 78.8 55.5' },
  // TRICEPS (front-visible)
  { region: 'right_upper_arm', points: '22.4 69.4 29.8 55.5 29.8 60.8 22.9 73.1' },
  { region: 'left_upper_arm',  points: '69.4 55.5 69.4 61.6 75.9 72.7 77.6 70.2 75.5 67.3' },
  // FOREARM — right
  { region: 'right_forearm', points: '6.1 88.6 10.2 75.1 14.7 70.2 16.3 74.3 19.2 73.5 4.5 97.6 0 100' },
  { region: 'left_forearm',  points: '84.5 69.8 83.3 73.5 80 73.1 95.1 98.4 100 100.4 93.5 89.4 89.8 76.3' },
  { region: 'right_forearm', points: '6.9 101.2 13.5 90.6 18.8 84.1 21.6 77.1 21.2 71.8 4.9 98.8' },
  { region: 'left_forearm',  points: '77.6 72.2 77.6 77.6 80.4 84.1 85.3 89.8 92.2 101.2 94.7 99.6' },
  // HIPS / ABDUCTORS
  { region: 'hips', points: '52.7 110.2 54.3 124.9 60 110.2 62 100 64.9 94.3 60 92.7 56.7 104.5' },
  { region: 'hips', points: '47.8 110.6 44.9 125.3 42 115.9 40.4 113.1 39.6 107.3 38 102.4 34.7 93.9 39.6 92.2 41.6 99.2 43.7 105.3' },
  // QUADRICEPS — right legs
  { region: 'right_thigh', points: '63.3 105.7 64.5 100 66.9 94.7 70.2 101.2 71 111.8 68.2 133.1 65.3 137.6 62.4 128.6 62 111.4' },
  { region: 'left_thigh',  points: '34.7 98.8 37.1 108.2 37.1 127.8 34.3 137.1 31 132.7 29.4 120 28.2 111.4 29.4 100.8 32.2 94.7' },
  { region: 'right_thigh', points: '59.6 145.7 55.5 129 60.8 113.9 61.2 130.2 64.1 139.6 62.9 146.5' },
  { region: 'left_thigh',  points: '38.8 129.4 38.4 112.2 41.2 118.4 44.5 129.4 42.9 135.1 40 146.1 36.3 146.5 35.5 140' },
  { region: 'right_thigh', points: '71.8 113.1 73.9 124.1 73.9 140.4 72.7 145.7 66.5 138.4 70.2 133.5' },
  { region: 'left_thigh',  points: '32.7 138.4 26.5 145.7 25.7 136.7 25.7 127.3 26.9 114.3 29.4 133.5' },
  // KNEES
  { region: 'right_thigh', points: '65.7 140 72.2 147.8 72.2 152.2 69.8 157.1 64.9 156.7 62.9 151' },
  { region: 'left_thigh',  points: '33.9 140 34.7 143.3 35.5 147.3 36.3 151 35.1 156.7 29.8 156.7 27.3 152.7 27.3 147.3 30.2 144.1' },
  // CALVES — right
  { region: 'right_calf', points: '71.4 160.4 73.5 153.5 76.7 161.2 79.6 167.8 78.4 187.8 79.6 195.5 74.7 195.5' },
  { region: 'left_calf',  points: '24.9 194.7 27.8 164.9 28.2 160.4 26.1 154.3 24.9 157.6 22.4 161.6 20.8 167.8 22 188.2 20.8 195.5' },
  { region: 'right_calf', points: '72.7 195.1 69.8 159.2 65.3 158.4 64.1 162.4 64.1 165.3 65.7 177.1' },
  { region: 'left_calf',  points: '35.5 158.4 35.9 162.4 35.9 166.9 35.1 172.2 35.1 176.7 32.2 182 30.6 187.3 26.9 194.7 27.3 187.8 28.2 180.4 28.6 175.5 29 169.8 29.8 164.1 30.2 158.8' },
  // HANDS — appended at end of forearms (right arm: x~0-8 y~100; left arm: x~92-100 y~100)
  { region: 'right_hand', points: '0 102 4 101 7 103 9 108 9 114 6 117 2 117 0 114 0 107' },
  { region: 'left_hand',  points: '91 101 95 101 100 104 100 114 98 117 94 117 91 114 91 107' },
  // FEET — under calves (right: x~62-78; left: x~20-36)
  { region: 'right_foot', points: '62 197 78 197 80 201 80 208 76 213 68 215 62 213 60 208 60 201' },
  { region: 'left_foot',  points: '20 197 36 197 38 201 38 208 34 213 26 215 20 213 18 208 18 201' },
]

// ─── POSTERIOR (back view) ───────────────────────────────────────────────────
const POSTERIOR: MusclePolygon[] = [
  // HEAD
  { region: 'head', points: '50.6 0 46 0.9 40.9 5.5 40.4 12.8 45.1 20 55.7 20 59.1 13.6 59.6 4.7 55.7 1.3' },
  // NECK
  { region: 'neck', points: '44.7 21.7 47.7 21.7 47.2 38.3 47.7 64.7 38.3 53.2 35.3 40.9 31.1 36.6 39.1 33.2 43.8 27.2' },
  { region: 'neck', points: '52.3 21.7 55.7 21.7 56.6 27.2 60.9 32.8 68.9 36.6 64.7 40.4 61.7 53.2 52.3 64.7 53.2 38.3' },
  // BACK DELTOIDS
  { region: 'right_shoulder', points: '29.4 37 23 39.1 17.4 44.3 18.3 53.6 24.3 49.4 27.2 46.4' },
  { region: 'left_shoulder',  points: '71.1 37 78.3 39.6 82.6 44.7 81.7 53.6 74.9 49 72.3 45.1' },
  // UPPER BACK / TRAPEZIUS
  { region: 'back', points: '31.1 38.7 28.1 48.9 28.5 55.3 34 75.3 47.2 71.1 47.2 66.4 36.6 54 33.6 41.3' },
  { region: 'back', points: '68.9 38.7 71.9 49.4 71.5 56.2 66 75.3 52.8 71.1 52.8 66.4 63.4 54.5 66.4 41.7' },
  // LOWER BACK
  { region: 'back', points: '47.7 72.8 34.5 77 35.3 83.4 49.4 102.1 46.8 83' },
  { region: 'back', points: '52.3 72.8 65.5 77 64.7 83.4 50.6 102.1 53.2 83.8' },
  // TRICEPS
  { region: 'right_upper_arm', points: '26.8 49.8 17.9 55.7 14.5 72.3 16.6 81.7 21.7 63.8 26.8 55.7' },
  { region: 'left_upper_arm',  points: '73.6 50.2 82.1 55.7 85.9 73.2 83.4 82.1 77.9 63 73.2 55.7' },
  { region: 'right_upper_arm', points: '26.8 58.3 26.8 68.5 23 75.3 19.1 77.4 22.6 65.5' },
  { region: 'left_upper_arm',  points: '72.8 58.3 77 64.7 80.4 77.4 76.6 75.3 72.8 68.9' },
  // FOREARM
  { region: 'right_forearm', points: '86.4 75.7 91.1 83.4 93.2 94 100 106.4 96.2 104.3 88.1 89.4 84.3 83.8' },
  { region: 'left_forearm',  points: '13.6 75.7 8.9 83.8 6.8 93.6 0 106.4 3.8 104.3 12.3 88.5 15.7 83' },
  { region: 'right_forearm', points: '81.3 79.6 77.4 77.9 79.1 84.7 91.1 103.8 93.2 108.9 94.5 104.7' },
  { region: 'left_forearm',  points: '18.7 79.6 22.1 77.9 20.9 84.2 9.4 103 6.8 108.5 5.1 104.7' },
  // GLUTEAL / HIPS
  { region: 'hips', points: '44.7 99.6 30.2 108.5 29.8 118.7 31.5 126 47.2 121.3 49.4 114.9' },
  { region: 'hips', points: '55.3 99.1 51.1 114.5 52.3 120.9 68.1 126 69.8 119.1 69.4 108.5' },
  { region: 'hips', points: '48.1 123 44.7 123 41.3 125.5 45.1 144.3 48.5 135.7 48.9 129.4' },
  { region: 'hips', points: '51.9 122.6 55.7 123.4 59.1 126 54.9 144.3 51.9 136.2 51.1 129.4' },
  // HAMSTRING
  { region: 'right_thigh', points: '71.5 121.7 69.4 128.9 63.8 126 65.5 136.6 66.4 150.2 71.1 158.3 71.5 147.7 72.8 142.1 73.6 131.9' },
  { region: 'left_thigh',  points: '28.9 122.1 31.1 129.4 36.6 126 35.3 135.3 34.5 150.2 29.4 158.3 28.9 146.8 27.7 141.3 27.2 131.5' },
  { region: 'right_thigh', points: '61.7 125.5 63.4 136.2 64.3 153.2 60 166.8 56.2 146.4' },
  { region: 'left_thigh',  points: '38.7 125.5 44.3 146 40.4 166.8 36.2 152.8 37 135.3' },
  // KNEES (back)
  { region: 'right_thigh', points: '66.4 153.6 63 163 66.8 166.4 69.4 159.1' },
  { region: 'left_thigh',  points: '34.5 153.2 31.1 159.1 33.6 166.4 37.4 162.6' },
  // CALVES
  { region: 'right_calf', points: '70.6 160.4 72.3 168.5 75.7 179.1 76.6 192.8 74.5 196.6 72.3 193.6 70.6 179.6 68.1 168.1' },
  { region: 'left_calf',  points: '29.4 160.4 28.5 167.2 24.7 179.6 23.8 192.8 25.5 197 28.5 193.2 29.8 180 31.9 171.1 31.9 166.8' },
  { region: 'right_calf', points: '63 165.1 61.3 168.5 61.7 190.6 66.4 199.6 70.6 191.9 68.9 179.6 66.8 170.2' },
  { region: 'left_calf',  points: '37.4 165.1 35.3 167.7 33.2 171.9 31.1 180.4 30.2 191.9 34 200 38.7 190.6 39.1 168.9' },
  // SOLEUS
  { region: 'left_calf',  points: '28.5 195.7 30.2 195.7 33.6 201.7 30.6 220 28.5 213.6 26.8 198.3' },
  { region: 'right_calf', points: '69.8 195.7 71.9 195.7 73.6 198.3 71.9 213.2 70.2 219.6 67.2 202.1' },
  // HANDS — end of posterior forearms (right arm: x~86-100 y~108; left arm: x~0-8 y~108)
  { region: 'right_hand', points: '86 109 91 108 96 110 99 115 99 121 96 124 91 124 87 121 86 115' },
  { region: 'left_hand',  points: '1 108 6 108 12 110 14 115 14 121 11 124 6 124 2 121 0 115 0 110' },
  // FEET — under calves (right: x~62-78; left: x~20-36)
  { region: 'right_foot', points: '62 197 78 197 80 201 80 208 76 213 68 215 62 213 60 208 60 201' },
  { region: 'left_foot',  points: '20 197 36 197 38 201 38 208 34 213 26 215 20 213 18 208 18 201' },
]

const BodySilhouette: React.FC<BodySilhouetteProps> = ({
  view,
  selectedRegions,
  hoveredRegion,
  onSelect,
  onHover,
}) => {
  const polygons = view === 'front' ? ANTERIOR : POSTERIOR

  return (
    <svg
      viewBox="0 0 100 225"
      className="w-full h-full select-none"
      style={{ maxHeight: '500px' }}
    >
      <defs>
        <filter id="glow-sel" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
          <feFlood floodColor="#2dd4bf" floodOpacity="0.7" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-hov" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur" />
          <feFlood floodColor="#22d3ee" floodOpacity="0.55" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {polygons.map(({ region, points }, i) => {
        const isSelected = selectedRegions.includes(region)
        const isHovered  = region === hoveredRegion && !isSelected
        return (
          <polygon
            key={`${view}-${region}-${i}`}
            points={points}
            fill={isSelected ? '#14b8a6' : isHovered ? '#0f766e' : '#2a3f58'}
            stroke={isSelected ? '#5eead4' : isHovered ? '#67e8f9' : '#1e3a5f'}
            strokeWidth={isSelected || isHovered ? 0.4 : 0.25}
            filter={isSelected ? 'url(#glow-sel)' : isHovered ? 'url(#glow-hov)' : undefined}
            className="cursor-pointer"
            style={{ transition: 'fill 140ms ease, stroke 140ms ease' }}
            onClick={() => onSelect(region)}
            onMouseEnter={() => onHover(region)}
            onMouseLeave={() => onHover(null)}
          />
        )
      })}
    </svg>
  )
}

export default BodySilhouette
