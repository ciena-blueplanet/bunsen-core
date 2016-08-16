module.exports = {
  version: '2.0',
  type: 'form',
  cells: [
    {
      extends: 'main'
    }
  ],
  cellDefinitions: {
    addresses: {
      children: [
        {
          children: [
            {
              model: 'street'
            }
          ]
        },
        {
          children: [
            {
              model: 'city'
            }
          ]
        },
        {
          children: [
            {
              model: 'state'
            }
          ]
        },
        {
          children: [
            {
              model: 'zip'
            }
          ]
        }
      ]
    },
    main: {
      children: [
        {
          children: [
            {
              model: 'name',
              extends: 'name'
            }
          ]
        },
        {
          children: [
            {
              model: 'addresses',
              arrayOptions: {
                itemCell: {
                  extends: 'addresses'
                }
              }
            }
          ]
        }
      ]
    },
    name: {
      children: [
        {
          children: [
            {
              model: 'first'
            }
          ]
        },
        {
          children: [
            {
              model: 'last'
            }
          ]
        }
      ]
    }
  }
}
