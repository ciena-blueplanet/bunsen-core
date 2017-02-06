module.exports = {
  version: '2.0',
  type: 'form',
  rootContainers: [
    {
      label: 'Main',
      container: 'main'
    }
  ],
  containers: [
    {
      id: 'main',
      rows: [
        [
          {
            model: 'firstName'
          }
        ],
        [
          {
            model: 'lastName',
            conditions: [{
              unless: [{
                firstName: {equals: 'Cher'}
              }]
            }]
          }
        ],
        [
          {
            model: 'alias',
            conditions: [{
              if: [{
                firstName: {equals: 'Bruce'},
                lastName: {equals: 'Wayne'}
              }]
            }]
          }
        ]
      ]
    }
  ]
}
