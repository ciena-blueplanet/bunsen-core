var expect = require('chai').expect

const stuff = require('../lib/normalize-model-and-view')
const deepFreeze = require('./deep-freeze')

describe('normalize model and view', function () {
  describe('addBunsenModelProperty()', () => {
    var model

    beforeEach(() => {
      model = deepFreeze({
        properties: {
          bar: {
            properties: {
              baz: {
                type: 'string'
              }
            },
            type: 'object'
          },
          foo: {
            type: 'string'
          }
        },
        type: 'object'
      })
    })

    it('adds top level property that is not present', () => {
      const partial = {type: 'number'}
      const actual = stuff.addBunsenModelProperty(model, partial, 'properties.jazzHands')

      expect(actual).to.eql({
        properties: {
          bar: {
            properties: {
              baz: {
                type: 'string'
              }
            },
            type: 'object'
          },
          foo: {
            type: 'string'
          },
          jazzHands: {
            type: 'number'
          }
        },
        type: 'object'
      })
    })

    it('adds nested property that is not present', () => {
      const partial = {type: 'number'}
      const actual = stuff.addBunsenModelProperty(model, partial, 'properties.bar.properties.jazzHands')

      expect(actual).to.eql({
        properties: {
          bar: {
            properties: {
              baz: {
                type: 'string'
              },
              jazzHands: {
                type: 'number'
              }
            },
            type: 'object'
          },
          foo: {
            type: 'string'
          }
        },
        type: 'object'
      })
    })

    it('adds nested property and parent when not present', () => {
      const partial = {type: 'number'}
      const actual = stuff.addBunsenModelProperty(model, partial, 'properties.spam.properties.jazzHands')

      expect(actual).to.eql({
        properties: {
          bar: {
            properties: {
              baz: {
                type: 'string'
              }
            },
            type: 'object'
          },
          foo: {
            type: 'string'
          },
          spam: {
            properties: {
              jazzHands: {
                type: 'number'
              }
            },
            type: 'object'
          }
        },
        type: 'object'
      })
    })
  })

  describe('normalizeCell()', () => {
    it('normalizes cell without children', () => {
      const cell = deepFreeze({
        id: 'test',
        model: {
          type: 'number'
        }
      })

      const actual = stuff.normalizeCell(cell, {})

      expect(actual).to.eql({
        id: 'test',
        model: 'test'
      })
    })

    it('normalizes internal cell without children', () => {
      const cell = deepFreeze({
        id: 'test',
        internal: true,
        model: {
          type: 'number'
        }
      })
      const actual = stuff.normalizeCell(cell, {})

      expect(actual).to.eql({
        id: 'test',
        internal: true,
        model: '_internal.test'
      })
    })

    it('normalizes cell with children', () => {
      const cell = deepFreeze({
        children: [
          {
            model: 'foo'
          },
          {
            model: 'bar'
          }
        ],
        id: 'test',
        model: {
          properties: {
            bar: {
              type: 'number'
            },
            foo: {
              type: 'string'
            }
          },
          type: 'object'
        }
      })

      const actual = stuff.normalizeCell(cell, {})

      expect(actual).to.eql({
        children: [
          {
            model: 'foo'
          },
          {
            model: 'bar'
          }
        ],
        id: 'test',
        model: 'test'
      })
    })

    it('normalizes internal cell with children', () => {
      const cell = deepFreeze({
        children: [
          {
            model: 'foo'
          },
          {
            model: 'bar'
          }
        ],
        id: 'test',
        internal: true,
        model: {
          properties: {
            bar: {
              type: 'number'
            },
            foo: {
              type: 'string'
            }
          },
          type: 'object'
        }
      })

      const actual = stuff.normalizeCell(cell, {})

      expect(actual).to.eql({
        children: [
          {
            model: 'foo'
          },
          {
            model: 'bar'
          }
        ],
        id: 'test',
        internal: true,
        model: '_internal.test'
      })
    })

    it('normalizes internal cell with nested children', () => {
      const cell = deepFreeze({
        children: [
          {
            children: [
              {
                model: 'bar'
              },
              {
                model: 'baz'
              }
            ],
            model: 'foo'
          }
        ],
        id: 'test',
        internal: true,
        model: {
          properties: {
            foo: {
              properties: {
                bar: {
                  type: 'number'
                },
                baz: {
                  type: 'string'
                }
              },
              type: 'object'
            }
          },
          type: 'object'
        }
      })

      const actual = stuff.normalizeCell(cell, {})

      expect(actual).to.eql({
        children: [{
          children: [
            {
              model: 'bar'
            },
            {
              model: 'baz'
            }
          ],
          model: 'foo'
        }],
        model: '_internal.test',
        internal: true,
        id: 'test'
      })
    })

    it('normalizes nested cell without children', () => {
      const cell = deepFreeze({
        children: [
          {
            children: [
              {
                id: 'foo',
                model: {
                  type: 'string'
                }
              }
            ]
          }
        ]
      })

      const actual = stuff.normalizeCell(cell, {})

      expect(actual).to.eql({
        children: [
          {
            children: [
              {
                id: 'foo',
                model: 'foo'
              }
            ]
          }
        ]
      })
    })

    it('normalizes nested sibling cells without children', () => {
      const cell = deepFreeze({
        children: [
          {
            model: 'test'
          },
          {
            children: [
              {
                id: 'foo',
                model: {
                  type: 'string'
                }
              },
              {
                id: 'bar',
                model: {
                  type: 'string'
                }
              }
            ]
          }
        ]
      })

      const actual = stuff.normalizeCell(cell, {})

      expect(actual).to.eql({
        children: [
          {
            model: 'test'
          },
          {
            children: [
              {
                model: 'foo',
                id: 'foo'
              },
              {
                model: 'bar',
                id: 'bar'
              }
            ]
          }
        ]
      })
    })
  })

  it('normalizeCells() normalizes various types of cells', () => {
    const view = deepFreeze({
      cells: [
        {
          model: 'foo'
        },
        {
          id: 'alpha',
          model: {
            type: 'boolean'
          }
        },
        {
          id: 'bravo',
          internal: true,
          model: {
            type: 'number'
          }
        },
        {
          children: [
            {
              id: 'charlie',
              model: {
                type: 'string'
              }
            },
            {
              id: 'delta',
              internal: true,
              model: {
                type: 'number'
              }
            }
          ],
          label: 'Test'
        }
      ],
      type: 'form',
      version: '2.0'
    })

    const actual = stuff.normalizeCells(view)

    expect(actual).to.eql({
      cells: [
        {
          model: 'foo'
        },
        {
          id: 'alpha',
          model: 'alpha'
        },
        {
          id: 'bravo',
          internal: true,
          model: '_internal.bravo'
        },
        {
          children: [
            {
              id: 'charlie',
              model: 'charlie'
            },
            {
              id: 'delta',
              internal: true,
              model: '_internal.delta'
            }
          ],
          label: 'Test'
        }
      ],
      type: 'form',
      version: '2.0'
    })
  })

  it('normalizeChildren() normalizes children', () => {
    const cell = deepFreeze({
      children: [
        {
          id: 'bar',
          model: {
            type: 'number'
          }
        }
      ],
      label: 'Test'
    })

    const actual = stuff.normalizeChildren(cell, {})

    expect(actual).to.eql([{
      id: 'bar',
      model: 'bar'
    }])
  })

  it('default export normalizes everything', () => {
    const state = deepFreeze({
      model: {
        properties: {
          //
        },
        type: 'object'
      },
      view: {
        cellDefinitions: {
          main: {
            id: 'foo',
            model: {
              type: 'string'
            }
          }
        },
        cells: [
          {
            extends: 'main'
          },
          {
            id: 'bar',
            model: {
              type: 'number'
            }
          }
        ],
        type: 'form',
        version: '2.0'
      }
    })

    const actual = stuff.default(state)

    expect(actual).to.eql({
      model: {
        properties: {
          bar: {
            type: 'number'
          },
          foo: {
            type: 'string'
          }
        },
        type: 'object'
      },
      view: {
        cellDefinitions: {
          main: {
            id: 'foo',
            model: {
              type: 'string'
            }
          }
        },
        cells: [
          {
            id: 'foo',
            model: 'foo'
          },
          {
            id: 'bar',
            model: 'bar'
          }
        ],
        type: 'form',
        version: '2.0'
      }
    })
  })
})

describe('normalizes complex cases', function () {
  var model
  var view
  beforeEach(function () {
    model = {
      type: 'object',
      properties: {
        foo: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              bar: {
                type: 'string'
              }
            }
          }
        }
      }
    }
    view = {
      type: 'form',
      version: '2.0',
      cells: [{
        model: 'foo',
        arrayOptions: {
          itemCell: {
            children: [{
              extends: 'baz'
            }, {
              extends: 'quux'
            }, {
              model: 'bar'
            }]
          }
        }
      }],
      cellDefinitions: {
        baz: {
          id: 'baz',
          model: {
            type: 'boolean'
          },
          internal: true
        },
        quux: {
          id: 'quux',
          model: {
            type: 'number'
          },
          internal: false
        }
      }
    }
  })

  it('by adding to model', function () {
    const newState = stuff.default({model, view})
    const newModel = newState.model
    expect(newModel).to.be.eql({
      type: 'object',
      properties: {
        foo: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              bar: {
                type: 'string'
              },
              quux: {
                type: 'number'
              },
              _internal: {
                type: 'object',
                properties: {
                  baz: {
                    type: 'boolean'
                  }
                }
              }
            }
          }
        }
      }
    })
  })

  it('by replacing model objects in views with strings', function () {
    const newState = stuff.default({model, view})
    const newView = newState.view
    expect(newView).to.be.eql({
      type: 'form',
      version: '2.0',
      cells: [{
        model: 'foo',
        arrayOptions: {
          itemCell: {
            children: [{
              id: 'baz',
              internal: true,
              model: '_internal.baz'
            }, {
              id: 'quux',
              internal: false,
              model: 'quux'
            }, {
              model: 'bar'
            }]
          }
        }
      }],
      cellDefinitions: {
        baz: {
          id: 'baz',
          model: {
            type: 'boolean'
          },
          internal: true
        },
        quux: {
          id: 'quux',
          model: {
            type: 'number'
          },
          internal: false
        }
      }
    })
  })
})
