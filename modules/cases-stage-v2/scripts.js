/**
 * The carousel is built on Embla Carousel.
 * You may find the documentation here: https://www.embla-carousel.com/
 */

import { onDocumentReady } from '@scripts/util/events'

onDocumentReady(() => {
  const carouselBlocks = document.querySelectorAll(
    '.dhsv-cases-stage-v2-block'
  )
  if (carouselBlocks.length === 0) return

  // embla-carousel and DraggablePagination are only needed on pages that render
  // a dhsv/cases-stage-v2 block. Dynamic import keeps them out of main.js.
  Promise.all([
    import(/* webpackChunkName: "embla" */ 'embla-carousel'),
    import('@scripts/ui/draggablePagination'),
  ])
    .then(([{ default: EmblaCarousel }, { default: DraggablePagination }]) => {
      carouselBlocks.forEach(carousel => {
        const viewportNode = carousel.querySelector(
          '.dhsv-cases-stage-v2-block__viewport'
        )
        const paginationNode = carousel.querySelector(
          '.splide__dragable-pagination'
        )

        if (!viewportNode || !paginationNode) {
          return
        }

        const emblaApi = EmblaCarousel(viewportNode, {
          slidesToScroll: 'auto',
        })

        const destroyPagination = addDraggablePagination(
          emblaApi,
          paginationNode,
          DraggablePagination
        )

        emblaApi.on('destroy', destroyPagination)
      })
    })
    .catch(err => {
      console.warn('Failed to load cases-stage-v2 carousel chunk', err)
    })
})

function addDraggablePagination(emblaApi, paginationNode, DraggablePagination) {
  const snapCount = emblaApi.scrollSnapList().length

  if (snapCount <= 1) {
    return () => {}
  }

  const draggablePagination = new DraggablePagination(paginationNode, {
    min: 1,
    max: snapCount,
    step: 1,
    value: 1,
    ariaLabel: 'Slider navigation',
    vertical: false,
    disabled: false,
  })

  const onPaginationInput = e => {
    emblaApi.scrollTo(e.detail.value - 1)
  }

  const onPaginationChange = e => {
    emblaApi.scrollTo(e.detail.value - 1)
  }

  const syncPaginationFromEmbla = () => {
    draggablePagination.setValue(emblaApi.selectedScrollSnap() + 1, {
      emit: false,
    })
  }

  const syncPaginationMax = () => {
    draggablePagination.setMax(emblaApi.scrollSnapList().length)
    syncPaginationFromEmbla()
  }

  draggablePagination.root.addEventListener('slider:input', onPaginationInput)
  draggablePagination.root.addEventListener('slider:change', onPaginationChange)

  emblaApi
    .on('select', syncPaginationFromEmbla)
    .on('reInit', syncPaginationMax)

  return () => {
    draggablePagination.root.removeEventListener(
      'slider:input',
      onPaginationInput
    )
    draggablePagination.root.removeEventListener(
      'slider:change',
      onPaginationChange
    )
    draggablePagination.destroy()
  }
}
