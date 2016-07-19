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
