import { onDocumentReady } from '@scripts/util/events'

const MOBILE_QUERY = '(max-width: 781px)'

onDocumentReady(() => {
  const blocks = document.querySelectorAll(
    '.dhsv-case-study-slider:not(.dhsv-case-study-slider--empty):not(.dhsv-case-study-slider--single)'
  )
  if (!blocks.length) {
    return
  }

  const mq = window.matchMedia(MOBILE_QUERY)
  let ticking = false

  const update = () => {
    ticking = false
    if (mq.matches) {
      return
    }
    blocks.forEach(block => {
      const rect = block.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) {
        block.style.setProperty('--_progress', '0')
        return
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable)
      block.style.setProperty('--_progress', (scrolled / scrollable).toFixed(4))
    })
  }

  const onScroll = () => {
    if (ticking) {
      return
    }
    ticking = true
    requestAnimationFrame(update)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  if (mq.addEventListener) {
    mq.addEventListener('change', () => {
      if (mq.matches) {
        blocks.forEach(b => b.style.setProperty('--_progress', '0'))
      } else {
        onScroll()
      }
    })
  }
  update()
})
