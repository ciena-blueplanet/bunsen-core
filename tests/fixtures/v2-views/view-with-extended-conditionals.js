module.exports = {
  version: '2.0',
  type: 'form',
  cells: [
    {
      label: 'Main',
      children: [
        {
          model: 'firstName'
        },
        {
          extends: 'lastName'
        },
        {
          extends: 'alias'
        }
      ]
    }
  ],
  cellDefinitions: {
    lastName: {
      model: 'lastName',
      conditions: [{
        unless: [{
          firstName: {equals: 'Cher'}
        }]
      }]
    },
    alias: {
      model: 'alias',
      conditions: [{
        if: [{
          firstName: {equals: 'Bruce'},
          lastName: {equals: 'Wayne'}
        }]
      }]
    }
  }
}
