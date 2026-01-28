/**
 * Minimal Pulse Visualization
 * A subtle, elegant pulsing indicator that focuses on branding
 */

export function drawMinimalPulse(ctx, amplitude, config) {
  const { centerX, centerY, color, secondaryColor, size } = config
  
  const baseRadius = 80 * size
  const pulseAmount = amplitude * 30 * size
  
  // Draw multiple concentric rings with different pulse rates
  const rings = [
    { radius: baseRadius, alpha: 0.8, pulseMultiplier: 1 },
    { radius: baseRadius + 30, alpha: 0.5, pulseMultiplier: 0.7 },
    { radius: baseRadius + 60, alpha: 0.3, pulseMultiplier: 0.5 },
    { radius: baseRadius + 90, alpha: 0.15, pulseMultiplier: 0.3 }
  ]
  
  rings.forEach((ring, index) => {
    const currentRadius = ring.radius + pulseAmount * ring.pulseMultiplier
    
    // Outer glow
    const glowGradient = ctx.createRadialGradient(
      centerX, centerY, currentRadius - 10,
      centerX, centerY, currentRadius + 20
    )
    glowGradient.addColorStop(0, color + Math.floor(ring.alpha * 100).toString(16).padStart(2, '0'))
    glowGradient.addColorStop(1, 'transparent')
    
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, currentRadius + 20, 0, Math.PI * 2)
    ctx.fill()
    
    // Ring stroke
    ctx.strokeStyle = index % 2 === 0 ? color : secondaryColor
    ctx.globalAlpha = ring.alpha
    ctx.lineWidth = 3 * size
    ctx.beginPath()
    ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2)
    ctx.stroke()
  })
  
  ctx.globalAlpha = 1
  
  // Center dot
  const centerPulse = baseRadius * 0.3 + amplitude * 20 * size
  
  const centerGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, centerPulse
  )
  centerGradient.addColorStop(0, '#ffffff')
  centerGradient.addColorStop(0.3, color)
  centerGradient.addColorStop(1, secondaryColor)
  
  ctx.fillStyle = centerGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, centerPulse, 0, Math.PI * 2)
  ctx.fill()
  
  // Inner highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.beginPath()
  ctx.arc(centerX - centerPulse * 0.3, centerY - centerPulse * 0.3, centerPulse * 0.2, 0, Math.PI * 2)
  ctx.fill()
  
  // Add subtle particles
  drawParticles(ctx, centerX, centerY, baseRadius + 100, amplitude, color, size)
}

// Draw floating particles for extra visual interest
function drawParticles(ctx, centerX, centerY, radius, amplitude, color, size) {
  const particleCount = 12
  const time = Date.now() / 1000
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + time * 0.5
    const distance = radius + Math.sin(time + i) * 30 * amplitude
    const particleSize = (3 + amplitude * 5) * size
    
    const x = centerX + Math.cos(angle) * distance
    const y = centerY + Math.sin(angle) * distance
    
    ctx.fillStyle = color + '80'
    ctx.beginPath()
    ctx.arc(x, y, particleSize, 0, Math.PI * 2)
    ctx.fill()
  }
}
