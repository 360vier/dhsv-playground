/**
 * Carousel rendered only when there are >= 2 testimonials.
 * Built on Embla Carousel — https://www.embla-carousel.com/
 */

import { onDocumentReady } from '@scripts/util/events'

onDocumentReady(() => {
  const carousels = document.querySelectorAll(
    '.dhsv-testimonials-block-wrapper.is-carousel'
  )
  if (carousels.length === 0) return

  // embla-carousel is ~5-8 KB gzipped and only needed on pages that render a
  // dhsv/testimonials block in carousel mode. Dynamic import keeps it out of
  // main.js — webpack shares the chunk with the cases-stage-v2 block since
  // both use the same webpackChunkName: "embla".
  import(/* webpackChunkName: "embla" */ 'embla-carousel')
    .then(({ default: EmblaCarousel }) => {
      carousels.forEach(carousel => {
        const viewport = carousel.querySelector(
          '.dhsv-testimonials-block__viewport'
        )
        const dotsNode = carousel.querySelector(
          '.dhsv-testimonials-block__controls-dots'
        )
        if (!viewport) return

        const embla = EmblaCarousel(viewport, { slidesToScroll: 'auto' })

        const cleanup = addDots(embla, dotsNode)
        embla.on('destroy', cleanup)
      })
    })
    .catch(err => {
      console.warn('Failed to load embla-carousel chunk', err)
    })
})

function addDots(embla, dotsNode) {
  if (!dotsNode) return () => {}

  let dots = []

  const render = () => {
    const snaps = embla.scrollSnapList()
    // Everything fits into the viewport: nothing to scroll, so no scroll bar.
    dotsNode.hidden = snaps.length <= 1
    dotsNode.innerHTML = snaps
      .map(
        () =>
          '<button class="dhsv-testimonials-block__dot" type="button"></button>'
      )
      .join('')
    dots = Array.from(
      dotsNode.querySelectorAll('.dhsv-testimonials-block__dot')
    )
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-label', `Springe zu Element ${i + 1}`)
      dot.addEventListener('click', () => embla.scrollTo(i), false)
    })
  }

  const updateSelected = () => {
    const prev = embla.previousScrollSnap()
    const next = embla.selectedScrollSnap()
    dots[prev]?.classList.remove('dhsv-testimonials-block__dot--selected')
    dots[next]?.classList.add('dhsv-testimonials-block__dot--selected')
  }

  embla
    .on('init', render)
    .on('reInit', render)
    .on('init', updateSelected)
    .on('reInit', updateSelected)
    .on('select', updateSelected)

  return () => {
    dotsNode.innerHTML = ''
  }
}
