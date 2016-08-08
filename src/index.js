'use strict'

// Import all modules here
import editAll from './editAll'

const modules = { editAll }
const actions = {}
const {pathname} = window.location

// Go through each module and
// - attach it if we are the correct page
// - assign its action to actions for exporting to window
Object.keys(modules).forEach((key) => {
  const m = modules[key]
  if (pathname === m.pathname) {
    m.attach()
  }
  actions[key] = m.action
})

export default actions
