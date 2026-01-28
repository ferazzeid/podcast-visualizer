import { useRef } from 'react'
import PresetManager from './PresetManager'

export default function ControlPanel({ 
  settings, 
  updateSettings, 
  audioFile, 
  onAudioSelect,
  audioMode,
  isMicActive,
  onMicToggle,
  micError
}) {
  const audioInputRef = useRef(null)
  const bgImageInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const photoInputRef = useRef(null)
  
  // Handle file input changes
  const handleAudioChange = (e) => {
    if (e.target.files[0]) {
      onAudioSelect(e.target.files[0])
    }
  }
  
  const handleImageChange = (key) => (e) => {
    if (e.target.files[0]) {
      updateSettings(key, e.target.files[0])
    }
  }
  
  const handleLoadPreset = (presetSettings) => {
    Object.entries(presetSettings).forEach(([key, value]) => {
      updateSettings(key, value)
    })
  }
  
  return (
    <div className="w-80 bg-[#0a0a0a] border-r border-[#1a1a1a] p-6 overflow-y-auto max-h-screen">
      <h2 className="text-xl font-bold text-white mb-6">Podcast Visualizer</h2>
      
      {/* Presets Section */}
      <Section title="Presets">
        <PresetManager 
          currentSettings={settings} 
          onLoadPreset={handleLoadPreset}
        />
      </Section>
      
      {/* Audio Source Section */}
      <Section title="Audio Source">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              if (isMicActive) onMicToggle(false)
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
              audioMode === 'file'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            File
          </button>
          <button
            onClick={() => onMicToggle(true)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
              audioMode === 'mic' && isMicActive
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            Live Mic
          </button>
        </div>
        
        {/* Mic Error */}
        {micError && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
            {micError}
          </div>
        )}
        
        {/* File Upload (only show when not using mic) */}
        {audioMode === 'file' && (
          <>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="hidden"
            />
            <button
              onClick={() => audioInputRef.current?.click()}
              className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
            >
              {audioFile ? 'Change Audio File' : 'Upload Audio File'}
            </button>
            {audioFile && (
              <p className="mt-2 text-sm text-slate-400 truncate">{audioFile.name}</p>
            )}
          </>
        )}
        
        {/* Mic Status */}
        {audioMode === 'mic' && isMicActive && (
          <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-red-200 text-sm">Microphone is live</span>
          </div>
        )}
      </Section>
      
      {/* Visualization Style */}
      <Section title="Visualization Style">
        <div className="space-y-2">
          <p className="text-xs text-slate-400 mb-3">Gentle & Relaxed</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'waveform-gentle', label: 'Gentle Wave' },
              { id: 'waveform-flowing', label: 'Flowing Wave' },
              { id: 'circular-breathe', label: 'Breathe' },
              { id: 'circular-orbital', label: 'Orbital' },
              { id: 'circular-ripples', label: 'Ripples' },
              { id: 'bars-smooth', label: 'Smooth Bars' },
              { id: 'minimal-calm', label: 'Calm' },
              { id: 'minimal-dot', label: 'Floating Dot' },
              { id: 'minimal-line', label: 'Line Pulse' }
            ].map(style => (
              <button
                key={style.id}
                onClick={() => updateSettings('visualizerStyle', style.id)}
                className={`py-2 px-3 rounded-lg text-xs transition-colors ${
                  settings.visualizerStyle === style.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-[#1a1a1a] text-slate-300 hover:bg-[#2a2a2a]'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
          
          <p className="text-xs text-slate-400 mb-2 mt-4">Original (Energetic)</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'waveform', label: 'Waveform' },
              { id: 'bars', label: 'Bars' },
              { id: 'circular', label: 'Circular' },
              { id: 'minimal', label: 'Minimal Pulse' }
            ].map(style => (
              <button
                key={style.id}
                onClick={() => updateSettings('visualizerStyle', style.id)}
                className={`py-2 px-3 rounded-lg text-xs transition-colors ${
                  settings.visualizerStyle === style.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-[#1a1a1a] text-slate-300 hover:bg-[#2a2a2a]'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <ColorPicker
            label="Primary Color"
            value={settings.visualizerColor}
            onChange={(v) => updateSettings('visualizerColor', v)}
          />
          <ColorPicker
            label="Secondary Color"
            value={settings.visualizerSecondaryColor}
            onChange={(v) => updateSettings('visualizerSecondaryColor', v)}
          />
          <Slider
            label="Size"
            value={settings.visualizerSize}
            onChange={(v) => updateSettings('visualizerSize', v)}
            min={50}
            max={150}
          />
          <Slider
            label="Input sensitivity (range)"
            value={typeof settings.sensitivity === 'number' ? settings.sensitivity : 2}
            onChange={(v) => updateSettings('sensitivity', v)}
            min={0.5}
            max={8}
            step={0.5}
          />
          <Slider
            label="Chart smoothness"
            value={typeof settings.smoothness === 'number' ? settings.smoothness : 0.7}
            onChange={(v) => updateSettings('smoothness', v)}
            min={0}
            max={1}
            step={0.1}
          />
          <Select
            label="Position"
            value={settings.visualizerPosition}
            onChange={(v) => updateSettings('visualizerPosition', v)}
            options={[
              { value: 'top', label: 'Top' },
              { value: 'center', label: 'Center' },
              { value: 'bottom', label: 'Bottom' }
            ]}
          />
        </div>
      </Section>
      
      {/* Background */}
      <Section title="Background">
        {/* Transparent Toggle for OBS */}
        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
          <Checkbox
            label="Transparent (for OBS overlay)"
            checked={settings.transparentBackground}
            onChange={(v) => updateSettings('transparentBackground', v)}
          />
          {settings.transparentBackground && (
            <p className="mt-2 text-xs text-slate-400">
              Background will be transparent in OBS Browser Source
            </p>
          )}
        </div>
        
        {!settings.transparentBackground && (
          <>
            <ColorPicker
              label="Color"
              value={settings.backgroundColor}
              onChange={(v) => updateSettings('backgroundColor', v)}
            />
            <div className="mt-3">
              <input
                ref={bgImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange('backgroundImage')}
                className="hidden"
              />
              <button
                onClick={() => bgImageInputRef.current?.click()}
                className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                {settings.backgroundImage ? 'Change Background Image' : 'Upload Background Image'}
              </button>
              {settings.backgroundImage && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-slate-400 truncate flex-1">
                    {settings.backgroundImage.name}
                  </span>
                  <button
                    onClick={() => updateSettings('backgroundImage', null)}
                    className="ml-2 text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </Section>
      
      {/* Logo */}
      <Section title="Logo">
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange('logo')}
          className="hidden"
        />
        <button
          onClick={() => logoInputRef.current?.click()}
          className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
        >
          {settings.logo ? 'Change Logo' : 'Upload Logo'}
        </button>
        {settings.logo && (
          <>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-slate-400 truncate flex-1">
                {settings.logo.name}
              </span>
              <button
                onClick={() => updateSettings('logo', null)}
                className="ml-2 text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <Select
                label="Position"
                value={settings.logoPosition}
                onChange={(v) => updateSettings('logoPosition', v)}
                options={[
                  { value: 'top-left', label: 'Top Left' },
                  { value: 'top-right', label: 'Top Right' },
                  { value: 'bottom-left', label: 'Bottom Left' },
                  { value: 'bottom-right', label: 'Bottom Right' },
                  { value: 'center', label: 'Center' }
                ]}
              />
              <Slider
                label="Size"
                value={settings.logoSize}
                onChange={(v) => updateSettings('logoSize', v)}
                min={40}
                max={200}
              />
            </div>
          </>
        )}
      </Section>
      
      {/* Photo/Avatar */}
      <Section title="Photo / Avatar">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange('photo')}
          className="hidden"
        />
        <button
          onClick={() => photoInputRef.current?.click()}
          className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
        >
          {settings.photo ? 'Change Photo' : 'Upload Photo'}
        </button>
        {settings.photo && (
          <>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-slate-400 truncate flex-1">
                {settings.photo.name}
              </span>
              <button
                onClick={() => updateSettings('photo', null)}
                className="ml-2 text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <Select
                label="Position"
                value={settings.photoPosition}
                onChange={(v) => updateSettings('photoPosition', v)}
                options={[
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' }
                ]}
              />
              <Slider
                label="Size"
                value={settings.photoSize}
                onChange={(v) => updateSettings('photoSize', v)}
                min={80}
                max={300}
              />
              <Checkbox
                label="Circular crop"
                checked={settings.photoCircular}
                onChange={(v) => updateSettings('photoCircular', v)}
              />
            </div>
          </>
        )}
      </Section>
      
      {/* Text */}
      <Section title="Text">
        <div className="space-y-3">
          <TextInput
            label="Title"
            value={settings.title}
            onChange={(v) => updateSettings('title', v)}
            placeholder="Episode Title"
          />
          <TextInput
            label="Subtitle"
            value={settings.subtitle}
            onChange={(v) => updateSettings('subtitle', v)}
            placeholder="Podcast Name"
          />
          <ColorPicker
            label="Text Color"
            value={settings.textColor}
            onChange={(v) => updateSettings('textColor', v)}
          />
          <Slider
            label="Title Size"
            value={settings.titleSize}
            onChange={(v) => updateSettings('titleSize', v)}
            min={20}
            max={60}
          />
          <Slider
            label="Subtitle Size"
            value={settings.subtitleSize}
            onChange={(v) => updateSettings('subtitleSize', v)}
            min={12}
            max={40}
          />
          <Select
            label="Position"
            value={settings.textPosition}
            onChange={(v) => updateSettings('textPosition', v)}
            options={[
              { value: 'top', label: 'Top' },
              { value: 'center', label: 'Center' },
              { value: 'bottom', label: 'Bottom' }
            ]}
          />
        </div>
      </Section>
    </div>
  )
}

// Reusable UI Components

function Section({ title, children }) {
  return (
    <div className="mb-6 pb-6 border-b border-[#1a1a1a]">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  )
}

function ColorPicker({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-slate-300">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-[#2a2a2a]"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1 bg-black text-slate-300 rounded text-xs font-mono border border-[#1a1a1a] focus:ring-1 focus:ring-violet-500 outline-none"
        />
      </div>
    </div>
  )
}

function Slider({ label, value, onChange, min = 0, max = 100, step = 1 }) {
  const parse = step >= 1 ? (v) => parseInt(v, 10) : (v) => parseFloat(v)
  const displayValue = typeof value === 'number' && step < 1 ? value.toFixed(1) : value
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm text-slate-300">{label}</label>
        <span className="text-sm text-violet-400">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parse(e.target.value))}
        className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:bg-violet-500
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:hover:bg-violet-400
          [&::-webkit-slider-thumb]:transition-colors"
      />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 bg-[#1a1a1a] text-slate-300 rounded text-sm border-0 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-black text-white rounded-lg text-sm border border-[#1a1a1a] focus:ring-2 focus:ring-violet-500 outline-none"
      />
    </div>
  )
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded bg-slate-700 border-0 text-violet-500 focus:ring-violet-500 focus:ring-offset-0 cursor-pointer"
      />
      <span className="text-sm text-slate-300">{label}</span>
    </label>
  )
}
