'use strict'

module.exports = {
  version: '2.0',
  type: 'form',

  containers: [
    {
      id: 'foo',
      rows: [[]]
    },
    {
      id: 'bar',
      rows: [[]]
    }
  ],

  cells: [
    {
      label: 'Foo',
      container: 'foo'
    },
    {
      container: 'bar'
    },
    {
      label: 'Baz',
      container: 'baz'
    }
  ]
}
