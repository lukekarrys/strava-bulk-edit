import test from 'tape'

import Strava from '../src/index'

test('Has different modules', (t) => {
  t.deepEqual(Object.keys(Strava), ['editAll'])
  t.equal(typeof Strava.editAll, 'function')

  t.end()
})
