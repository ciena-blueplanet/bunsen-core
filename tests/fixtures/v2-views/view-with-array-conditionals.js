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
    }, {
      label: 'Foo',
      model: 'foo',
      arrayOptions: {
        tupleCells: [{
          children: [{
            model: 'bar'
          }, {
            model: 'baz',
            conditions: [{
              if: [{
                '../1': {equals: true}
              }]
            }]
          }]
        }, {
          model: 'include'
        }]
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
