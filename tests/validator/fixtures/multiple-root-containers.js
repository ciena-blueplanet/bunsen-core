'use strict'

module.exports = {
  version: '2.0',
  type: 'form',

  cellDefinitions: [
    {
      id: 'name',
      children: [
        [{model: 'firstName'}],
        [{model: 'lastName'}]
      ]
    },
    {
      id: 'alias',
      children: [
        [{model: 'alias'}]
      ]
    }
  ],

  cells: [
    {label: 'Name', extends: 'name'},
    {label: 'Alias', extends: 'alias'}
  ]
}
