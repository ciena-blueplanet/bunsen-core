'use strict'

module.exports = {
  version: '2.0',
  type: 'form',

  cellDefinitions: {
    bar: {
      children: []
    },
    foo: {
      children: []
    }
  },

  cells: [
    {
      label: 'Foo',
      extends: 'foo'
    },
    {
      extends: 'bar'
    },
    {
      label: 'Baz',
      extends: 'baz'
    }
  ]
}
