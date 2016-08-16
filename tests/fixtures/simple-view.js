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
          children: [
            {
              model: 'firstName'
            }
          ]
        },
        {
          children: [
            {
              model: 'lastName'
            }
          ]
        },
        {
          children: [
            {
              model: 'alias'
            }
          ]
        }
      ]
    }
  }
}
