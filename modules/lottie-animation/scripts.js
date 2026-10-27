import { onDocumentReady } from '@scripts/util/events'

onDocumentReady(() => {
  const containers = document.querySelectorAll('[data-lottie-animation]')
  if (containers.length === 0) return

  // lottie-web is ~45 KB gzipped and only needed on pages that render a
  // dhsv/lottie-animation block. Dynamic import keeps it out of main.js —
  // same lazy-load pattern as resources/assets/gutenberg/blocks/slider/scripts.js.
  import(/* webpackChunkName: "lottie" */ 'lottie-web')
    .then(({ default: lottie }) => {
      containers.forEach(container => {
        const animationPath = container.getAttribute('data-lottie-path')

        if (!animationPath) {
          console.warn('Lottie animation path not found')
          return
        }

        lottie.loadAnimation({
          container: container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: animationPath,
        })
      })
    })
    .catch(err => {
      console.warn('Failed to load lottie-web chunk', err)
    })
})
