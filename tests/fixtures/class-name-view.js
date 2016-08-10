module.exports = {
  'version': '2.0',
  'type': 'form',
  'cells': [
    {
      'extends': 'main'
    }
  ],
  'cellDefinitions': {
    'main': {
      classNames: {
        cell: 'facets'
      },
      'extends': 'search'
    },
    'search': {
      'model': 'p',
      classNames: {
        cell: 'test-class',
        label: 'label-test-class',
        value: 'input-test-class'
      }
    }
  }
}
