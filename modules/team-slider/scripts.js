import { onDocumentReady } from 'scripts/util/events'

/**
 * Pause/resume Splide AutoScroll on all sliders inside a team-slider block.
 * Used so hovering any card stops both rows (pauseOnHover only affects one instance).
 */
function pauseAutoScrollInBlock(block) {
  block.querySelectorAll('.dhsv-slider.splide').forEach(root => {
    const splide = root._dhsvSplide
    const autoScroll = splide?.Components?.AutoScroll
    if (autoScroll && typeof autoScroll.pause === 'function') {
      autoScroll.pause(false)
    }
  })
}

function resumeAutoScrollInBlock(block) {
  block.querySelectorAll('.dhsv-slider.splide').forEach(root => {
    const splide = root._dhsvSplide
    const autoScroll = splide?.Components?.AutoScroll
    if (autoScroll && typeof autoScroll.play === 'function') {
      autoScroll.play()
    }
  })
}

function bindTeamSliderSyncedHover() {
  document
    .querySelectorAll('.wp-block-dhsv-team-slider.team-slider')
    .forEach(block => {
      if (block.dataset.dhsvTeamSliderSyncPause === '1') {
        return
      }
      block.dataset.dhsvTeamSliderSyncPause = '1'
      block.addEventListener('mouseenter', () => pauseAutoScrollInBlock(block))
      block.addEventListener('mouseleave', () => resumeAutoScrollInBlock(block))
    })
}

function init() {
  bindTeamSliderSyncedHover()
}

onDocumentReady(init)
window.addEventListener('dhsv:splide-mounted', init)
