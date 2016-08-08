module.exports = {
  containers: [
    {
      id: 'main',
      rows: [
        [{container: 'search'}]
      ]
    },
    {
      collapsible: true,
      id: 'search',
      label: 'Search',
      rows: [
        [{
          model: 'p'
        }]
      ]
    }
  ],
  rootContainers: [
    {
      container: 'main',
      label: 'Main'
    }
  ],
  type: 'form',
  version: '1.0'
}
