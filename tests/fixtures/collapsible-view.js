export default {
  'version': '2.0',
  'type': 'form',
  'cells': [
    {
      'extends': 'main',
      'label': 'Main'
    }
  ],
  'cellDefinitions': {
    'main': {
      'extends': 'search'
    },
    'search': {
      'model': 'p',
      'collapsible': true
    }
  }
}
