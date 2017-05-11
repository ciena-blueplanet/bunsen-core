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

  it('normalizeCellDefinitions() normalizes cell definitions', () => {
    const state = deepFreeze({
      model: {
        properties: {},
        type: 'object'
      },
      view: {
        cellDefinitions: {
          bar: {
            id: 'bar',
            model: {
              type: 'string'
            }
          },
          foo: {
            id: 'foo',
            model: {
              type: 'number'
            }
          }
        },
        cells: [
          {
            extends: 'foo'
          },
          {
            extends: 'bar'
          }
        ],
        type: 'form',
        version: '2.0'
      }
    })

    const actual = stuff.normalizeCellDefinitions(state)

    expect(actual).to.eql({
      model: {
        properties: {
          bar: {
            type: 'string'
          },
          foo: {
            type: 'number'
          }
        },
        type: 'object'
      },
      view: {
        cellDefinitions: {
          bar: {
            model: 'bar'
          },
          foo: {
            model: 'foo'
          }
        },
        cells: [
          {
            extends: 'foo'
          },
          {
            extends: 'bar'
          }
        ],
        type: 'form',
        version: '2.0'
      }
    })
  })

  describe('normalizeCell()', () => {
    it('normalizes cell without children', () => {
      const state = deepFreeze({
        model: {
          properties: {
            foo: {
              type: 'string'
            }
          },
          type: 'object'
        },
        view: {
          cells: [
            {
              id: 'test',
              model: {
                type: 'number'
              }
            }
          ],
          type: 'form',
          version: '2.0'
        }
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
        parents: [
          actual.view,
          actual.view.cells
        ],
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
      const state = deepFreeze({
        model: {
          properties: {
            foo: {
              type: 'string'
            }
          },
          type: 'object'
        },
        view: {
          cells: [
            {
              id: 'test',
              internal: true,
              model: {
                type: 'number'
              }
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })

      const cell = state.view.cells[0]
      const parents = [state.view, state.view.cells]
      const actual = stuff.normalizeCell(state, cell, parents)

      expect(actual).to.eql({
        model: {
          properties: {
            _internal: {
              properties: {
                test: {
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
        },
        parents: [
          actual.view,
          actual.view.cells
        ],
        view: {
          cells: [
            {
              model: '_internal.test'
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })
    })

    it('normalizes cell with children', () => {
      const state = deepFreeze({
        model: {
          properties: {
            foo: {
              type: 'string'
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
            }
          ],
          type: 'form',
          version: '2.0'
        }
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
        parents: [
          actual.view,
          actual.view.cells
        ],
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
      const state = deepFreeze({
        model: {
          properties: {
            foo: {
              type: 'string'
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
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })

      const cell = state.view.cells[0]
      const parents = [state.view, state.view.cells]
      const actual = stuff.normalizeCell(state, cell, parents)

      expect(actual).to.eql({
        model: {
          properties: {
            _internal: {
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
            },
            foo: {
              type: 'string'
            }
          },
          type: 'object'
        },
        parents: [
          actual.view,
          actual.view.cells
        ],
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
              model: '_internal.test'
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })
    })

    it('normalizes internal cell with nested children', () => {
      const state = deepFreeze({
        model: {
          properties: {
            foo: {
              type: 'string'
            }
          },
          type: 'object'
        },
        view: {
          cells: [
            {
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
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })

      const cell = state.view.cells[0]
      const parents = [state.view, state.view.cells]
      const actual = stuff.normalizeCell(state, cell, parents)

      expect(actual).to.eql({
        model: {
          properties: {
            _internal: {
              properties: {
                test: {
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
              },
              type: 'object'
            },
            foo: {
              type: 'string'
            }
          },
          type: 'object'
        },
        parents: [
          actual.view,
          actual.view.cells
        ],
        view: {
          cells: [
            {
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
              model: '_internal.test'
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })
    })

    it('normalizes nested cell without children', () => {
      const state = deepFreeze({
        model: {
          properties: {},
          type: 'object'
        },
        view: {
          cells: [
            {
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
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })

      const cell = state.view.cells[0]
      const parents = [state.view, state.view.cells]
      const actual = stuff.normalizeCell(state, cell, parents)

      expect(actual).to.eql({
        model: {
          properties: {
            foo: {
              type: 'string'
            }
          },
          type: 'object'
        },
        parents: [
          actual.view,
          actual.view.cells
        ],
        view: {
          cells: [
            {
              children: [
                {
                  children: [
                    {
                      model: 'foo'
                    }
                  ]
                }
              ]
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })
    })

    it('normalizes nested sibling cells without children', () => {
      const state = deepFreeze({
        model: {
          properties: {
            test: {
              type: 'string'
            }
          },
          type: 'object'
        },
        view: {
          cells: [
            {
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
            }
          ],
          type: 'form',
          version: '2.0'
        }
      })

      const cell = state.view.cells[0]
      const parents = [state.view, state.view.cells]
      const actual = stuff.normalizeCell(state, cell, parents)

      expect(actual).to.eql({
        model: {
          properties: {
            bar: {
              type: 'string'
            },
            foo: {
              type: 'string'
            },
            test: {
              type: 'string'
            }
          },
          type: 'object'
        },
        parents: [
          actual.view,
          actual.view.cells
        ],
        view: {
          cells: [
            {
              children: [
                {
                  model: 'test'
                },
                {
                  children: [
                    {
                      model: 'foo'
                    },
                    {
                      model: 'bar'
                    }
                  ]
                }
              ]
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
      const view = deepFreeze({
        cells: [
          {
            id: 'test',
            model: {
              type: 'string'
            }
          }
        ],
        type: 'form',
        version: '2.0'
      })

      const nodes = [view, view.cells, view.cells[0]]
      const actual = stuff.normalizeCellProperties(nodes, 'test')

      expect(actual.parents).to.eql([
        actual.view,
        actual.view.cells,
        actual.view.cells[0]
      ])

      expect(actual.view).to.eql({
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
      const view = deepFreeze({
        cells: [
          {
            children: [
              {
                id: 'test',
                model: {
                  type: 'string'
                }
              }
            ]
          }
        ],
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

      expect(actual.parents).to.eql([
        actual.view,
        actual.view.cells,
        actual.view.cells[0],
        actual.view.cells[0].children,
        actual.view.cells[0].children[0]
      ])

      expect(actual.view).to.eql({
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
      const view = deepFreeze({
        cellDefinitions: {
          main: {
            id: 'test',
            model: {
              type: 'string'
            }
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

      const nodes = [view, view.cellDefinitions, view.cellDefinitions.main]
      const actual = stuff.normalizeCellProperties(nodes, 'test')

      expect(actual.parents).to.eql([
        actual.view,
        actual.view.cellDefinitions,
        actual.view.cellDefinitions.main
      ])

      expect(actual.view).to.eql({
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
      const view = deepFreeze({
        cellDefinitions: {
          main: {
            children: [
              {
                id: 'test',
                model: {
                  type: 'string'
                }
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

      const nodes = [
        view,
        view.cellDefinitions,
        view.cellDefinitions.main,
        view.cellDefinitions.main.children,
        view.cellDefinitions.main.children[0]
      ]

      const actual = stuff.normalizeCellProperties(nodes, 'test')

      expect(actual.parents).to.eql([
        actual.view,
        actual.view.cellDefinitions,
        actual.view.cellDefinitions.main,
        actual.view.cellDefinitions.main.children,
        actual.view.cellDefinitions.main.children[0]
      ])

      expect(actual.view).to.eql({
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

  it('normalizeCells() normalizes various types of cells', () => {
    const state = deepFreeze({
      model: {
        properties: {
          foo: {
            type: 'string'
          }
        },
        type: 'object'
      },
      view: {
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
      }
    })

    const actual = stuff.normalizeCells(state)

    expect(actual).to.eql({
      model: {
        properties: {
          _internal: {
            properties: {
              bravo: {
                type: 'number'
              },
              delta: {
                type: 'number'
              }
            },
            type: 'object'
          },
          alpha: {
            type: 'boolean'
          },
          charlie: {
            type: 'string'
          },
          foo: {
            type: 'string'
          }
        },
        type: 'object'
      },
      view: {
        cells: [
          {
            model: 'foo'
          },
          {
            model: 'alpha'
          },
          {
            model: '_internal.bravo'
          },
          {
            children: [
              {
                model: 'charlie'
              },
              {
                model: '_internal.delta'
              }
            ],
            label: 'Test'
          }
        ],
        type: 'form',
        version: '2.0'
      }
    })
  })

  it('normalizeChildren() normalizes children', () => {
    const state = deepFreeze({
      model: {
        properties: {
          foo: {
            type: 'string'
          }
        },
        type: 'object'
      },
      view: {
        cells: [
          {
            children: [
              {
                id: 'bar',
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
      }
    })

    const cell = state.view.cells[0]
    const parents = [state.view, state.view.cells]

    const actual = stuff.normalizeChildren(state, cell, parents)

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
      parents: [
        actual.view,
        actual.view.cells
      ],
      view: {
        cells: [
          {
            children: [
              {
                model: 'bar'
              }
            ],
            label: 'Test'
          }
        ],
        type: 'form',
        version: '2.0'
      }
    })
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
            model: 'foo'
          }
        },
        cells: [
          {
            extends: 'main'
          },
          {
            model: 'bar'
          }
        ],
        type: 'form',
        version: '2.0'
      }
    })
  })
})
