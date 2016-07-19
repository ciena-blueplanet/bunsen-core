'use strict'

module.exports = {
  version: '2.0',
  type: 'form',

  cellDefinitions: [
    {
      id: 'main',
      children: [
        [{model: 'firstName'}],
        [{model: 'lastName'}],
        [{model: 'alias'}]
      ]
    }
  ],

  cells: [{label: 'Main', extends: 'main'}]
}
