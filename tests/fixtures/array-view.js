module.exports = {
  version: '2.0',
  type: 'form',
  cells: [
    {
      label: 'Main',
      container: 'main'
    }
  ],
  containers: [
    {
      id: 'main',
      children: [
        [
          {
            model: 'name',
            container: 'name'
          }
        ],
        [
          {
            model: 'addresses',
            item: {
              container: 'addresses'
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
