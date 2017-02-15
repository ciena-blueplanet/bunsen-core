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
          model: 'lastName',
          conditions: [{
            unless: [{
              firstName: {equals: 'Cher'}
            }]
          }]
        },
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
    }
  ]
}
