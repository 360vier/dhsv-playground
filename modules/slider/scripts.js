import { onDocumentReady } from 'scripts/util/events'
import './slider.scss'

onDocumentReady(() => {
  const sliders = document.querySelectorAll('.dhsv-slider')
  if (sliders.length > 0) {
    import(
      /* webpackChunkName: "dhsv-slider" */
      './init'
    ).then(({ default: init }) => {
      init(sliders)
    })
  }
})
