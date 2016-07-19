'use strict'

module.exports = {
  version: '2.0',
  type: 'form',

  cellDefinitions: {
    alias: {
      children: [
        {model: 'alias'}
      ]
    },
    name: {
      children: [
        {model: 'firstName'},
        {model: 'lastName'}
      ]
    }
  },

  cells: [
    {label: 'Name', extends: 'name'},
    {label: 'Alias', extends: 'alias'}
  ]
}
