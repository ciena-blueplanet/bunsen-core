'use strict'

module.exports = {
  version: '2.0',
  type: 'form',

  containers: [
    {
      id: 'main',
      rows: [
        [{model: 'firstName'}],
        [{model: 'lastName'}],
        [{model: 'alias'}]
      ]
    }
  ],

  cells: [{label: 'Main', container: 'main'}]
}
