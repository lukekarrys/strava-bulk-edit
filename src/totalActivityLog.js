'use strict'

import * as utils from './utils'

const EARLIEST_INTERVAL_KEY = 'earliestInterval'
const MONTH_CLICK_INTERVAL = 1000 // This seems to be a hardcoded value in Strava
const MONTH_CHUNK_SIZE = 4 // Must be small enough that scrolling loads all months in between
const MONTH_SELECTOR = '.goto-interval[href^="#"]'

const matchInterval = (interval) => {
  const [, year] = interval.match(/^(\d{4})y/) || []
  const [, month] = interval.match(/(\d{2})m$/) || []
  const [, week] = interval.match(/(\d{2})w$/) || []
  return {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    week: parseInt(week, 10)
  }
}

const getStartOfWeek = ({ year, week }) => {
  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const dow = simple.getDay()
  const ISOweekStart = simple
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
  }
  return ISOweekStart
}

const getEndOfMonth = ({ year, month }) => {
  const monthIndex = month - 1
  return new Date(year, monthIndex + 1, 0)
}

const getIntervals = (selector, earliestInterval) => utils.$(selector).filter((__, node) => {
  if (!earliestInterval) return true

  const current = matchInterval(node.getAttribute('data-interval'))
  const earliest = matchInterval(earliestInterval)

  // If current year is before earliest, dont include
  if (current.year < earliest.year) return false

  // If we have a week number on the current node then
  // include it if the current week is after or equal the earliest week
  if (current.week) return current.week > earliest.week

  // Otherwise we need to match month to week
  const startOfEarliestWeek = getStartOfWeek(earliest)
  const endOfCurrentMonth = getEndOfMonth(current)

  // If end of the current month is after the earliest week then include it
  return endOfCurrentMonth >= startOfEarliestWeek
})

const getData = (earliestInterval) => getIntervals('.week-total', earliestInterval).map((index, node) => {
  if (index === 0) return false // Dont include current week since its incomplete

  const getChildText = (qs) => node.querySelector(qs).textContent.trim()
  const getNumber = (val) => Number(val.replace(/[^\d.]/g, ''))
  const getMinutes = (val) => {
    const [,, hours = 0, minutes = 0] = val.match(/((\d+)h )?(\d+)m/) || []
    return (Number(hours) * 60) + Number(minutes)
  }

  const interval = node.getAttribute('data-interval')
  const miles = getNumber(getChildText('.week-total-primary'))
  const time = getMinutes(getChildText('.week-total-secondary'))
  const elevation = getNumber(getChildText('.week-total-tertiary'))
  const { week, year } = matchInterval(interval)

  return {
    interval,
    week,
    year,
    miles,
    time,
    elevation
  }
}).get().filter(Boolean)

const confirmData = (data) => {
  let { year, week } = matchInterval(data[0].interval)
  for (let i = 1, m = data.length; i < m; i++) {
    const { year: nextYear, week: nextWeek } = matchInterval(data[i].interval)
    if (
      ((nextYear === year) && (week - 1 !== nextWeek)) ||
      ((nextYear !== year) && (week === 1 && (nextWeek !== 52 && nextWeek !== 53)))
    ) {
      throw new Error(`Missing data between ${year}y${week}w and ${nextYear}y${nextWeek}w`)
    }
    year = nextYear
    week = nextWeek
  }
}

const totalActivityLog = ({ earliestInterval } = {}) => {
  if (typeof earliestInterval === 'undefined') {
    earliestInterval = utils.getItem(EARLIEST_INTERVAL_KEY)
  }

  const menu = getIntervals(MONTH_SELECTOR, earliestInterval)
  const chunks = utils.chunk(menu.toArray(), MONTH_CHUNK_SIZE)

  const timeout = (fn, index) => setTimeout(fn, MONTH_CLICK_INTERVAL * index)
  const eachChunk = (fn) => chunks.forEach((c, i) => timeout(() => fn(c), i))
  const lastChunk = (fn) => timeout(fn, chunks.length)

  eachChunk((chunk) => chunk[chunk.length - 1].click())
  lastChunk(() => {
    const data = getData(earliestInterval)

    if (data.length) {
      confirmData(data)

      const earliest = data[data.length - 1]
      const latest = data[0]

      console.log(JSON.stringify(data))
      console.log(`Found ${data.length} weeks from ${earliest.interval} to ${latest.interval}`)

      utils.setItem(EARLIEST_INTERVAL_KEY, latest.interval)
    } else {
      console.log(`No weeks found after ${earliestInterval}`)
    }

    utils.beep()
  })
}

const attach = () => {
  const button = utils.$('<button>Total Log</button>')
  button.on('click', totalActivityLog)
  utils.$('#events-nav').prepend(button)
}

export default {
  pathname: (p) => p.match(/^\/athletes\/\d+\/training\/log$/),
  action: totalActivityLog,
  attach
}
