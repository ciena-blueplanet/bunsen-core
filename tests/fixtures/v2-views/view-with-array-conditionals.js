module.exports = {
  version: '2.0',
  type: 'form',
  cells: [
    {
      label: 'Main',
      model: 'superheroes',
      arrayOptions: {
        itemCell: {
          extends: 'superhero'
        }
      }
    }
  ],
  cellDefinitions: {
    superhero: {
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
    },
    firstName: {
      model: 'firstName'
    },
    lastName: {
      model: 'lastName',
      conditions: [{
        unless: [{
          './firstName': {equals: 'Cher'}
        }]
      }]
    },
    alias: {
      model: 'alias',
      conditions: [{
        if: [{
          './firstName': {equals: 'Bruce'},
          './lastName': {equals: 'Wayne'}
        }]
      }]
    }
  }
}
