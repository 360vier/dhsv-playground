import { onDocumentReady } from '@scripts/util/events'
// eslint-disable-next-line import/no-unresolved
import DraggablePagination from '@scripts/ui/draggablePagination'
onDocumentReady(() => {
  const initActive = 0
  const casesStageBlock = document.querySelectorAll('.dhsv-cases-stage-block')

  casesStageBlock.forEach(block => {
    const pagination = initPagination(block, initActive)
    // Store pagination instance on block for access from other functions
    block._pagination = pagination

    setActiveClass(block, initActive)
    setStacked(block)

    window.addEventListener('scroll', () => {
      setStacked(block)
    })

    rotateCases(block, initActive)
  })
})

const getCases = block => {
  if (!block) return []
  const inner = block.querySelector('.dhsv-cases-stage-block__inner')
  if (!inner) return []
  const cases = inner.querySelectorAll('.case')
  return cases
}

const setStacked = casesStageBlock => {
  const offset = window.innerHeight * 0.5

  if (!casesStageBlock) return
  const inner = casesStageBlock.querySelector('.dhsv-cases-stage-block__inner')
  if (!inner) return

  const rect = inner.getBoundingClientRect()
  const shouldStack = rect.top < offset
  const wasStacked = casesStageBlock.classList.contains('is-stacked')

  casesStageBlock.classList.toggle('is-stacked', shouldStack)

  if (wasStacked && !shouldStack) {
    setActiveClass(casesStageBlock, 0)
  }
}

const setActiveClass = (block, activeIndex) => {
  const cases = getCases(block)
  if (!cases || cases.length === 0) return
  
  removeActiveClass(cases)
  
  // Ensure activeIndex is within bounds
  const safeIndex = Math.max(0, Math.min(activeIndex, cases.length - 1))
  if (cases[safeIndex]) {
    cases[safeIndex].classList.add('is-active')
    block.style.setProperty('--current-index', safeIndex)
  }

  // Sync pagination if available (avoid infinite loop by checking if value changed)
  if (block._pagination && block._pagination.getValue() !== safeIndex) {
    block._pagination.setValue(safeIndex, { emit: false })
  }
}

const initPagination = (block, initActive) => {
  const cases = getCases(block)
  const paginationElement = block.querySelector('.range-slider')

  if (!paginationElement || cases.length === 0) return null

  const maxIndex = cases.length - 1

  // Initialize draggable pagination
  const draggablePagination = new DraggablePagination(paginationElement, {
    min: 0,
    max: maxIndex,
    step: 1,
    value: initActive || 0,
    ariaLabel: 'Navigate cases',
    showArrows: false,
    showDots: false,
    fullTrack: true,
  })

  // Update cases when pagination changes
  draggablePagination.root.addEventListener('slider:input', e => {
    setActiveClass(block, e.detail.value)
  })

  draggablePagination.root.addEventListener('slider:change', e => {
    setActiveClass(block, e.detail.value)
  })

  return draggablePagination
}

const rotateCases = (block, initActive) => {
  const inner = block.querySelector('.dhsv-cases-stage-block__inner')
  if (!inner) return
  
  const cases = getCases(block)
  if (!cases || cases.length === 0) return
  
  let currentIndex = initActive || 0
  let maxIndex = cases.length - 1

  let isPaused = true

  // Pause rotation on hover, resume on mouse leave
  inner.addEventListener('mouseenter', () => {
    isPaused = true
  })
  //inner.addEventListener('mouseleave', () => { isPaused = false; });

  const rotate = () => {
    const isStacked = block.classList.contains('is-stacked')
    if (!isStacked) return
    if (isPaused) return
    setActiveClass(block, currentIndex)

    currentIndex++
    if (currentIndex > maxIndex) {
      currentIndex = 0
    }
  }

  rotate()

  setInterval(rotate, 3000)
}

const removeActiveClass = cases => {
  cases.forEach(item => {
    item.classList.remove('is-active')
  })
}
