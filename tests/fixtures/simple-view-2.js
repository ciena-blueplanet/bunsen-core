module.exports = {
  version: '2.0',
  type: 'form',
  cells: [
    {
      extends: 'main'
    }
  ],
  cellDefinitions: {
    main: {
      children: [
        {
          model: 'firstName'
        },
        {
          model: 'lastName'
        },
        {
          model: 'alias'
        }
      ]
    }
  }
}
