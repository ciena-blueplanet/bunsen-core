module.exports = {
  version: '2.0',
  type: 'form',
  cells: [
    {
      label: 'Main',
      extends: 'main'
    }
  ],
  cellDefinitions: [
    {
      id: 'main',
      children: [
        [
          {
            model: 'name',
            extends: 'name'
          }
        ],
        [
          {
            model: 'addresses',
            item: {
              extends: 'addresses'
            }
          }
        ]
      ]
    },
    {
      id: 'name',
      children: [
        [
          {
            model: 'first'
          }
        ],
        [
          {
            model: 'last'
          }
        ]
      ]
    },
    {
      id: 'addresses',
      children: [
        [
          {
            model: 'street'
          }
        ],
        [
          {
            model: 'city'
          }
        ],
        [
          {
            model: 'state'
          }
        ],
        [
          {
            model: 'zip'
          }
        ]
      ]
    }
  ]
}
