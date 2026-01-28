/**
 * Frequency Bars Visualization
 * Draws vertical bars (equalizer style) based on frequency data
 */

export function drawFrequencyBars(ctx, frequencyData, config) {
  const { centerX, centerY, width, height, color, secondaryColor, size } = config
  
  // Use fewer bars for a cleaner look
  const barCount = 64
  const barWidth = (width / barCount) * 0.7
  const gap = (width / barCount) * 0.3
  const maxHeight = height * size
  
  // Sample the frequency data
  const step = Math.floor(frequencyData.length / barCount)
  
  for (let i = 0; i < barCount; i++) {
    // Get frequency value (0-255)
    const value = frequencyData[i * step] || 0
    const normalizedValue = value / 255
    
    // Calculate bar height with some minimum
    const barHeight = Math.max(normalizedValue * maxHeight, 4)
    
    // Calculate position (centered)
    const x = centerX - width / 2 + i * (barWidth + gap)
    const y = centerY - barHeight / 2
    
    // Create gradient for each bar
    const gradient = ctx.createLinearGradient(x, y + barHeight, x, y)
    gradient.addColorStop(0, secondaryColor)
    gradient.addColorStop(1, color)
    
    // Draw bar with rounded corners
    ctx.fillStyle = gradient
    roundRect(ctx, x, y, barWidth, barHeight, 4)
    
    // Draw mirrored bar below
    ctx.globalAlpha = 0.4
    const mirrorGradient = ctx.createLinearGradient(x, centerY, x, centerY + barHeight / 2)
    mirrorGradient.addColorStop(0, color)
    mirrorGradient.addColorStop(1, 'transparent')
    ctx.fillStyle = mirrorGradient
    roundRect(ctx, x, centerY, barWidth, barHeight / 2, 4)
    ctx.globalAlpha = 1
  }
  
  // Add glow effect
  ctx.shadowColor = color
  ctx.shadowBlur = 15 * size
  ctx.shadowBlur = 0
}

// Helper function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.fill()
}
