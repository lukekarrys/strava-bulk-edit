/* global PLUGIN_NAME */

'use strict'

import pull from 'lodash.pull'
import * as utils from './utils'

// A row will be processed every DELAY ms and actions will wait until OPEN_CLOSE_DELAY
const DELAY = 150
const OPEN_CLOSE_DELAY = 15
const LOADING_INTERVAL = 15

 // eslint-disable-next-line no-console
const log = (...args) => process.env.NODE_ENV === 'development' && console.log(...args)

// A map of selectors of DOM elements that
const {$} = utils // jQuery
const $$ = ($el, s) => {
  const map = {
    header: 'form.search .panel-body .form-group:nth-child(2)',
    'private': '[name=private]',
    edit: '.quick-edit',
    cancel: '.cancel',
    save: '[type=submit]',
    row: '.training-activity-row',
    nextPage: 'button.next_page',
    previousPage: 'button.button.previous_page',
    loading: '.updating-col:visible',
    viewMode: '.view-col',
    editMode: '.edit-col'
  }
  const selector = map[s || $el]
  if (!selector) {
    log(`The selector ${s || $el} does not exist in the mapping.`)
  }
  return $el.find ? $el.find(selector) : $(selector)
}

// Helper for loading the next page
const runOnNextPage = (fn) => {
  utils.scrollToTop($$('header'))
  if (utils.clickIfExists($$('nextPage'))) {
    let waitForLoading = null
    const run = () => clearInterval(waitForLoading) || fn()
    waitForLoading = setInterval(() => !utils.exists($$('loading')) && run(), LOADING_INTERVAL)
  }
}

// A map of predefined actions
let ACTIONS = {
  'public': {
    condition ($row) {
      return $$($row, 'private').is(':checked')
    },
    action ($row) {
      $$($row, 'private').prop('checked', false)
    }
  },
  'private': {
    condition ($row) {
      return !$$($row, 'private').is(':checked')
    },
    action ($row) {
      $$($row, 'private').prop('checked', true)
    }
  }
}

if (process.env.NODE_ENV === 'development') {
  ACTIONS = {
    ...ACTIONS,
    CONDITION_FALSE: {
      condition () {
        return false
      }
    },
    CONDITION_TRUE: {
      condition () {
        return true
      },
      action ($row) {
        log($row)
      }
    }
  }
}

const editAll = (option, cancelables = []) => {
  if (!option) {
    return new Error('You must specify an action.')
  }

  if (typeof option === 'string' && !ACTIONS[option]) {
    return new Error(`${option} is not a valid action.`)
  }

  // By default run the action for all rows if no condition is specified
  let condition = () => true
  // By default there is no action
  let action = () => void 0

  // Get action and condition from passed in option
  // This can be a string, action function, or object with a condition+action fns
  if (typeof option === 'string') {
    action = ACTIONS[option].action || action
    condition = ACTIONS[option].condition || condition
  } else if (typeof option === 'function') {
    action = option
  } else if (typeof option === 'object') {
    action = option.action || action
    condition = option.condition || condition
  }

  // Star the first timeout on the next tick
  let time = 1

  const $rows = $$('row')
  $rows.each((i, row) => {
    let edited = false
    let resetRow
    const lastRow = i === $rows.length - 1
    const $row = $(row)
    const times = {
      start: time,
      action: time + OPEN_CLOSE_DELAY,
      close: time + (DELAY - OPEN_CLOSE_DELAY),
      nextPage: time + DELAY
    }

    cancelables.push(
      // Put the row into edit mode, but make it look the same as view mode
      setTimeout(() => {
        $$($row, 'edit').click()
        $$($row, 'viewMode').show()
        $$($row, 'editMode').hide()
        cancelables.push(resetRow = utils.setBgColor($row, {delay: DELAY}))
        if (!utils.isFullyOnScreen($row)) utils.scrollToBottom($row)
      }, times.start),

      // Perform an action on the row if necessary
      setTimeout(() => {
        if (condition($row)) {
          action($row)
          edited = true
        }
      }, times.action),

      // Save/cancel/reset the row
      setTimeout(() => {
        $$($row, edited ? 'save' : 'cancel').click()
        resetRow()
        pull(cancelables, resetRow)
      }, times.close)
    )

    // On the last row, go to the next page and run this again
    if (lastRow) {
      cancelables.push(
        setTimeout(() => runOnNextPage(editAll.bind(null, option, cancelables)), times.nextPage)
      )
    }

    time += DELAY
  })

  return () => cancelables.forEach((c) => typeof c === 'number' ? clearTimeout(c) : c())
}

const attach = () => {
  const id = `data-plugin-name="${PLUGIN_NAME}__activities_edit_all"`
  const options = Object.keys(ACTIONS).map((key) => `<option value='${key}'>${key}</option>`)
  const style = 'style="margin-left: 10px"'
  const $select = $(`<select ${style} ${id}'><option value="">Edit All</option>${options}</select>`)
  const $header = $$('header')

  $select.on('change', (e) => {
    e.preventDefault()
    const val = $select.val()
    if (val) {
      // Create and append cancel button
      const cancel = editAll(val)
      const $cancel = $(`<button ${style} ${id}>Cancel</button>`)
      $cancel.on('click', () => {
        cancel()
        $cancel.remove()
      })
      $header.append($cancel)
      // Reset select to empty value
      $select.val('')
    }
  })

  $header.find(`[${id}]`).remove()
  $header.append($select)
}

export default {
  pathname: '/athlete/training',
  action: editAll,
  attach
}
