'use strict'

module.exports = {
  version: '1.0',
  type: 'form',

  cellDefinitions: {
    foo: {
      children: []
    },
    bar: {}
  },

  cells: [
    {
      label: 'Foo',
      extends: 'foo'
    },
    {
      label: 'Bar',
      extends: 'bar'
    }
  ]
}
