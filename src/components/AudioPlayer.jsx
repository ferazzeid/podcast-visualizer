import { useRef, useEffect, useState } from 'react'

export default function AudioPlayer({ 
  audioFile, 
  isPlaying, 
  setIsPlaying, 
  connectAudio,
  audioContext 
}) {
  const audioRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  
  // Create object URL for audio file
  const audioUrl = audioFile ? URL.createObjectURL(audioFile) : null
  
  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])
  
  // Handle play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current || !audioFile) return
    
    // Connect audio to analyzer on first play
    if (!isConnected) {
      connectAudio(audioRef.current)
      setIsConnected(true)
    }
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (err) {
        console.error('Playback failed:', err)
      }
    }
  }
  
  // Update time display
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }
  
  // Set duration when metadata loads
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }
  
  // Handle seeking
  const handleSeek = (e) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value)
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }
  
  // Handle audio ended
  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }
  
  // Format time as MM:SS
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="mt-6 bg-slate-800 rounded-xl p-4">
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}
      
      {audioFile ? (
        <div className="flex flex-col gap-4">
          {/* File name */}
          <div className="text-sm text-slate-400 truncate">
            {audioFile.name}
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Play/Pause button */}
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 flex items-center justify-center bg-violet-600 hover:bg-violet-500 rounded-full transition-colors"
            >
              {isPlaying ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            
            {/* Time display */}
            <span className="text-sm text-slate-300 w-16">
              {formatTime(currentTime)}
            </span>
            
            {/* Progress bar */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:bg-violet-500
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
            
            {/* Duration */}
            <span className="text-sm text-slate-300 w-16 text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-400 py-4">
          Upload an audio file to get started
        </div>
      )}
    </div>
  )
}
