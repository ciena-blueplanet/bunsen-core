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
            model: 'firstName'
          }
        ],
        [
          {
            model: 'lastName'
          }
        ],
        [
          {
            model: 'alias'
          }
        ]
      ]
    }
  ]
}
