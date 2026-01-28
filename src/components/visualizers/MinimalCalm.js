/**
 * Calm Minimal Visualization
 * Very subtle, elegant animation - perfect for professional/branding focus
 */

export function drawMinimalCalm(ctx, amplitude, config) {
  const { centerX, centerY, color, secondaryColor, size } = config
  const time = Date.now() / 2000 // Very slow
  
  const baseRadius = 60 * size
  
  // Full range so loud = visible pulse; gentle style from soft glow
  const breathe = Math.sin(time) * 0.1 + 1
  const pulseRadius = baseRadius * breathe + amplitude * 40 * size
  
  // Soft outer glow
  const outerGlow = ctx.createRadialGradient(
    centerX, centerY, pulseRadius,
    centerX, centerY, pulseRadius * 2.5
  )
  outerGlow.addColorStop(0, color + '15')
  outerGlow.addColorStop(0.5, color + '08')
  outerGlow.addColorStop(1, 'transparent')
  
  ctx.fillStyle = outerGlow
  ctx.beginPath()
  ctx.arc(centerX, centerY, pulseRadius * 2.5, 0, Math.PI * 2)
  ctx.fill()
  
  // Single elegant ring
  ctx.strokeStyle = color + '50'
  ctx.lineWidth = 2 * size
  ctx.beginPath()
  ctx.arc(centerX, centerY, pulseRadius + 30 * size, 0, Math.PI * 2)
  ctx.stroke()
  
  // Center circle
  const centerGradient = ctx.createRadialGradient(
    centerX - pulseRadius * 0.2, centerY - pulseRadius * 0.2, 0,
    centerX, centerY, pulseRadius
  )
  centerGradient.addColorStop(0, '#ffffff30')
  centerGradient.addColorStop(0.3, color + '60')
  centerGradient.addColorStop(1, secondaryColor + '40')
  
  ctx.fillStyle = centerGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
  ctx.fill()
  
  // Very subtle border
  ctx.strokeStyle = color + '40'
  ctx.lineWidth = 1
  ctx.stroke()
}

/**
 * Floating Dot - Single elegant dot that responds to audio
 */
export function drawFloatingDot(ctx, amplitude, config) {
  const { centerX, centerY, color, secondaryColor, size } = config
  const time = Date.now() / 1500
  
  // Gentle floating motion
  const floatX = Math.sin(time * 0.7) * 10 * size
  const floatY = Math.cos(time) * 8 * size
  
  const dotX = centerX + floatX
  const dotY = centerY + floatY
  
  const baseSize = 25 * size
  const dotSize = baseSize + amplitude * 40 * size
  
  // Soft halo
  const haloGradient = ctx.createRadialGradient(
    dotX, dotY, dotSize,
    dotX, dotY, dotSize * 4
  )
  haloGradient.addColorStop(0, color + '20')
  haloGradient.addColorStop(0.4, color + '08')
  haloGradient.addColorStop(1, 'transparent')
  
  ctx.fillStyle = haloGradient
  ctx.beginPath()
  ctx.arc(dotX, dotY, dotSize * 4, 0, Math.PI * 2)
  ctx.fill()
  
  // Main dot
  const dotGradient = ctx.createRadialGradient(
    dotX - dotSize * 0.3, dotY - dotSize * 0.3, 0,
    dotX, dotY, dotSize
  )
  dotGradient.addColorStop(0, '#ffffff')
  dotGradient.addColorStop(0.4, color)
  dotGradient.addColorStop(1, secondaryColor)
  
  ctx.fillStyle = dotGradient
  ctx.beginPath()
  ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * Line Pulse - Horizontal line that pulses
 */
export function drawLinePulse(ctx, amplitude, config) {
  const { centerX, centerY, width, color, secondaryColor, size } = config
  
  const lineWidth = width * 0.5
  const pulseWidth = lineWidth * (0.15 + amplitude * 0.85)
  
  // Main line
  const gradient = ctx.createLinearGradient(
    centerX - pulseWidth / 2, centerY,
    centerX + pulseWidth / 2, centerY
  )
  gradient.addColorStop(0, 'transparent')
  gradient.addColorStop(0.2, color + '80')
  gradient.addColorStop(0.5, color)
  gradient.addColorStop(0.8, color + '80')
  gradient.addColorStop(1, 'transparent')
  
  ctx.strokeStyle = gradient
  ctx.lineWidth = 3 * size
  ctx.lineCap = 'round'
  
  ctx.beginPath()
  ctx.moveTo(centerX - pulseWidth / 2, centerY)
  ctx.lineTo(centerX + pulseWidth / 2, centerY)
  ctx.stroke()
  
  // Glow
  ctx.shadowColor = color
  ctx.shadowBlur = 20 * size
  ctx.stroke()
  ctx.shadowBlur = 0
  
  // End dots
  const dotSize = 4 * size + amplitude * 10 * size
  
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(centerX - pulseWidth / 2, centerY, dotSize, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.beginPath()
  ctx.arc(centerX + pulseWidth / 2, centerY, dotSize, 0, Math.PI * 2)
  ctx.fill()
}
