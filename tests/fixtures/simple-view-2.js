module.exports = {
  version: '2.0',
  type: 'form',
  cells: [
    {
      extends: 'main'
    }
  ],
  cellDefinitions: {
    foo: {
      children: []
    },
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
        },
        {
          extends: 'foo',
          model: 'foo'
        }
      ]
    }
  }
}
