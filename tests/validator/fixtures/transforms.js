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
        [{
          model: 'alias',
          transforms: {
            read: [
              {
                from: '@kernelthekat',
                to: 'Cutest Cat Ever!'
              }
            ],
            write: [
              {
                from: 'Cute Cat',
                to: '@kernelthekat'
              }
            ]
          }
        }]
      ]
    }
  ],

  cells: [{label: 'Main', extends: 'main'}]
}
