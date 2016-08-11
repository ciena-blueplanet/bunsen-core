module.exports = {
  cellDefinitions: {
    main: {
      children: [
        {
          extends: 'search'
        }
      ]
    },
    search: {
      children: [
        {
          model: 'p'
        }
      ],
      collapsible: true,
      label: 'Search'
    }
  },
  cells: [
    {
      extends: 'main'
    }
  ],
  type: 'form',
  version: '2.0'
}
