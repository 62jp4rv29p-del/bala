// Animation utilities using CSS transitions + requestAnimationFrame

export function getAnimSpeed(settings) {
  const speed = settings?.animSpeed || 'normal'
  if (speed === 'slow') return 1.5
  if (speed === 'fast') return 0.6
  return 1.0
}

export function animateNumber(startVal, endVal, duration, onUpdate, onComplete) {
  const startTime = performance.now()
  function tick(now) {
    const elapsed = now - startTime
    const t = Math.min(elapsed / duration, 1)
    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3)
    const current = Math.floor(startVal + (endVal - startVal) * ease)
    onUpdate(current)
    if (t < 1) {
      requestAnimationFrame(tick)
    } else {
      onUpdate(endVal)
      if (onComplete) onComplete()
    }
  }
  requestAnimationFrame(tick)
}

export function flyElement(el, fromRect, toRect, duration, onComplete) {
  if (!el || !fromRect || !toRect) {
    if (onComplete) onComplete()
    return
  }

  const dx = fromRect.left - toRect.left
  const dy = fromRect.top - toRect.top

  el.style.transition = 'none'
  el.style.transform = `translate(${dx}px, ${dy}px)`
  el.style.opacity = '1'

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${duration}ms ease`
      el.style.transform = 'translate(0, 0)'
      el.style.opacity = '1'

      setTimeout(() => {
        if (onComplete) onComplete()
      }, duration)
    })
  })
}

export function createFloatingText(text, color, startRect, endEl) {
  const el = document.createElement('div')
  el.textContent = text
  el.style.cssText = `
    position: fixed;
    left: ${startRect.left + startRect.width / 2}px;
    top: ${startRect.top}px;
    transform: translateX(-50%);
    color: ${color};
    font-family: 'Press Start 2P', monospace;
    font-size: 18px;
    font-weight: 900;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
    pointer-events: none;
    z-index: 9999;
    transition: none;
    white-space: nowrap;
  `
  document.body.appendChild(el)

  const targetRect = endEl ? endEl.getBoundingClientRect() : null
  const endX = targetRect ? targetRect.left + targetRect.width / 2 : startRect.left + startRect.width / 2
  const endY = targetRect ? targetRect.top : startRect.top - 80

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transition = 'all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      el.style.left = endX + 'px'
      el.style.top = endY + 'px'
      el.style.opacity = '0'
      el.style.transform = 'translateX(-50%) scale(1.4)'

      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el)
      }, 450)
    })
  })

  return el
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
