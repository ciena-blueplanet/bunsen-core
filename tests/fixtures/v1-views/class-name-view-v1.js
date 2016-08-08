module.exports = {
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
          model: 'p',
          className: 'test-class',
          labelClassName: 'label-test-class',
          inputClassName: 'input-test-class'
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
