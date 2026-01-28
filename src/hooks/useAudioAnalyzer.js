import { useState, useRef, useCallback } from 'react'

export default function useAudioAnalyzer() {
  const [audioContext, setAudioContext] = useState(null)
  const [analyser, setAnalyser] = useState(null)
  const [audioSource, setAudioSource] = useState(null)
  const [micStream, setMicStream] = useState(null)
  const [isMicActive, setIsMicActive] = useState(false)
  
  const frequencyDataRef = useRef(null)
  const timeDomainDataRef = useRef(null)
  
  // Create or get audio context
  const getOrCreateContext = useCallback(() => {
    let ctx = audioContext
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
      setAudioContext(ctx)
    }
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    return ctx
  }, [audioContext])
  
  // Connect audio element to Web Audio API (for file playback)
  const connectAudio = useCallback((audioElement) => {
    const ctx = getOrCreateContext()
    
    // Create analyser node
    const analyserNode = ctx.createAnalyser()
    analyserNode.fftSize = 256
    analyserNode.smoothingTimeConstant = 0.8
    
    // Create media element source (only once per audio element)
    let source = audioSource
    if (!source) {
      source = ctx.createMediaElementSource(audioElement)
      setAudioSource(source)
    }
    
    // Connect: source -> analyser -> destination
    source.connect(analyserNode)
    analyserNode.connect(ctx.destination)
    
    // Initialize data arrays
    frequencyDataRef.current = new Uint8Array(analyserNode.frequencyBinCount)
    timeDomainDataRef.current = new Uint8Array(analyserNode.fftSize)
    
    setAnalyser(analyserNode)
    
    return analyserNode
  }, [getOrCreateContext, audioSource])
  
  // Connect microphone for live input
  const connectMicrophone = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      })
      
      const ctx = getOrCreateContext()
      
      // Create analyser node
      const analyserNode = ctx.createAnalyser()
      analyserNode.fftSize = 256
      analyserNode.smoothingTimeConstant = 0.7
      
      // Create microphone source
      const micSource = ctx.createMediaStreamSource(stream)
      
      // Connect: mic -> analyser (NOT to destination to avoid feedback)
      micSource.connect(analyserNode)
      
      // Initialize data arrays
      frequencyDataRef.current = new Uint8Array(analyserNode.frequencyBinCount)
      timeDomainDataRef.current = new Uint8Array(analyserNode.fftSize)
      
      setMicStream(stream)
      setAnalyser(analyserNode)
      setIsMicActive(true)
      
      return analyserNode
    } catch (err) {
      console.error('Microphone access denied:', err)
      throw err
    }
  }, [getOrCreateContext])
  
  // Disconnect microphone
  const disconnectMicrophone = useCallback(() => {
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop())
      setMicStream(null)
    }
    setIsMicActive(false)
    setAnalyser(null)
  }, [micStream])
  
  // Get frequency data (for bars visualization)
  const getFrequencyData = useCallback(() => {
    if (!analyser || !frequencyDataRef.current) return new Uint8Array(128)
    analyser.getByteFrequencyData(frequencyDataRef.current)
    return frequencyDataRef.current
  }, [analyser])
  
  // Get time domain data (for waveform visualization)
  const getTimeDomainData = useCallback(() => {
    if (!analyser || !timeDomainDataRef.current) return new Uint8Array(256)
    analyser.getByteTimeDomainData(timeDomainDataRef.current)
    return timeDomainDataRef.current
  }, [analyser])
  
  // Get average amplitude (for pulsing effects)
  const getAverageAmplitude = useCallback(() => {
    const frequencyData = getFrequencyData()
    if (!frequencyData.length) return 0
    
    const sum = frequencyData.reduce((acc, val) => acc + val, 0)
    return sum / frequencyData.length / 255 // Normalize to 0-1
  }, [getFrequencyData])
  
  return {
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
  }
}
