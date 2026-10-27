import { onDocumentReady } from '@scripts/util/events'

onDocumentReady(() => {
  const tabs = document.querySelectorAll('.wp-block-dhsv-tabs')
  tabs.forEach(tabsElement => {
    initTabs(tabsElement)
  })
})

const initTabs = tabsElement => {
  const navigation = tabsElement.querySelector('.wp-block-dhsv-tabs--navigation')
  const content = tabsElement.querySelector('.wp-block-dhsv-tabs--content')
  const tabItems = tabsElement.querySelectorAll('.wp-block-dhsv-tab-item')
  const tabsId = tabsElement.getAttribute('id')
  const defaultSelectedId = tabsElement.getAttribute('data-default-selected')
  const foundIndex = defaultSelectedId
    ? Array.from(tabItems).findIndex(
        tabItem => tabItem.getAttribute('id') === defaultSelectedId
      )
    : 0
  const options = {
    // An unknown id (e.g. content saved before tab items had stable ids) opens the first tab.
    defaultSelected: foundIndex < 0 ? 0 : foundIndex,
  }

  tabItems.forEach((tabItem, index) => {
    const tabItemId = tabItem.getAttribute('id')
    const tabItemContent = tabItem.querySelector(
      '.wp-block-dhsv-tab-item--content'
    )
    if (tabItemContent) {
      content.appendChild(tabItemContent)
      tabItemContent.setAttribute('data-tab-item-id', tabItemId)
    }
    const navItem = renderTabNavItem(tabItem, tabsId)
    const input = navItem.querySelector('input')
    const label = navItem.querySelector('label')
    
    //select if its the first tab item
    if (index === options.defaultSelected) {
      input.checked = true
      tabItemContent.classList.add('active')
      setHeightToContent(tabsElement, tabItemContent)
      // Scroll to active tab on mobile (initial)
      scrollToActiveTab(navigation, label, true)
    }

    input.addEventListener('change', e => {
      if (!tabItemContent) return
      removeActiveClassFromAllTabItems(tabsElement)
      if (e.currentTarget.checked) {
        tabItemContent.classList.add('active')
        // Scroll to active tab on mobile (on change)
        scrollToActiveTab(navigation, label)
      } else {
        tabItemContent.classList.remove('active')
      }
      setHeightToContent(tabsElement, tabItemContent)
    })
  })
}

const setHeightToContent = (tabsElement, tabItemContent) => {
  if (!tabItemContent) return
  const tabItemContentHeight = tabItemContent.getBoundingClientRect().height
  tabsElement
    .querySelector('.wp-block-dhsv-tabs--content')
    .style.setProperty('--child-height', tabItemContentHeight + 'px')
}

const removeActiveClassFromAllTabItems = tabsElement => {
  const tabContentItems = tabsElement.querySelectorAll(
    '.wp-block-dhsv-tab-item--content'
  )
  tabContentItems.forEach(tabContentItem => {
    tabContentItem?.classList?.remove('active')
  })
}

const renderTabNavItem = (tabItem, tabsId) => {
  const navItem = document.createElement('fieldset')
  const input = document.createElement('input')
  const label = document.createElement('label')
  const tabItemId = tabItem.getAttribute('id')
  input.type = 'radio'
  input.name = 'tabs-' + tabsId
  input.id = 'tab-' + tabItemId
  input.classList.add('wp-block-dhsv-tab-item--input')
  label.htmlFor = 'tab-' + tabItemId
  label.innerHTML = tabItem.querySelector(
    '.wp-block-dhsv-tab-item--title'
  ).innerHTML
  navItem.appendChild(input)
  navItem.appendChild(label)
  tabItem.appendChild(navItem)
  //remove the title from the tab item
  tabItem.querySelector('.wp-block-dhsv-tab-item--title').remove()

  return navItem
}

const scrollToActiveTab = (navigation, activeLabel, isInitial = false) => {
  if (!navigation || !activeLabel) return
  
  // Only scroll on mobile (when navigation is horizontal and scrollable)
  const isMobile = window.matchMedia('(max-width: 767.98px)').matches
  if (!isMobile) return

  const performScroll = () => {
    // Check if navigation is scrollable (has overflow)
    const hasOverflow = navigation.scrollWidth > navigation.clientWidth
    if (!hasOverflow) return

    // Calculate scroll position to center the active tab
    const navRect = navigation.getBoundingClientRect()
    const labelRect = activeLabel.getBoundingClientRect()
    const labelCenter = labelRect.left - navRect.left + labelRect.width / 2
    const scrollPosition = navigation.scrollLeft + labelCenter - navRect.width / 2

    // Smooth scroll to the active tab
    navigation.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: isInitial ? 'auto' : 'smooth' // Instant scroll on initial load
    })
  }

  // For initial load, wait a bit to ensure layout is complete
  if (isInitial) {
    requestAnimationFrame(() => {
      requestAnimationFrame(performScroll)
    })
  } else {
    performScroll()
  }
}
