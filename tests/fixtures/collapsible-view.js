module.exports = {
  cellDefinitions: {
    main: {
      children: [
        {
          children: [
            {
              extends: 'search'
            }
          ]
        }
      ]
    },
    search: {
      children: [
        {
          children: [
            {
              model: 'p'
            }
          ]
        }
      ],
      collapsible: true,
      label: 'Search'
    }
  },
  cells: [
    {
      extends: 'main',
      label: 'Main'
    }
  ],
  type: 'form',
  version: '2.0'
}
