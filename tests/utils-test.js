'use strict'

const expect = require('chai').expect
const utils = require('../lib/utils')
const dependenciesModel = require('./fixtures/dependencies-model.js')

describe('utils', () => {
  describe('.getModelPath()', () => {
    it('returns a BunsenModelPath', function () {
      const model = {

      }
      const path = ''
      const modelPath = utils.getModelPath(model, path)
      expect(modelPath).to.be.instanceOf(utils.BunsenModelPath)
    })
  })
  describe('._getModelPath()', () => {
    it('handles top-level properties', () => {
      expect(utils._getModelPath('fooBar')).to.eql(['fooBar'])
    })

    it('handles nested properties', () => {
      const expected = ['foo', 'bar', 'baz']
      expect(utils._getModelPath('foo.bar.baz')).to.eql(expected)
    })

    it('handles invalid trailing dot reference', () => {
      expect(utils._getModelPath('foo.bar.')).to.eql(undefined)
    })

    it('handles invalid leading dot reference', () => {
      expect(utils._getModelPath('.foo.bar')).to.eql(undefined)
    })

    it('handles model with dependency', () => {
      const expected = ['$dependencies', 'useEft', 'routingNumber']
      expect(utils._getModelPath('routingNumber', 'useEft')).to.eql(expected)
    })

    it('handles model with dependency', () => {
      const expected = ['paymentInfo', '$dependencies', 'useEft', 'routingNumber']
      expect(utils._getModelPath('paymentInfo.routingNumber', 'paymentInfo.useEft')).to.eql(expected)
    })

    it('handles properties on array items', () => {
      const expected = ['foo', 'bar', '0', 'baz']
      expect(utils._getModelPath('foo.bar.0.baz')).to.eql(expected)
    })
  })

  describe('getSubModel', function () {
    it('returns the model from a simplified dot-notation path', function () {
      const model = {
        type: 'object',
        properties: {
          someProp: {
            type: 'string'
          }
        }
      }
      expect(utils.getSubModel(model, 'someProp')).to.be.eql({
        type: 'string'
      })
    })
    it('returns a model from a deep path', function () {
      const model = {
        type: 'object',
        properties: {
          foo: {
            type: 'object',
            properties: {
              bar: {
                type: 'object',
                properties: {
                  baz: {
                    type: 'object',
                    properties: {
                      qux: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      expect(utils.getSubModel(model, 'foo.bar.baz')).to.be.eql({
        type: 'object',
        properties: {
          qux: {
            type: 'string'
          }
        }
      })
    })
    it('returns a model for an array item', function () {
      const model = {
        type: 'object',
        properties: {
          arrayProp: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
      expect(utils.getSubModel(model, 'arrayProp')).to.be.eql({
        type: 'array',
        items: {
          type: 'string'
        }
      })
    })
    it('returns a model for an array item specified by index', function () {
      const model = {
        type: 'object',
        properties: {
          arrayProp: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
      expect(utils.getSubModel(model, 'arrayProp.0')).to.be.eql({
        type: 'string'
      })
    })
    describe('handles tuple arrays', function () {
      const model = {
        type: 'object',
        properties: {
          arrayProp: {
            type: 'array',
            items: [{
              type: 'string'
            }, {
              type: 'number'
            }],
            additionalItems: {
              type: 'boolean'
            }
          }
        }
      }
      it('with index references', function () {
        expect(utils.getSubModel(model, 'arrayProp.1')).to.be.eql({
          type: 'number'
        })
      })
      it('with an additionalItems schema', function () {
        expect(utils.getSubModel(model, 'arrayProp.5')).to.be.eql({
          type: 'boolean'
        })
      })
    })
    it('handles dependencies correctly', function () {
      expect(utils.getSubModel(dependenciesModel, 'paymentInfo.accountNumber', 'paymentInfo.useEft')).to.be.eql({
        type: 'string'
      })
    })
  })

  describe('orch filter processing', () => {
    const objToMine = {
      foo: 'bar',
      fizz: {
        foo: 'bar',
        futz: [
          {
            foo: 'bar'
          },
          {
            fizz: 'buzz',
            farz: 'barz'
          }
        ],
        fatz: 'batz'
      }
    }

    it('finds absolute paths in a value object', () => {
      const expected = 'bar'
      expect(utils.findValue(objToMine, 'fizz.futz.[0].foo')).to.equal(expected)
    })

    it('finds parent paths in the object', () => {
      const startPath = 'fizz.futz.[1].fizz'
      let valuePath = '../../fatz'
      let expected = 'batz'
      expect(utils.findValue(objToMine, valuePath, startPath)).to.equal(expected)
      valuePath = '../[0].foo'
      expected = 'bar'
      expect(utils.findValue(objToMine, valuePath, startPath)).to.equal(expected)
    })

    it('finds sibling paths in the object', () => {
      const startPath = 'fizz.futz.[1].fizz'
      const valuePath = './farz'
      const expected = 'barz'
      expect(utils.findValue(objToMine, valuePath, startPath)).to.equal(expected)
    })

    it('populates variables in orch-style query params ', () => {
      let query = {something: '${fizz.futz[0].foo}'}
      const expected = '{"something":"bar"}'
      expect(utils.parseVariables(objToMine, JSON.stringify(query))).to.equal(expected)
    })

    it('properly configures an Orchestrate query object', () => {
      let startPath = 'fizz.futz.[0].foo'
      let query = {
        resourceType: 'something.this.that',
        q: 'label:thing,someId:${../[1].fizz}',
        p: 'orchState:ac,someOtherId:${foo}'
      }
      let expected = {
        resourceType: 'something.this.that',
        q: 'label:thing,someId:buzz',
        p: 'orchState:ac,someOtherId:bar'
      }
      let actual = utils.populateQuery(objToMine, query, startPath)
      expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected))
    })
  })

  describe('.parseVariables()', function () {
    it('returns an empty string when queryJSON not present', function () {
      expect(utils.parseVariables({}, undefined)).to.equal('')
    })
  })

  describe('.populateQuery()', function () {
    it('does not throw error when query not present', function () {
      expect(() => {
        utils.populateQuery({}, undefined)
      }).not.to.throw()
    })

    it('does not return null when query is not present', function () {
      expect(utils.populateQuery({}, undefined)).not.to.equal(null)
    })

    it('does not return null when query is empty', function () {
      expect(utils.populateQuery({}, {})).not.to.equal(null)
    })

    it('does not throw error when query dependency is not present', function () {
      expect(function () {
        utils.populateQuery({}, {node: '${./node}'})
      }).not.to.throw()
    })

    it('returns null when query dependency is not present', function () {
      expect(utils.populateQuery({}, {node: '${./node}'})).to.equal(null)
    })
  })
  describe('BunsenPath class', function () {
    it('finds a path in nested object schemas', function () {
      const model = {
        type: 'object',
        properties: {
          foo: {type: 'object',
            properties: {
              bar: {
                type: 'object',
                properties: {
                  baz: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
      const path = 'foo.bar.baz'
      const modelPath = new utils.BunsenModelPath(model, path)
      expect(modelPath.toString()).to.be.equal('properties.foo.properties.bar.properties.baz')
    })
    it('finds a path in object schemas with dependencies', function () {
      const model = {
        type: 'object',
        properties: {
          foo: {
            type: 'string'
          }
        },
        dependencies: {
          foo: {
            properties: {
              fooBar: {
                type: 'object',
                properties: {
                  foo: {
                    type: 'string'
                  }
                },
                dependencies: {
                  foo: {
                    properties: {
                      bar: {
                        type: 'object',
                        properties: {
                          foo: {
                            type: 'string'
                          }
                        },
                        dependencies: {
                          foo: {
                            properties: {
                              baz: {
                                type: 'number'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      const path = 'fooBar.bar.baz'
      const modelPath = new utils.BunsenModelPath(model, path)
      expect(modelPath.toString()).to.be.equal(
        'dependencies.foo.properties.fooBar.dependencies.foo.properties.bar.dependencies.foo.properties.baz'
      )
    })
    it('finds a path in array schemas', function () {
      const model = {
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                bar: {
                  type: 'array',
                  items: {
                    type: 'array',
                    items: {
                      type: 'number'
                    }
                  }
                }
              }
            }
          }
        }
      }
      const path = 'foo.0.bar.0.0'
      const modelPath = new utils.BunsenModelPath(model, path)
      expect(modelPath.toString()).to.be.equal('properties.foo.items.properties.bar.items.items')
    })
    it('finds a path in tuple array schemas', function () {
      const model = {
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: [{
              type: 'string'
            }, {
              type: 'object',
              properties: {
                bar: {
                  type: 'array',
                  items: {
                    type: 'array',
                    items: [{
                      type: 'number'
                    }, {
                      type: 'boolean'
                    }]
                  }
                }
              }
            }]
          }
        }
      }
      const path = 'foo.1.bar.0.1'
      const modelPath = new utils.BunsenModelPath(model, path)
      expect(modelPath.toString()).to.be.equal('properties.foo.items.1.properties.bar.items.items.1')
    })
    it('finds a path in tuple array schemas with additionalItems', function () {
      const model = {
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: [{
              type: 'string'
            }],
            additionalItems: {
              type: 'object',
              properties: {
                bar: {
                  type: 'array',
                  items: {
                    type: 'array',
                    items: [{
                      type: 'number'
                    }, {
                      type: 'boolean'
                    }],
                    additionalItems: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
      const path = 'foo.1.bar.0.5'
      const modelPath = new utils.BunsenModelPath(model, path)
      expect(modelPath.toString()).to.be.equal('properties.foo.additionalItems.properties.bar.items.additionalItems')
    })
    it('provides a path from a fairly complex schema', function () {
      const model = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            foo: {
              type: 'object',
              properties: {
                bar: {
                  type: 'array',
                  items: [{
                    type: 'string'
                  }, {
                    type: 'object',
                    properties: {
                      baz: {
                        type: 'array',
                        items: [{
                          type: 'string'
                        }],
                        additionalItems: {
                          type: 'object',
                          properties: {
                            qux: {type: 'string'}
                          }
                        }
                      }
                    }
                  }]
                }
              }
            },
            bar: {
              type: 'string'
            }
          },
          dependencies: {
            foo: ['bar']
          }
        }
      }
      const path = '0.foo.bar.1.baz.4.qux'
      const modelPath = new utils.BunsenModelPath(model, path)
      expect(modelPath.toString()).to.be.equal(
        'items.properties.foo.properties.bar.items.1.properties.baz.additionalItems.properties.qux'
      )
    })
    describe('.append()', function () {
      let modelPath
      beforeEach(function () {
        const model = {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              foo: {
                type: 'object',
                properties: {
                  bar: {
                    type: 'array',
                    items: [{
                      type: 'string'
                    }, {
                      type: 'object',
                      properties: {
                        baz: {
                          type: 'array',
                          items: [{
                            type: 'string'
                          }],
                          additionalItems: {
                            type: 'object',
                            properties: {
                              qux: {type: 'string'}
                            }
                          }
                        }
                      }
                    }]
                  }
                }
              },
              bar: {
                type: 'string'
              }
            },
            dependencies: {
              foo: ['bar']
            }
          }
        }
        // const path = '0.foo.bar.1.baz.4.qux'
        const path = '0.foo'
        modelPath = new utils.BunsenModelPath(model, path)
      })
      it('adds a path segment to the path', function () {
        modelPath.append('bar')
        expect(modelPath.toString()).to.be.equal('items.properties.foo.properties.bar')
      })
      it('adds an array of path segments to the path', function () {
        modelPath.append(['bar', '1', 'baz', '4', 'qux'])
        expect(modelPath.toString()).to.be.equal(
          'items.properties.foo.properties.bar.items.1.properties.baz.additionalItems.properties.qux'
        )
      })
      it('adds multiple path segments when the path segment is dotted notation', function () {
        modelPath.append('bar.1.baz.4.qux')
        expect(modelPath.toString()).to.be.equal(
          'items.properties.foo.properties.bar.items.1.properties.baz.additionalItems.properties.qux'
        )
      })
    })
    describe('when a path on invalid path', function () {
      let modelPath
      beforeEach(function () {
        const model = {
          type: 'object',
          properties: {
            foo: {
              type: 'object',
              properties: {
                bar: {
                  type: 'string'
                }
              }
            }
          }
        }
        const path = 'foo.baz'
        modelPath = new utils.BunsenModelPath(model, path)
      })
      it('the path isValid is set to false', function () {
        expect(modelPath.isValid).to.be.equal(false)
      })
      it('the path can not be added to', function () {
        modelPath.append('bar')
        expect(modelPath._path).to.be.eql(['properties.foo'])
      })
      it('returns undefined for the path', function () {
        const path = modelPath.modelPath()
        expect(path).to.be.equal(undefined)
      })
      it('returns an empty string toString()', function () {
        const str = modelPath.toString()
        expect(str).to.equal('')
      })
    })
    it('.pop() removes the last item', function () {
      const model = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            foo: {
              type: 'object',
              properties: {
                bar: {
                  type: 'array',
                  items: [{
                    type: 'string'
                  }, {
                    type: 'object',
                    properties: {
                      baz: {
                        type: 'array',
                        items: [{
                          type: 'string'
                        }],
                        additionalItems: {
                          type: 'object',
                          properties: {
                            qux: {type: 'string'}
                          }
                        }
                      }
                    }
                  }]
                }
              }
            },
            bar: {
              type: 'string'
            }
          },
          dependencies: {
            foo: ['bar']
          }
        }
      }
      const path = '0.foo.bar.1.baz.4.qux'
      const modelPath = new utils.BunsenModelPath(model, path)
      expect(modelPath.toString()).to.be.equal(
        'items.properties.foo.properties.bar.items.1.properties.baz.additionalItems.properties.qux'
      )
      modelPath.pop()
      expect(modelPath.toString()).to.be.equal(
        'items.properties.foo.properties.bar.items.1.properties.baz.additionalItems'
      )
      modelPath.pop()
      expect(modelPath.toString()).to.be.equal(
        'items.properties.foo.properties.bar.items.1.properties.baz'
      )
      modelPath.pop()
      expect(modelPath.toString()).to.be.equal(
        'items.properties.foo.properties.bar.items.1'
      )
      modelPath.pop()
      expect(modelPath.toString()).to.be.equal(
        'items.properties.foo.properties.bar'
      )
      modelPath.pop()
      expect(modelPath.toString()).to.be.equal(
        'items.properties.foo'
      )
      modelPath.pop()
      expect(modelPath.toString()).to.be.equal(
        'items'
      )
    })
  })
  describe('clearInternals', function () {
    it('clears _internal properties from objects', function () {
      const clearedVal = utils.clearInternals({
        foo: {
          bar: {
            _internal: {
              baz: 'test'
            }
          },
          bix: [{
            test: {_internal: {}},
            _internal: {
            }
          }]
        },
        _internal: {},
        quux: {
          _internal: {},
          test: 'test'
        }
      })
      expect(clearedVal).to.be.eql({
        foo: {
          bar: {},
          bix: [{
            test: {}
          }]
        },
        quux: {
          test: 'test'
        }
      })
    })

    it('leaves other values alone', function () {
      const clearedVal = utils.clearInternals({})
      expect(clearedVal).to.be.eql({})
    })
  })
})
