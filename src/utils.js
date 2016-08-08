'use strict'

const SCROLL_MARGIN = 30
const DEFAULT_BG_FADE = 100

// jQuery for use elsewhere too
export const $ = window.jQuery

// Helpers for scroll to elements quickly
export const isFullyOnScreen = ($el) => {
  const top = $(window).scrollTop()
  const bottom = top + $(window).height()
  const elTop = $el.offset().top
  const elBottom = elTop + $el.outerHeight(true)
  return (top < elTop) && (bottom > elBottom)
}
export const scrollTo = (scrollTop) => $('html, body').animate({scrollTop}, 1)
export const scrollToTop = ($el, offset = SCROLL_MARGIN) => scrollTo($el.offset().top - offset)
export const scrollToBottom = ($el) => scrollToTop($el, $(window).height() - SCROLL_MARGIN)

export const exists = ($el) => $el.length > 0
export const clickIfExists = ($el) => exists($el) ? $el.click() : null

// Add editable transition to element
export const setBgColor = ($el, {delay = DEFAULT_BG_FADE, color = '#a3e7a7'}) => {
  const backgroundColor = $el.css('background-color')
  const bgTransition = `background-color ${delay}ms ease-in`
  $el.css({
    WebkitTransition: bgTransition,
    MozTransition: bgTransition,
    MsTransition: bgTransition,
    OTransition: bgTransition,
    transition: bgTransition,
    backgroundColor: color
  })
  // Return a fn to reset to the previous color while keeping the animation
  return () => $el.css({backgroundColor})
}
