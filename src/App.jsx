import { useState, useRef, useCallback, useEffect } from 'react'
import AudioPlayer from './components/AudioPlayer'
import VisualizerCanvas from './components/VisualizerCanvas'
import ControlPanel from './components/ControlPanel'
import ExportButton from './components/ExportButton'
import useAudioAnalyzer from './hooks/useAudioAnalyzer'
import { loadSettings, saveSettings } from './utils/settingsStorage'

function App() {
  // Check if we're in OBS mode (clean view without controls)
  const isOBSMode = window.location.pathname === '/obs' || window.location.search.includes('obs=true')
  
  // Audio state
  const [audioFile, setAudioFile] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [audioMode, setAudioMode] = useState('file') // 'file' or 'mic'
  const [micError, setMicError] = useState(null)
  
  // Canvas ref for export
  const canvasRef = useRef(null)
  
  // Load saved settings on mount
  const [settings, setSettings] = useState(() => loadSettings())
  
  // Auto-save settings when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveSettings(settings)
    }, 500) // Debounce saves
    
    return () => clearTimeout(timeoutId)
  }, [settings]) // For OBS overlay
    
  
  // Audio analyzer: sensitivity = range (louder = higher), smoothness = slower/smoother chart
  const sensitivity = typeof settings.sensitivity === 'number' ? settings.sensitivity : 2
  const smoothness = typeof settings.smoothness === 'number' ? settings.smoothness : 0.7
  const { 
    audioContext, 
    analyser, 
    audioSource,
    isMicActive,
    connectAudio,
    connectMicrophone,
    disconnectMicrophone,
    getFrequencyData, 
    getTimeDomainData,
    getAverageAmplitude 
  } = useAudioAnalyzer(sensitivity, smoothness)
  
  // Auto-start mic in OBS mode
  useEffect(() => {
    if (isOBSMode) {
      setAudioMode('mic')
      // Small delay to let the page render first
      setTimeout(() => {
        handleMicToggle(true)
      }, 500)
    }
  }, [isOBSMode])
  
  // Handle settings change
  const updateSettings = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])
  
  // Handle audio file selection
  const handleAudioSelect = useCallback((file) => {
    setAudioFile(file)
    setIsPlaying(false)
    setAudioMode('file')
    // Disconnect mic if active
    if (isMicActive) {
      disconnectMicrophone()
    }
  }, [isMicActive, disconnectMicrophone])
  
  // Handle mic toggle
  const handleMicToggle = useCallback(async (enable) => {
    if (enable) {
      try {
        setMicError(null)
        await connectMicrophone()
        setAudioMode('mic')
        setIsPlaying(true) // Mic is always "playing"
      } catch (err) {
        setMicError('Microphone access denied. Please allow microphone access and try again.')
        setAudioMode('file')
      }
    } else {
      disconnectMicrophone()
      setIsPlaying(false)
      setAudioMode('file')
    }
  }, [connectMicrophone, disconnectMicrophone])
  
  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])
  
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      // Check if it's an audio file
      if (file.type.startsWith('audio/')) {
        handleAudioSelect(file)
      }
    }
  }, [handleAudioSelect])

  // OBS Mode - Clean view with just the visualization
  if (isOBSMode) {
    return (
      <div 
        className="w-screen h-screen overflow-hidden"
        style={{ 
          backgroundColor: settings.transparentBackground ? 'transparent' : settings.backgroundColor 
        }}
      >
        <VisualizerCanvas
          ref={canvasRef}
          settings={{...settings, transparentBackground: true}}
          analyser={analyser}
          getFrequencyData={getFrequencyData}
          getTimeDomainData={getTimeDomainData}
          getAverageAmplitude={getAverageAmplitude}
          isPlaying={isMicActive}
          fullscreen={true}
        />
      </div>
    )
  }

  // Normal Mode - Full UI
  return (
    <div 
      className="min-h-screen bg-black flex relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-violet-600/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-violet-500 m-4 rounded-2xl">
          <div className="text-center">
            <svg className="w-16 h-16 text-violet-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-2xl font-bold text-white">Drop audio file here</p>
            <p className="text-violet-300 mt-2">MP3, WAV, OGG, M4A supported</p>
          </div>
        </div>
      )}
      
      {/* Control Panel - Left Sidebar */}
      <ControlPanel 
        settings={settings} 
        updateSettings={updateSettings}
        audioFile={audioFile}
        onAudioSelect={handleAudioSelect}
        audioMode={audioMode}
        isMicActive={isMicActive}
        onMicToggle={handleMicToggle}
        micError={micError}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 min-w-0">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-white">Podcast Visualizer</h1>
          <div className="flex gap-4 relative">
            <ExportButton 
              canvasRef={canvasRef}
              audioFile={audioFile}
              isPlaying={isPlaying}
            />
          </div>
        </div>
        
        {/* Preview Area */}
        <div 
          className="flex-1 flex items-center justify-center rounded-xl overflow-hidden min-h-[400px] relative"
          style={{
            // Show checkerboard pattern when transparent mode is on
            backgroundColor: settings.transparentBackground ? 'transparent' : '#0a0a0a',
            backgroundImage: settings.transparentBackground 
              ? 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)'
              : 'none',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        >
          {!audioFile && !isMicActive ? (
            <div className="text-center p-8">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <p className="text-xl text-slate-400 mb-2">No audio source</p>
              <p className="text-slate-500 mb-4">Upload an audio file or enable your microphone</p>
              <button
                onClick={() => handleMicToggle(true)}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
              >
                Enable Microphone
              </button>
            </div>
          ) : (
            <VisualizerCanvas
              ref={canvasRef}
              settings={settings}
              analyser={analyser}
              getFrequencyData={getFrequencyData}
              getTimeDomainData={getTimeDomainData}
              getAverageAmplitude={getAverageAmplitude}
              isPlaying={isPlaying || isMicActive}
            />
          )}
          
          {/* Mic Active Indicator */}
          {isMicActive && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="text-white text-sm font-medium">LIVE</span>
            </div>
          )}
        </div>
        
        {/* Audio Player Controls - Only show in file mode */}
        {audioMode === 'file' && (
          <AudioPlayer
            audioFile={audioFile}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            connectAudio={connectAudio}
            audioContext={audioContext}
          />
        )}
        
        {/* Mic Mode Info */}
        {audioMode === 'mic' && isMicActive && (
          <div className="mt-6 bg-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Microphone Active</p>
                  <p className="text-slate-400 text-sm">Visualization is responding to your voice</p>
                </div>
              </div>
              <button
                onClick={() => handleMicToggle(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Stop Mic
              </button>
            </div>
          </div>
        )}
        
        {/* OBS Instructions */}
        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">
            <strong className="text-slate-300">OBS Tip:</strong> Add this URL as a Browser Source in OBS: 
            <code className="ml-2 px-2 py-0.5 bg-slate-700 rounded text-violet-400">
              {window.location.origin}?obs=true
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
