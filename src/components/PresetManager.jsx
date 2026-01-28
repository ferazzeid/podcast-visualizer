import { useState } from 'react'
import { savePreset, loadPresets, deletePreset, builtInPresets } from '../utils/settingsStorage'

export default function PresetManager({ currentSettings, onLoadPreset }) {
  const [presets, setPresets] = useState(loadPresets())
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [saveError, setSaveError] = useState('')
  
  const handleSave = () => {
    if (!presetName.trim()) {
      setSaveError('Please enter a preset name')
      return
    }
    
    if (savePreset(presetName, currentSettings)) {
      setPresets(loadPresets())
      setShowSaveDialog(false)
      setPresetName('')
      setSaveError('')
    } else {
      setSaveError('Failed to save preset')
    }
  }
  
  const handleDelete = (name) => {
    if (confirm(`Delete preset "${name}"?`)) {
      deletePreset(name)
      setPresets(loadPresets())
    }
  }
  
  const handleLoad = (presetSettings) => {
    onLoadPreset(presetSettings)
  }
  
  return (
    <div className="space-y-4">
      {/* Built-in Presets */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Built-in Presets
        </h4>
        <div className="space-y-2">
          {Object.entries(builtInPresets).map(([name, preset]) => (
            <button
              key={name}
              onClick={() => handleLoad(preset)}
              className="w-full text-left px-3 py-2 bg-[#1a1a1a] hover:bg-violet-600/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 group-hover:text-white">{name}</span>
                <div className="flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full border border-slate-600" 
                    style={{ backgroundColor: preset.visualizerColor }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-slate-600" 
                    style={{ backgroundColor: preset.visualizerSecondaryColor }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Custom Presets */}
      {Object.keys(presets).length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            My Presets
          </h4>
          <div className="space-y-2">
            {Object.entries(presets).map(([name, preset]) => (
              <div
                key={name}
                className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] rounded-lg"
              >
                <button
                  onClick={() => handleLoad(preset)}
                  className="flex-1 text-left hover:text-violet-400 transition-colors"
                >
                  <span className="text-sm text-slate-300">{name}</span>
                </button>
                <button
                  onClick={() => handleDelete(name)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Save Current */}
      {!showSaveDialog ? (
        <button
          onClick={() => setShowSaveDialog(true)}
          className="w-full py-2 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm transition-colors"
        >
          Save Current Settings
        </button>
      ) : (
        <div className="p-3 bg-[#1a1a1a] rounded-lg space-y-3">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="w-full px-3 py-2 bg-black text-white rounded-lg text-sm border border-[#2a2a2a] focus:ring-2 focus:ring-violet-500 outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          {saveError && (
            <p className="text-xs text-red-400">{saveError}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-1.5 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowSaveDialog(false)
                setPresetName('')
                setSaveError('')
              }}
              className="flex-1 py-1.5 px-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-slate-300 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
