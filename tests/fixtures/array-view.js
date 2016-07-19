module.exports = {
  version: '2.0',
  type: 'form',
  cells: [
    {
      label: 'Main',
      extends: 'main'
    }
  ],
  cellDefinitions: {
    addresses: {
      children: [
        {
          model: 'street'
        },
        {
          model: 'city'
        },
        {
          model: 'state'
        },
        {
          model: 'zip'
        }
      ]
    },
    main: {
      children: [
        {
          model: 'name',
          extends: 'name'
        },
        {
          model: 'addresses',
          item: {
            extends: 'addresses'
          }
        }
      ]
    },
    name: {
      children: [
        {
          model: 'first'
        },
        {
          model: 'last'
        }
      ]
    }
  }
}
