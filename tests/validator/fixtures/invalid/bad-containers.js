'use strict'

module.exports = {
  version: '1.0',
  type: 'form',

  containers: [
    {
      id: 'foo',
      children: []
    },
    {
      id: 'bar'
    }
  ],

  cells: [
    {
      label: 'Foo',
      container: 'foo'
    },
    {
      label: 'Bar',
      container: 'bar'
    }
  ]
}
