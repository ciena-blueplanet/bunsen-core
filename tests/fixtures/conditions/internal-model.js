module.exports = {
  properties: {
    tags: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tagType: {
            type: 'string'
          },
          tag: {
            type: 'string'
          }
        }
      }
    }
  },
  type: 'object'
}
