import { onDocumentReady } from '@scripts/util/events'

const ROOT_MARGIN = '0px 0px -50% 0px'
const THRESHOLD = 0.1

function whenAllImagesLoaded(container) {
  const images = Array.from(container.querySelectorAll('img[src]'))
  if (!images.length) return Promise.resolve()
  return Promise.all(
    images.map(
      img =>
        new Promise(resolve => {
          if (img.complete && img.naturalHeight > 0) {
            resolve()
            return
          }
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        })
    )
  )
}

onDocumentReady(() => {
  const blocks = document.querySelectorAll('[data-image-stack-animation]')
  if (!blocks.length) return

  blocks.forEach(block => {
    const stage = block.querySelector('.dhsv-image-stack-animation__stage')
    const layers = block.querySelectorAll('[data-layer]')
    if (!stage || !layers.length) return

    whenAllImagesLoaded(block).then(() => {
      block.classList.add('images-loaded')
    })

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.target !== block) return
          if (entry.isIntersecting) {
            block.classList.add('is-in-view')
          } else {
            block.classList.remove('is-in-view')
          }
        })
      },
      { rootMargin: ROOT_MARGIN, threshold: THRESHOLD }
    )

    observer.observe(block)
  })
})
