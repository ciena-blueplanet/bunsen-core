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
            extends: 'lastName'
          }
        ],
        [
          {
            extends: 'alias'
          }
        ]
      ]
    },
    {
      id: 'lastName',
      model: 'lastName',
      conditions: [{
        unless: [{
          firstName: {equals: 'Cher'}
        }]
      }]
    },
    {
      id: 'alias',
      model: 'alias',
      conditions: [{
        if: [{
          firstName: {equals: 'Bruce'},
          lastName: {equals: 'Wayne'}
        }]
      }]
    }
  ]
}
