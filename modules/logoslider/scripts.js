import { onDocumentReady } from 'scripts/util/events'
import './styles.scss'

const SLIDER_SELECTOR = '.dhsv-logoslider'
const WRAPPER_SELECTOR = '.dhsv-logoslider-block-wrapper'
const INIT_FLAG = 'dhsvLogosliderInit'
const IO_ROOT_MARGIN = '100px 0px'

const hasAutoscroll = (el) => {
  try {
    const options = el.dataset.splide ? JSON.parse(el.dataset.splide) : {}
    return !!options.autoScroll
  } catch {
    return false
  }
}

const loadInit = () =>
  import(
    /* webpackChunkName: "dhsv-logoslider" */
    '../slider/init'
  ).then(({ default: init }) => init)

const initSliders = (init, sliders) => {
  if (!sliders.length) {
    return
  }
  init(sliders)
}

const observeAutoscrollSliders = (init, wrappers) => {
  const io = new IntersectionObserver(
    (entries) => {
      const toInit = []

      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }

        const wrapper = entry.target
        const slider = wrapper.querySelector(SLIDER_SELECTOR)
        if (!slider || slider.dataset[INIT_FLAG] === '1') {
          return
        }

        slider.dataset[INIT_FLAG] = '1'
        io.unobserve(wrapper)
        toInit.push(slider)
      })

      initSliders(init, toInit)
    },
    { rootMargin: IO_ROOT_MARGIN }
  )

  wrappers.forEach((wrapper) => {
    const slider = wrapper.querySelector(SLIDER_SELECTOR)
    if (!slider || slider.dataset[INIT_FLAG] === '1') {
      return
    }
    io.observe(wrapper)
  })
}

onDocumentReady(() => {
  const sliders = Array.from(document.querySelectorAll(SLIDER_SELECTOR))
  if (!sliders.length) {
    return
  }

  loadInit().then((init) => {
    const immediate = []
    const deferredWrappers = []

    sliders.forEach((slider) => {
      if (slider.dataset[INIT_FLAG] === '1') {
        return
      }

      if (hasAutoscroll(slider)) {
        const wrapper = slider.closest(WRAPPER_SELECTOR)
        if (wrapper) {
          deferredWrappers.push(wrapper)
        } else {
          immediate.push(slider)
        }
        return
      }

      immediate.push(slider)
    })

    initSliders(init, immediate)

    if (
      deferredWrappers.length > 0 &&
      typeof window.IntersectionObserver === 'function'
    ) {
      observeAutoscrollSliders(init, deferredWrappers)
      return
    }

    const fallback = deferredWrappers
      .map((wrapper) => wrapper.querySelector(SLIDER_SELECTOR))
      .filter((slider) => slider && slider.dataset[INIT_FLAG] !== '1')

    fallback.forEach((slider) => {
      slider.dataset[INIT_FLAG] = '1'
    })
    initSliders(init, fallback)
  })
})
