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
      'extends': 'search'
    },
    'search': {
      'model': 'p',
      'collapsible': true
    }
  }
}
