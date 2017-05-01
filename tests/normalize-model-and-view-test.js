var expect = require('chai').expect

const stuff = require('../lib/normalize-model-and-view')

describe('normalize model and view', function () {
  describe('addBunsenModelProperty()', () => {
    let model

    beforeEach(() => {
      model = Object.freeze({
        properties: Object.freeze({
          bar: Object.freeze({
            properties: Object.freeze({
              baz: Object.freeze({
                type: 'string'
              })
            }),
            type: 'object'
          }),
          foo: Object.freeze({
            type: 'string'
          })
        }),
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
      const state = Object.freeze({
        model: Object.freeze({
          properties: Object.freeze({
            foo: Object.freeze({
              type: 'string'
            })
          }),
          type: 'object'
        }),
        view: Object.freeze({
          cells: Object.freeze([
            Object.freeze({
              id: 'test',
              model: Object.freeze({
                type: 'number'
              })
            })
          ]),
          type: 'form',
          version: '2.0'
        })
      })

      const cell = state.view.cells[0]
      const parents = [state.view, state.view.cells]
      const actual = stuff.normalizeCell(state, cell, parents)

      expect(actual).to.eql({
        model: {
          properties: {
            foo: {
              type: 'string'
            },
            test: {
              type: 'number'
            }
          },
          type: 'object'
        },
        view: {
          cells: [
            {
              model: 'test'
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })
    })

    it('normalizes internal cell without children', () => {
      const state = Object.freeze({
        model: Object.freeze({
          properties: Object.freeze({
            foo: Object.freeze({
              type: 'string'
            })
          }),
          type: 'object'
        }),
        view: Object.freeze({
          cells: Object.freeze([
            Object.freeze({
              id: 'test',
              internal: true,
              model: Object.freeze({
                type: 'number'
              })
            })
          ]),
          type: 'form',
          version: '2.0'
        })
      })

      const cell = state.view.cells[0]
      const parents = [state.view, state.view.cells]
      const actual = stuff.normalizeCell(state, cell, parents)

      expect(actual).to.eql({
        model: {
          properties: {
            foo: {
              type: 'string'
            },
            internal: {
              properties: {
                test: {
                  type: 'number'
                }
              },
              type: 'object'
            }
          },
          type: 'object'
        },
        view: {
          cells: [
            {
              model: 'internal.test'
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })
    })

    it('normalizes cell with children', () => {
      const state = Object.freeze({
        model: Object.freeze({
          properties: Object.freeze({
            foo: Object.freeze({
              type: 'string'
            })
          }),
          type: 'object'
        }),
        view: Object.freeze({
          cells: Object.freeze([
            Object.freeze({
              children: Object.freeze([
                Object.freeze({
                  model: 'foo'
                }),
                Object.freeze({
                  model: 'bar'
                })
              ]),
              id: 'test',
              model: Object.freeze({
                properties: Object.freeze({
                  bar: Object.freeze({
                    type: 'number'
                  }),
                  foo: Object.freeze({
                    type: 'string'
                  })
                }),
                type: 'object'
              })
            })
          ]),
          type: 'form',
          version: '2.0'
        })
      })

      const cell = state.view.cells[0]
      const parents = [state.view, state.view.cells]
      const actual = stuff.normalizeCell(state, cell, parents)

      expect(actual).to.eql({
        model: {
          properties: {
            foo: {
              type: 'string'
            },
            test: {
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
          },
          type: 'object'
        },
        view: {
          cells: [
            {
              children: [
                {
                  model: 'foo'
                },
                {
                  model: 'bar'
                }
              ],
              model: 'test'
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })
    })

    it('normalizes internal cell with children', () => {
      const state = Object.freeze({
        model: Object.freeze({
          properties: Object.freeze({
            foo: Object.freeze({
              type: 'string'
            })
          }),
          type: 'object'
        }),
        view: Object.freeze({
          cells: Object.freeze([
            Object.freeze({
              children: Object.freeze([
                Object.freeze({
                  model: 'foo'
                }),
                Object.freeze({
                  model: 'bar'
                })
              ]),
              id: 'test',
              internal: true,
              model: Object.freeze({
                properties: Object.freeze({
                  bar: Object.freeze({
                    type: 'number'
                  }),
                  foo: Object.freeze({
                    type: 'string'
                  })
                }),
                type: 'object'
              })
            })
          ]),
          type: 'form',
          version: '2.0'
        })
      })

      const cell = state.view.cells[0]
      const parents = [state.view, state.view.cells]
      const actual = stuff.normalizeCell(state, cell, parents)

      expect(actual).to.eql({
        model: {
          properties: {
            foo: {
              type: 'string'
            },
            internal: {
              properties: {
                test: {
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
              },
              type: 'object'
            }
          },
          type: 'object'
        },
        view: {
          cells: [
            {
              children: [
                {
                  model: 'foo'
                },
                {
                  model: 'bar'
                }
              ],
              model: 'internal.test'
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })
    })
  })

  describe('normalizeCellProperties()', () => {
    it('updates view when top level cell', () => {
      const view = Object.freeze({
        cells: Object.freeze([
          Object.freeze({
            id: 'test',
            model: Object.freeze({
              type: 'string'
            })
          })
        ]),
        type: 'form',
        version: '2.0'
      })

      const nodes = [view, view.cells, view.cells[0]]
      const actual = stuff.normalizeCellProperties(nodes, 'test')

      expect(actual).to.eql({
        cells: [
          {
            model: 'test'
          }
        ],
        type: 'form',
        version: '2.0'
      })
    })

    it('updates view when nested in top level cell', () => {
      const view = Object.freeze({
        cells: Object.freeze([
          Object.freeze({
            children: Object.freeze([
              Object.freeze({
                id: 'test',
                model: Object.freeze({
                  type: 'string'
                })
              })
            ])
          })
        ]),
        type: 'form',
        version: '2.0'
      })

      const nodes = [
        view,
        view.cells,
        view.cells[0],
        view.cells[0].children,
        view.cells[0].children[0]
      ]

      const actual = stuff.normalizeCellProperties(nodes, 'test')

      expect(actual).to.eql({
        cells: [
          {
            children: [
              {
                model: 'test'
              }
            ]
          }
        ],
        type: 'form',
        version: '2.0'
      })
    })

    it('updates view when top level cell definition', () => {
      const view = Object.freeze({
        cellDefinitions: Object.freeze({
          main: Object.freeze({
            id: 'test',
            model: Object.freeze({
              type: 'string'
            })
          })
        }),
        cells: Object.freeze([
          Object.freeze({
            extends: 'main'
          })
        ]),
        type: 'form',
        version: '2.0'
      })

      const nodes = [view, view.cellDefinitions, view.cellDefinitions.main]
      const actual = stuff.normalizeCellProperties(nodes, 'test')

      expect(actual).to.eql({
        cellDefinitions: {
          main: {
            model: 'test'
          }
        },
        cells: [
          {
            extends: 'main'
          }
        ],
        type: 'form',
        version: '2.0'
      })
    })

    it('updates view when nested in cell definition', () => {
      const view = Object.freeze({
        cellDefinitions: Object.freeze({
          main: Object.freeze({
            children: Object.freeze([
              Object.freeze({
                id: 'test',
                model: Object.freeze({
                  type: 'string'
                })
              })
            ])
          })
        }),
        cells: Object.freeze([
          Object.freeze({
            extends: 'main'
          })
        ]),
        type: 'form',
        version: '2.0'
      })

      const nodes = [
        view,
        view.cellDefinitions,
        view.cellDefinitions.main,
        view.cellDefinitions.main.children,
        view.cellDefinitions.main.children[0]
      ]

      const actual = stuff.normalizeCellProperties(nodes, 'test')

      expect(actual).to.eql({
        cellDefinitions: {
          main: {
            children: [
              {
                model: 'test'
              }
            ]
          }
        },
        cells: [
          {
            extends: 'main'
          }
        ],
        type: 'form',
        version: '2.0'
      })
    })
  })
})
