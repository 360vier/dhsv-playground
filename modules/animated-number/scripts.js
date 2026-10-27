/**
 * Animated Number Block - Counting Animation
 */
document.addEventListener('DOMContentLoaded', function () {
  const animatedNumbers = document.querySelectorAll(
    '.dhsv-animated-number-block__number'
  )

  const hasExplicitThousandsSeparator = number => {
    return /^\d{1,3}([.'\s]\d{3})+(,\d{1,2})?$/.test(number.trim())
  }

  const shouldUseThousandsSeparator = (number, mode) => {
    if (mode === 'show') {
      return true
    }

    if (mode === 'hide') {
      return false
    }

    return hasExplicitThousandsSeparator(number)
  }

  const animateNumber = (element, targetNumber, duration = 2000) => {
    // Get suffix from separate data attribute
    const suffix = element.getAttribute('data-suffix') || ''
    const useThousandsSeparator = shouldUseThousandsSeparator(
      targetNumber,
      element.getAttribute('data-thousands-separator-mode') || 'auto'
    )

    // Extract numeric value from the target number.
    let cleanNumber = targetNumber.replace(/['\s]/g, '')

    // Handle different decimal separators (comma or period)
    // If there's a comma or period followed by 1-2 digits, it's likely a decimal separator.
    const commaDecimalMatch = cleanNumber.match(/^([\d.]+),(\d{1,2})$/)
    const periodDecimalMatch = cleanNumber.match(/^(\d+)\.(\d{1,2})$/)
    const periodThousandsMatch = cleanNumber.match(/^\d{1,3}(\.\d{3})+$/)

    let numericValue
    if (commaDecimalMatch) {
      // Comma as decimal separator (European format)
      numericValue = parseFloat(
        commaDecimalMatch[1].replace(/\./g, '') + '.' + commaDecimalMatch[2]
      )
    } else if (periodThousandsMatch) {
      numericValue = parseInt(cleanNumber.replace(/\./g, ''))
    } else if (periodDecimalMatch) {
      // Period as decimal separator
      numericValue = parseFloat(
        periodDecimalMatch[1] + '.' + periodDecimalMatch[2]
      )
    } else {
      // No decimal separator, treat as integer
      numericValue = parseInt(cleanNumber.replace(/[^\d]/g, ''))
    }

    if (isNaN(numericValue)) {
      return // Skip if not a valid number
    }

    const startTime = performance.now()
    const startValue = 0

    const updateNumber = currentTime => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue =
        startValue + (numericValue - startValue) * easeOutQuart

      // Format the number with proper decimal handling
      let formattedNumber
      if (numericValue % 1 !== 0) {
        // It's a decimal number, preserve decimal places
        const decimalPlaces =
          (targetNumber.match(/,(\d{1,2})$/) ||
            targetNumber.match(/\.(\d{1,2})$/))?.[1]?.length || 2

        const decimalSeparator = targetNumber.includes(',') ? ',' : '.'
        const parts = currentValue.toFixed(decimalPlaces).split('.')
        if (useThousandsSeparator && parts[0].length > 3) {
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        }
        formattedNumber = parts.join(decimalSeparator)
      } else {
        // Integer number
        formattedNumber = useThousandsSeparator
          ? Math.floor(currentValue).toLocaleString('de-DE')
          : Math.floor(currentValue).toString()
      }

      // Add suffix if present
      element.textContent = formattedNumber + suffix

      if (progress < 1) {
        requestAnimationFrame(updateNumber)
      }
    }

    requestAnimationFrame(updateNumber)
  }

  // Intersection Observer to trigger animation when element comes into view
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px',
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target
        const targetNumber = element.getAttribute('data-number')
        const duration =
          parseInt(
            element.closest('.dhsv-animated-number-block').dataset
              .animationDuration
          ) || 2000

        animateNumber(element, targetNumber, duration)
        observer.unobserve(element) // Only animate once
      }
    })
  }, observerOptions)

  // Observe all animated number elements
  animatedNumbers.forEach(element => {
    observer.observe(element)
  })
})
