export default {
  containers: [
    {
      className: 'facets',
      id: 'main',
      rows: [
        [{container: 'search'}]
      ]
    },
    {
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
