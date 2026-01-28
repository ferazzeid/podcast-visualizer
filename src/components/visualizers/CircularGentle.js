/**
 * Gentle Circular Visualizations
 * Calmer, more relaxing circular animations
 */

/**
 * Breathing Circle - Soft pulsing like breathing
 */
export function drawCircularBreathe(ctx, frequencyData, amplitude, config) {
  const { centerX, centerY, color, secondaryColor, size } = config
  
  const baseRadius = 120 * size
  // Full range so loud = visible pulse; gentle style from soft gradients
  const pulseAmount = amplitude * 55 * size
  const currentRadius = baseRadius + pulseAmount
  
  // Soft outer glow
  const glowGradient = ctx.createRadialGradient(
    centerX, centerY, currentRadius * 0.5,
    centerX, centerY, currentRadius * 2
  )
  glowGradient.addColorStop(0, color + '20')
  glowGradient.addColorStop(0.5, color + '10')
  glowGradient.addColorStop(1, 'transparent')
  
  ctx.fillStyle = glowGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, currentRadius * 2, 0, Math.PI * 2)
  ctx.fill()
  
  // Main circle with soft gradient
  const mainGradient = ctx.createRadialGradient(
    centerX - currentRadius * 0.3, centerY - currentRadius * 0.3, 0,
    centerX, centerY, currentRadius
  )
  mainGradient.addColorStop(0, color + '40')
  mainGradient.addColorStop(0.7, secondaryColor + '30')
  mainGradient.addColorStop(1, color + '50')
  
  ctx.fillStyle = mainGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2)
  ctx.fill()
  
  // Soft border
  ctx.strokeStyle = color + '60'
  ctx.lineWidth = 2 * size
  ctx.stroke()
  
  // Inner soft rings (subtle)
  for (let i = 1; i <= 3; i++) {
    const ringRadius = currentRadius * (0.3 + i * 0.2)
    ctx.strokeStyle = color + Math.floor(30 - i * 8).toString(16).padStart(2, '0')
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
    ctx.stroke()
  }
}

/**
 * Orbital Rings - Elegant rotating rings
 */
export function drawOrbitalRings(ctx, frequencyData, amplitude, config) {
  const { centerX, centerY, color, secondaryColor, size } = config
  const time = Date.now() / 3000 // Slow rotation
  
  const baseRadius = 100 * size
  
  // Center glow
  const centerGlow = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, baseRadius * 0.5
  )
  centerGlow.addColorStop(0, color + '60')
  centerGlow.addColorStop(0.5, secondaryColor + '30')
  centerGlow.addColorStop(1, 'transparent')
  
  ctx.fillStyle = centerGlow
  ctx.beginPath()
  ctx.arc(centerX, centerY, baseRadius * 0.5, 0, Math.PI * 2)
  ctx.fill()
  
  // Draw orbital rings
  const rings = [
    { radius: baseRadius * 0.8, speed: 1, width: 2, alpha: 0.6 },
    { radius: baseRadius * 1.1, speed: -0.7, width: 1.5, alpha: 0.4 },
    { radius: baseRadius * 1.4, speed: 0.5, width: 1, alpha: 0.25 },
  ]
  
  rings.forEach((ring, index) => {
    const expandedRadius = ring.radius + amplitude * 50 * size
    const rotation = time * ring.speed
    
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotation)
    
    // Draw ellipse (tilted circle)
    ctx.strokeStyle = (index % 2 === 0 ? color : secondaryColor) + Math.floor(ring.alpha * 255).toString(16).padStart(2, '0')
    ctx.lineWidth = ring.width * size
    
    ctx.beginPath()
    ctx.ellipse(0, 0, expandedRadius, expandedRadius * 0.4, 0, 0, Math.PI * 2)
    ctx.stroke()
    
    ctx.restore()
  })
  
  // Center dot - full range so loud = bigger
  const dotSize = 8 * size + amplitude * 35 * size
  const dotGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, dotSize
  )
  dotGradient.addColorStop(0, '#ffffff')
  dotGradient.addColorStop(0.3, color)
  dotGradient.addColorStop(1, secondaryColor + '80')
  
  ctx.fillStyle = dotGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, dotSize, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * Soft Ripples - Like water ripples
 */
export function drawSoftRipples(ctx, frequencyData, amplitude, config) {
  const { centerX, centerY, color, secondaryColor, size } = config
  const time = Date.now() / 1000
  
  const maxRadius = 180 * size
  const numRipples = 5
  
  for (let i = 0; i < numRipples; i++) {
    const progress = ((time * 0.3 + i / numRipples) % 1)
    const radius = progress * maxRadius
    const alpha = (1 - progress) * 0.5
    
    if (alpha > 0.05) {
      ctx.strokeStyle = (i % 2 === 0 ? color : secondaryColor) + Math.floor(alpha * 255).toString(16).padStart(2, '0')
      ctx.lineWidth = (2 + amplitude * 8) * size * (1 - progress * 0.5)
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius + amplitude * 50, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  
  // Soft center - full range
  const centerSize = 30 * size + amplitude * 50 * size
  const centerGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, centerSize
  )
  centerGradient.addColorStop(0, color + '80')
  centerGradient.addColorStop(0.6, secondaryColor + '40')
  centerGradient.addColorStop(1, 'transparent')
  
  ctx.fillStyle = centerGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, centerSize, 0, Math.PI * 2)
  ctx.fill()
}
