module.exports = {
  version: '2.0',
  type: 'form',
  cells: [{
    extends: 'main'
  }],
  cellDefinitions: {
    'foo/0': {
      children: [{
        model: 'bar'
      }]
    },
    main: {
      children: [{
        model: 'foo',
        arrayOptions: {
          itemCell: [{
            model: '0',
            extends: 'foo/0'
          }, {
            model: '1'
          }]
        }
      }]
    }
  }
}
