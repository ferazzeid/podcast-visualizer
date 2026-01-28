import { useState } from 'react'
import { exportVideo, checkBrowserSupport } from '../utils/exportVideo'

export default function ExportButton({ canvasRef, audioFile, isPlaying }) {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  
  const handleExport = async () => {
    // Check browser support
    const support = checkBrowserSupport()
    if (!support.supported) {
      setError(`Browser not supported: ${support.issues.join(', ')}`)
      return
    }
    
    if (!canvasRef || !audioFile) {
      setError('Please upload an audio file first')
      return
    }
    
    setIsExporting(true)
    setProgress(0)
    setError(null)
    
    try {
      await exportVideo(canvasRef, audioFile, (p) => {
        setProgress(Math.round(p * 100))
      })
    } catch (err) {
      console.error('Export failed:', err)
      setError(`Export failed: ${err.message}`)
    } finally {
      setIsExporting(false)
      setProgress(0)
    }
  }
  
  const handleFullscreen = () => {
    if (!canvasRef) return
    
    // Get the parent element (the canvas container div)
    const element = canvasRef.parentElement || canvasRef
    
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Fullscreen button for screen recording */}
      <button
        onClick={handleFullscreen}
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
        title="Fullscreen for screen recording"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
        Fullscreen
      </button>
      
      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={isExporting || !audioFile}
        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
          isExporting || !audioFile
            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-500 text-white'
        }`}
      >
        {isExporting ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Exporting {progress}%
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Video
          </>
        )}
      </button>
      
      {/* Error message */}
      {error && (
        <div className="absolute top-full mt-2 right-0 p-3 bg-red-900/90 text-red-200 rounded-lg text-sm max-w-xs">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-300 hover:text-red-100"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
