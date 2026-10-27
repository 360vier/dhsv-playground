class AccordionGroup extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `
      <div class="accordion-group" role="presentation">
        <slot></slot>
      </div>
    `

    this.config = {
      allowMultiple: this.hasAttribute('allow-multiple'),
      allowURLUpdate: this.hasAttribute('allow-url-update'),
      disableScroll: this.hasAttribute('disable-scroll-into-view'),
      groupName: this.getAttribute('name'),
      selectedItem: this.getAttribute('selected-item'),
    }

    this.initializeAccordion()
    this.setupKeyboardInteractions()
  }

  initializeAccordion() {
    this.setupControlButtons()
    this.handleURLHash()
    this.setupAccordionItems()
  }

  setupAccordionItems() {
    this.querySelectorAll(':scope > details').forEach(item => {
      const summary = item.querySelector(':scope > summary')
      const content = item.querySelector(':scope > div')

      item.setAttribute('role', 'region')
      item.setAttribute('aria-labelledby', `accordion-header-${item.id}`)

      summary.id = `accordion-header-${item.id}`
      summary.setAttribute('role', 'button')
      summary.setAttribute('aria-controls', `accordion-panel-${item.id}`)
      summary.setAttribute(
        'aria-expanded',
        item.hasAttribute('open') ? 'true' : 'false'
      )

      content.id = `accordion-panel-${item.id}`
      content.setAttribute('role', 'region')
      content.setAttribute('aria-labelledby', summary.id)

      item.addEventListener('toggle', () => {
        summary.setAttribute(
          'aria-expanded',
          item.hasAttribute('open').toString()
        )
      })

      if (!this.config.allowMultiple) {
        item.addEventListener('toggle', e => this.handleItemToggle(e))
      }
      if (!this.config.disableScroll) {
        item.addEventListener('toggle', e => this.scrollToItem(e.target))
      }
      if (this.config.allowURLUpdate) {
        item.addEventListener('toggle', e => this.updateURL(e.target))
      }
    })
  }

  setupKeyboardInteractions() {
    this.addEventListener('keydown', e => {
      const target = e.target
      if (target.matches('summary')) {
        const headers = Array.from(this.querySelectorAll('summary'))
        const currentIndex = headers.indexOf(target)

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            headers[(currentIndex + 1) % headers.length]?.focus()
            break
          case 'ArrowUp':
            e.preventDefault()
            headers[
              (currentIndex - 1 + headers.length) % headers.length
            ]?.focus()
            break
          case 'Home':
            e.preventDefault()
            headers[0]?.focus()
            break
          case 'End':
            e.preventDefault()
            headers[headers.length - 1]?.focus()
            break
        }
      }
    })
  }

  handleItemToggle(e) {
    const item = e.target
    if (item.open) {
      this.closeOtherItems(item)
      this._activeItem = item
      this.setAttribute('selected-item', item.id)
    } else if (item.id === this.getAttribute('selected-item')) {
      this._activeItem = null
      this.setAttribute('selected-item', '')
    }
  }

  closeOtherItems(exceptItem) {
    this.querySelectorAll(':scope > details[open]').forEach(item => {
      if (item !== exceptItem) {
        item.open = false
        item
          .querySelector(':scope > summary')
          .setAttribute('aria-expanded', 'false')
      }
    })
  }

  scrollToItem(item) {
    if (item.open) {
      item.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  updateURL(item) {
    if (!this.config.groupName) return

    const url = new URL(window.location)
    if (item.open) {
      url.searchParams.set(this.config.groupName, item.id)
    } else {
      //remove all params with this.config.groupName when no item is open
      const openDetails = this.querySelectorAll(':scope > details[open]')
      if (openDetails.length === 0) {
        url.searchParams.delete(this.config.groupName)
      }
    }
    window.history.replaceState({}, '', url)
  }

  handleURLHash() {
    window.addEventListener('DOMContentLoaded', () => {
      const url = new URL(window.location)
      const itemId = url.searchParams.get(this.config.groupName)
      if (itemId && this.isAccordionItem(itemId)) {
        this.openItem(itemId)
      }
    })
  }

  isAccordionItem(id) {
    if (!id) return false
    return (
      this.querySelector(`:scope > #${id}`)?.tagName.toLowerCase() === 'details'
    )
  }

  openItem(id) {
    const matches = this.querySelectorAll(`:scope > [id="${id}"]`)
    if (matches.length !== 1) return
    const item = matches[0]
    if (item.tagName.toLowerCase() === 'details') {
      item.open = true
      this.scrollToItem(item)
    }
  }

  setupControlButtons() {
    this.querySelector(':scope > #openAll')?.addEventListener('click', () =>
      this.querySelectorAll(':scope > details').forEach(
        item => (item.open = true)
      )
    )

    this.querySelector(':scope > #closeAll')?.addEventListener('click', () =>
      this.querySelectorAll(':scope > details').forEach(
        item => (item.open = false)
      )
    )
  }

  static get observedAttributes() {
    return ['selected-item']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== 'selected-item' || oldValue === newValue) return
    if (this._activeItem && this._activeItem.id === newValue) return
    if (oldValue) {
      const prev = this.querySelectorAll(`:scope > [id="${oldValue}"]`)
      if (prev.length === 1) prev[0].removeAttribute('open')
    }
    if (newValue) this.openItem(newValue)
  }
}

customElements.define('accordion-group', AccordionGroup)

/**
 * Accessible Accordion Group Web Component
 *
 * Follows WAI-ARIA Accordion Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 *
 * Keyboard Support:
 * - Enter/Space: Toggles accordion panel
 * - Tab: Moves through focusable elements
 * - Arrow Down/Up: Moves between accordion headers
 * - Home/End: Moves to first/last accordion header
 *
 * Usage:
 * <accordion-group name="group1">
 *   <details id="item1">
 *     <summary>Item 1</summary>
 *     <div>Content 1</div>
 *   </details>
 *   <details id="item2">
 *     <summary>Item 2</summary>
 *     <div>Content 2</div>
 *   </details>
 * </accordion-group>
 *
 * Options:
 *
 * @attribute {string} name - Group name for accordion items. Required when allow-multiple is not set.
 *    Example: <accordion-group name="group1">
 *
 * @attribute {string} selected-item - ID of the item to open initially or programmatically.
 *    Example: <accordion-group selected-item="item1">
 *    Can be updated: element.setAttribute('selected-item', 'item2')
 *
 * @attribute {boolean} allow-multiple - If set, allows multiple items to be open simultaneously.
 *    Example: <accordion-group allow-multiple>
 *
 * @attribute {boolean} allow-url-update - If set, updates URL hash when items are opened/closed.
 *    Example: <accordion-group allow-url-update>
 *
 * @attribute {boolean} disable-scroll-into-view - If set, prevents auto-scrolling to opened items.
 *    Example: <accordion-group disable-scroll-into-view>
 *
 * Control Buttons (Optional):
 * Add buttons with ids "openAll" and "closeAll" inside the accordion-group to control all items:
 * <button id="openAll">Open All</button>
 * <button id="closeAll">Close All</button>
 */
