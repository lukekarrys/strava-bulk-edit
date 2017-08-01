'use strict'

// Import all modules here
import editAll from './editAll'
import totalActivityLog from './totalActivityLog'

const modules = { editAll, totalActivityLog }
const actions = {}
const {pathname} = window.location

// Go through each module and
// - attach it if we are the correct page
// - assign its action to actions for exporting to window
Object.keys(modules).forEach((key) => {
  const m = modules[key]
  if (m.attach) {
    if (typeof m.pathname === 'string' && pathname === m.pathname) {
      m.attach()
    } else if (typeof m.pathname === 'function' && m.pathname(pathname)) {
      m.attach()
    }
  }
  actions[key] = m.action
})

export default actions
