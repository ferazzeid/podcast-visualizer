/**
 * Export canvas as video with audio
 * Uses MediaRecorder API to capture canvas stream and mix with audio
 */

export async function exportVideo(canvas, audioFile, onProgress) {
  return new Promise(async (resolve, reject) => {
    try {
      // Get canvas stream at 60fps
      const canvasStream = canvas.captureStream(60)
      
      // Create audio context and decode audio file
      const audioContext = new AudioContext()
      const arrayBuffer = await audioFile.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      // Create audio destination for recording
      const audioDest = audioContext.createMediaStreamDestination()
      
      // Create buffer source and connect to destination
      const audioSource = audioContext.createBufferSource()
      audioSource.buffer = audioBuffer
      audioSource.connect(audioDest)
      audioSource.connect(audioContext.destination) // Also play through speakers
      
      // Combine video and audio tracks
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks()
      ])
      
      // Set up MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm'
      
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 5000000 // 5 Mbps
      })
      
      const chunks = []
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        const url = URL.createObjectURL(blob)
        
        // Create download link
        const a = document.createElement('a')
        a.href = url
        a.download = `podcast-visualizer-${Date.now()}.webm`
        a.click()
        
        // Cleanup
        URL.revokeObjectURL(url)
        audioContext.close()
        
        resolve()
      }
      
      recorder.onerror = (e) => {
        reject(e.error)
      }
      
      // Start recording
      recorder.start(100) // Collect data every 100ms
      
      // Start audio playback
      audioSource.start(0)
      
      // Track progress
      const duration = audioBuffer.duration * 1000 // Convert to ms
      const startTime = Date.now()
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        if (onProgress) onProgress(progress)
      }, 100)
      
      // Stop recording when audio ends
      audioSource.onended = () => {
        clearInterval(progressInterval)
        if (onProgress) onProgress(1)
        recorder.stop()
      }
      
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Check if browser supports required APIs
 */
export function checkBrowserSupport() {
  const issues = []
  
  if (!window.MediaRecorder) {
    issues.push('MediaRecorder API not supported')
  }
  
  if (!window.AudioContext && !window.webkitAudioContext) {
    issues.push('Web Audio API not supported')
  }
  
  if (!HTMLCanvasElement.prototype.captureStream) {
    issues.push('Canvas captureStream not supported')
  }
  
  return {
    supported: issues.length === 0,
    issues
  }
}
