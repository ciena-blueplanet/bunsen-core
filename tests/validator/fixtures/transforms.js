'use strict'

module.exports = {
  version: '2.0',
  type: 'form',

  containers: [
    {
      id: 'main',
      rows: [
        [{model: 'firstName'}],
        [{model: 'lastName'}],
        [{
          model: 'alias',
          readTransforms: [
            {
              from: '@kernelthekat',
              to: 'Cutest Cat Ever!'
            }
          ],
          writeTransforms: [
            {
              from: 'Cute Cat',
              to: '@kernelthekat'
            }
          ]
        }]
      ]
    }
  ],

  cells: [{label: 'Main', container: 'main'}]
}
