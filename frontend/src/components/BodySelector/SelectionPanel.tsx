import React, { useState, useEffect } from 'react'
import { BodyRegion, TattooSize, BodyPartSelection, BODY_REGION_LABELS, SIZE_OPTIONS } from './types'

interface SelectionPanelProps {
  selectedRegions: BodyRegion[]
  onConfirm: (data: BodyPartSelection) => void
  onCancel: () => void
  onRemoveRegion: (region: BodyRegion) => void
}

const SelectionPanel: React.FC<SelectionPanelProps> = ({
  selectedRegions,
  onConfirm,
  onCancel,
  onRemoveRegion,
}) => {
  const [selectedSize, setSelectedSize] = useState<TattooSize>('medium')
  const [customCm, setCustomCm] = useState(15)

  const currentCm =
    selectedSize === 'custom'
      ? customCm
      : SIZE_OPTIONS.find((s) => s.key === selectedSize)!.defaultCm

  // Ao adicionar/remover regiões, notifica parent com o tamanho atual
  const regionsKey = selectedRegions.join(',')
  useEffect(() => {
    const defaultCm = SIZE_OPTIONS.find((s) => s.key === 'medium')!.defaultCm
    setSelectedSize('medium')
    setCustomCm(15)
    onConfirm({ bodyParts: selectedRegions, size: 'medium', estimatedCm: defaultCm })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionsKey])

  const handleSizeSelect = (size: TattooSize) => {
    setSelectedSize(size)
    const cm = size === 'custom' ? customCm : SIZE_OPTIONS.find((s) => s.key === size)!.defaultCm
    onConfirm({ bodyParts: selectedRegions, size, estimatedCm: cm })
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Regiões</p>
          <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
            {selectedRegions.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          Limpar tudo
        </button>
      </div>

      {/* Region chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {selectedRegions.map((region) => (
          <span
            key={region}
            className="inline-flex items-center gap-1 bg-cyan-900/30 border border-cyan-700/40 text-cyan-200 text-xs px-2.5 py-1 rounded-full"
          >
            {BODY_REGION_LABELS[region]}
            <button
              type="button"
              onClick={() => onRemoveRegion(region)}
              className="text-cyan-500 hover:text-white transition-colors ml-0.5 leading-none text-base"
              aria-label={`Remover ${BODY_REGION_LABELS[region]}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Size selector */}
      <div className="space-y-2 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest">Tamanho da tatuagem</p>
        {SIZE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => handleSizeSelect(opt.key)}
            className={`w-full flex items-center justify-between py-2.5 px-4 rounded-lg border-2 text-sm transition-colors ${
              selectedSize === opt.key
                ? 'border-ink-500 bg-ink-900/30 text-ink-300'
                : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <span className="font-medium">{opt.label}</span>
            <span className="text-xs opacity-70">{opt.range}</span>
          </button>
        ))}
      </div>

      {selectedSize === 'custom' && (
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1.5">Tamanho em cm</label>
          <input
            type="number"
            min="1"
            max="200"
            value={customCm}
            onChange={(e) => {
              const cm = Number(e.target.value) || 1
              setCustomCm(cm)
              onConfirm({ bodyParts: selectedRegions, size: 'custom', estimatedCm: cm })
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
          />
        </div>
      )}

      <div className="pt-2 border-t border-gray-800">
        <span className="text-sm text-gray-400">
          Tamanho estimado: <strong className="text-white">{currentCm} cm</strong>
        </span>
      </div>
    </div>
  )
}

export default SelectionPanel
