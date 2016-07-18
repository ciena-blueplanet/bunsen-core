'use strict'

module.exports = {
  version: '2.0',
  type: 'form',

  containers: [
    {
      id: 'name',
      rows: [
        [{model: 'firstName'}],
        [{model: 'lastName'}]
      ]
    },
    {
      id: 'alias',
      rows: [
        [{model: 'alias'}]
      ]
    }
  ],

  cells: [
    {label: 'Name', container: 'name'},
    {label: 'Alias', container: 'alias'}
  ]
}
