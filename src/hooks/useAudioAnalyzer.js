import { useState, useRef, useCallback } from 'react'

// sensitivity: 1 = normal, 2 = 2x boost, etc. (how much louder = higher range).
// smoothness: 0 = instant/jittery, 1 = very smooth/slow (reflects intonation, not rapid vibration).
export default function useAudioAnalyzer(sensitivity = 1, smoothness = 0.7) {
  const [audioContext, setAudioContext] = useState(null)
  const [analyser, setAnalyser] = useState(null)
  const [audioSource, setAudioSource] = useState(null)
  const [micStream, setMicStream] = useState(null)
  const [isMicActive, setIsMicActive] = useState(false)
  
  const frequencyDataRef = useRef(null)
  const timeDomainDataRef = useRef(null)
  const sensitivityRef = useRef(sensitivity)
  sensitivityRef.current = sensitivity
  const smoothnessRef = useRef(smoothness)
  smoothnessRef.current = smoothness
  // Smoothed values (float for EMA); init on first frame
  const smoothedFrequencyRef = useRef(null)
  const smoothedTimeDomainRef = useRef(null)
  
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
      
      // Create analyser node — moderate smoothing; we do attack/release in JS so raw can react to loud input
      const analyserNode = ctx.createAnalyser()
      analyserNode.fftSize = 256
      analyserNode.smoothingTimeConstant = 0.5
      
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
  
  // Attack: when input goes UP (louder) — fast so screaming actually moves the chart. Release: when going down — smooth (smoothness controls this).
  const getAlphaDown = useCallback(() => {
    const sm = Math.max(0, Math.min(1, smoothnessRef.current))
    return 0.03 + (1 - sm) * 0.25
  }, [])

  // Get frequency data: sensitivity = range (louder = higher). Fast attack when loud, smooth release when quiet.
  const getFrequencyData = useCallback(() => {
    if (!analyser || !frequencyDataRef.current) return new Uint8Array(128)
    analyser.getByteFrequencyData(frequencyDataRef.current)
    const s = Math.max(0.1, sensitivityRef.current)
    const len = frequencyDataRef.current.length
    if (!smoothedFrequencyRef.current || smoothedFrequencyRef.current.length !== len) {
      smoothedFrequencyRef.current = new Float32Array(len)
    }
    const smoothed = smoothedFrequencyRef.current
    const alphaDown = getAlphaDown()
    const alphaUp = 0.45 // fast attack: chart rises quickly when you get loud
    const out = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      const rawScaled = Math.min(255, frequencyDataRef.current[i] * s)
      const alpha = rawScaled > smoothed[i] ? alphaUp : alphaDown
      smoothed[i] = smoothed[i] * (1 - alpha) + rawScaled * alpha
      out[i] = Math.round(Math.max(0, Math.min(255, smoothed[i])))
    }
    return out
  }, [analyser, getAlphaDown])
  
  // Get time domain data: fast attack when loud, smooth release when quiet
  const getTimeDomainData = useCallback(() => {
    if (!analyser || !timeDomainDataRef.current) return new Uint8Array(256)
    analyser.getByteTimeDomainData(timeDomainDataRef.current)
    const s = Math.max(0.1, sensitivityRef.current)
    const len = timeDomainDataRef.current.length
    const center = 128
    if (!smoothedTimeDomainRef.current || smoothedTimeDomainRef.current.length !== len) {
      smoothedTimeDomainRef.current = new Float32Array(len)
    }
    const smoothed = smoothedTimeDomainRef.current
    const alphaDown = getAlphaDown()
    const alphaUp = 0.45
    const out = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      const v = timeDomainDataRef.current[i]
      const rawScaled = Math.max(0, Math.min(255, (v - center) * s + center))
      const alpha = rawScaled > smoothed[i] ? alphaUp : alphaDown
      smoothed[i] = smoothed[i] * (1 - alpha) + rawScaled * alpha
      out[i] = Math.round(Math.max(0, Math.min(255, smoothed[i])))
    }
    return out
  }, [analyser, getAlphaDown])
  
  // Get average amplitude (for pulsing effects); sensitivity already applied in getFrequencyData
  const getAverageAmplitude = useCallback(() => {
    const frequencyData = getFrequencyData()
    if (!frequencyData.length) return 0
    const sum = frequencyData.reduce((acc, val) => acc + val, 0)
    return Math.min(1, sum / frequencyData.length / 255)
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
