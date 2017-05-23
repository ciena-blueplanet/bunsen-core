module.exports = {
  cells: [{
    children: [{
      id: 'showTags',
      model: {
        type: 'boolean'
      },
      internal: true
    }, {
      model: 'tags',
      arrayOptions: {},
      conditions: [{
        if: [{
          '_internal.showTags': {equals: true}
        }]
      }]
    }]
  }],
  version: 2.0,
  type: 'form'
}
