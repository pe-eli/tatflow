import React, { useState } from 'react'
import BodySilhouette from './BodySilhouette'
import SelectionPanel from './SelectionPanel'
import { BodyRegion, SilhouetteView, BodyPartSelection, BODY_REGION_LABELS } from './types'

interface BodySelectorProps {
  onSelect?: (data: BodyPartSelection) => void
  onBodyPartSelected?: (bodyPart: BodyRegion) => void
  initialRegion?: BodyRegion
}

const BodySelector: React.FC<BodySelectorProps> = ({ onSelect, onBodyPartSelected, initialRegion }) => {
  const [view, setView] = useState<SilhouetteView>('front')
  const [selectedRegions, setSelectedRegions] = useState<BodyRegion[]>(
    initialRegion ? [initialRegion] : []
  )
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null)

  const handleRegionSelect = (region: BodyRegion) => {
    onBodyPartSelected?.(region)
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    )
  }

  const handleConfirm = (data: BodyPartSelection) => {
    onSelect?.(data)
  }

  const handleCancel = () => {
    setSelectedRegions([])
  }

  const handleRemoveRegion = (region: BodyRegion) => {
    setSelectedRegions((prev) => prev.filter((r) => r !== region))
  }

  return (
    <div className="w-full">
      {/* View toggle — pill style */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-gray-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setView('front')}
            className={`px-5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              view === 'front'
                ? 'bg-slate-700 text-cyan-100 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Frente
          </button>
          <button
            type="button"
            onClick={() => setView('back')}
            className={`px-5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              view === 'back'
                ? 'bg-slate-700 text-cyan-100 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Costas
          </button>
        </div>
      </div>

      {/* SVG viewport */}
      <div
        className="relative w-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden flex items-center justify-center"
        style={{ minHeight: '400px', background: 'linear-gradient(180deg, #0f172a 0%, #111827 50%, #0f172a 100%)' }}
      >
        {/* Subtle center guide line */}
        <div className="absolute inset-0 flex justify-center pointer-events-none">
          <div className="w-px h-full opacity-[0.06]" style={{ background: 'linear-gradient(180deg, transparent 5%, #22d3ee 50%, transparent 95%)' }} />
        </div>

        {/* Body silhouette */}
        <div className="w-full max-w-[240px] py-5 px-4">
          <BodySilhouette
            view={view}
            selectedRegions={selectedRegions}
            hoveredRegion={hoveredRegion}
            onSelect={handleRegionSelect}
            onHover={setHoveredRegion}
          />
        </div>

        {/* Selected regions badge (top-left) */}
        {selectedRegions.length > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-cyan-500/15 border border-cyan-300/30 backdrop-blur-sm text-cyan-100 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-cyan-900/20 transition-all duration-200">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
            {selectedRegions.length === 1
              ? BODY_REGION_LABELS[selectedRegions[0]]
              : `${selectedRegions.length} regiões`}
          </div>
        )}

        {/* Hover label (top-right) */}
        {hoveredRegion && !selectedRegions.includes(hoveredRegion) && (
          <div className="absolute top-3 right-3 bg-gray-800/80 backdrop-blur-sm text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full pointer-events-none transition-opacity duration-150">
            {BODY_REGION_LABELS[hoveredRegion]}
          </div>
        )}

        {/* Instruction hint (bottom) */}
        <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
          <span className="text-xs text-gray-500">
            {selectedRegions.length > 0
              ? 'Clique para adicionar ou remover regiões'
              : 'Clique em uma região do corpo'}
          </span>
        </div>
      </div>

      {/* Selection Panel */}
      {selectedRegions.length > 0 && (
        <div className="mt-4">
          <SelectionPanel
            selectedRegions={selectedRegions}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onRemoveRegion={handleRemoveRegion}
          />
        </div>
      )}
    </div>
  )
}

export default BodySelector
