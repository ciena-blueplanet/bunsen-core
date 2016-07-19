'use strict'

module.exports = {
  version: '2.0',
  type: 'form',

  containers: [
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
    {label: 'Name', container: 'name'},
    {label: 'Alias', container: 'alias'}
  ]
}
