import { onDocumentReady } from '@scripts/util/events'

onDocumentReady(() => {
  const headlines = document.querySelectorAll('.dhsv-swap-headline-block')

  Array.from(headlines).forEach(headline => {
    swapHeadline(headline)
  })
})

const swapHeadline = headline => {
  const swapInner = headline.querySelector('.swap-inner')
  const swapWrapper = headline.querySelector('.swap-wrapper')
  const swaps = headline.querySelectorAll('.swap')
  let current = 0

  const firstSwap = swaps[0]
  if (!firstSwap || !swapInner || !swapWrapper) return

  const lastSwap = document.createElement('span')
  lastSwap.classList.add('swap')
  lastSwap.textContent = firstSwap.textContent
  lastSwap.setAttribute('aria-hidden', 'true')
  swapInner.appendChild(lastSwap)

  const max = swapInner.children.length
  const delay = 3000
  setInitWidth(swapWrapper)
  setWrapperWidth(swapWrapper, firstSwap)
  firstSwap.classList.add('active')

  setTimeout(() => {
    changeSwap(headline, swaps, lastSwap, current, max, delay, swapWrapper)
  }, delay)
}

const setInitWidth = swapWrapper => {
  const swaps = swapWrapper.querySelectorAll('.swap')
  swaps.forEach(swap => {
    swap.setAttribute('data-width', swap.offsetWidth)
  })
}

const changeSwap = (
  headline,
  swaps,
  lastSwap,
  current,
  max,
  delay,
  swapWrapper
) => {
  current = (current + 1) % max
  const currentSwap = swapWrapper.querySelector(
    `.swap:nth-child(${current + 1})`
  )
  setActiveSwap(swapWrapper, currentSwap)
  setWrapperWidth(swapWrapper, currentSwap)
  headline.style.setProperty('--active-swap', `${current}`)
  // If current is max (i.e., after wrapping), remove the transition from the swap elements
  if (current === 0) {
    resetTransitions(swaps, lastSwap, 'none')
  } else {
    resetTransitions(swaps, lastSwap, '')
  }

  setTimeout(
    () => {
      changeSwap(headline, swaps, lastSwap, current, max, delay, swapWrapper)
    },
    current === 0 ? 10 : delay
  )
}

const setWrapperWidth = (swapWrapper, currentSwap) => {
  const width = currentSwap.getAttribute('data-width')
  swapWrapper.style.width = `calc(${width}px + var(--item-padding-inline) * 2)`
}

const setActiveSwap = (swapWrapper, currentSwap) => {
  if (!currentSwap) return
  // Remove 'active' class from all .swap elements within the swapWrapper
  const allSwaps = swapWrapper.querySelectorAll('.swap')
  allSwaps.forEach(swap => {
    swap.classList.remove('active')
  })

  currentSwap.classList.add('active')
}

const resetTransitions = (swaps, lastSwap, value = 'none') => {
  swaps.forEach(swap => {
    swap.style.transition = value
  })
  lastSwap.style.transition = value
}
