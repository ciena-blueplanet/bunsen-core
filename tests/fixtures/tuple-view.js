module.exports = {
  version: '2.0',
  type: 'form',
  cells: [{
    extends: 'main'
  }],
  cellDefinitions: {
    'foo.0': {
      children: [{
        model: 'bar'
      }]
    },
    fooItems: {
      children: [{
        model: 'baz'
      }]
    },
    main: {
      children: [{
        model: 'foo',
        arrayOptions: {
          itemCell: {
            extends: 'fooItems'
          }
        },
        children: [{
          model: '0',
          extends: 'foo.0'
        }, {
          model: '1'
        }]
      }]
    }
  }
}
