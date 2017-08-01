import test from 'tape'

import Strava from '../src/index'

test('Has different modules', (t) => {
  t.deepEqual(Object.keys(Strava), ['editAll', 'totalActivityLog'])
  t.equal(typeof Strava.editAll, 'function')
  t.equal(typeof Strava.totalActivityLog, 'function')

  t.end()
})
