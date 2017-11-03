/* global File */
var expect = require('chai').expect
var sinon = require('sinon')
var reducerExports = require('../lib/reducer')
var actions = require('../lib/actions')
var actionReducers = reducerExports.actionReducers
var reducer = reducerExports.reducer

var REDUX_INIT = '@@redux/INIT'

describe('reducer', function () {
  var sandbox

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    sandbox.stub(console, 'error')
  })

  afterEach(function () {
    sandbox.restore()
  })

  ;[
    REDUX_INIT,
    actions.CHANGE,
    actions.CHANGE_MODEL,
    actions.CHANGE_VALUE,
    actions.VALIDATION_RESOLVED
  ]
    .forEach((actionType) => {
      describe(`when action type is ${actionType}`, function () {
        var action, reducedState, state

        beforeEach(function () {
          action = {
            type: actionType
          }

          state = {
            foo: 'bar'
          }

          function stub () {
            return 'out'
          }

          sandbox.stub(actionReducers, actionType, stub)

          reducedState = reducer(state, action)
        })

        it('calls correct action reducer', function () {
          expect(actionReducers[actionType].callCount).to.equal(1)
          expect(actionReducers[actionType].lastCall.args).to.eql([state, action])
        })

        it('returns reduced state from action reducer', function () {
          expect(reducedState).to.equal('out')
        })

        it('does not log error', function () {
          expect(console.error.callCount).to.equal(0)
        })
      })
    })

  describe('when action type is CHANGE', function () {
    beforeEach(function () {
      sandbox.stub(actionReducers, actions.CHANGE_VALUE).returns({})
      sandbox.stub(actionReducers, actions.CHANGE_VIEW).returns({})
      sandbox.stub(actionReducers, actions.CHANGE_MODEL).returns({})
    })

    describe('when action.value is set', function () {
      beforeEach(function () {
        reducer({}, {
          type: actions.CHANGE,
          value: {}
        })
      })

      it('should call the CHANGE_VALUE reducer', function () {
        expect(actionReducers[actions.CHANGE_VALUE].callCount).to.equal(1)
      })

      it('should not call the CHANGE_MODEL reducer', function () {
        expect(actionReducers[actions.CHANGE_MODEL].callCount).to.equal(0)
      })

      it('should not call the CHANGE_VIEW reducer', function () {
        expect(actionReducers[actions.CHANGE_VIEW].callCount).to.equal(0)
      })
    })

    describe('when action.model is set', function () {
      beforeEach(function () {
        reducer({}, {
          type: actions.CHANGE,
          model: {}
        })
      })

      it('should not call the CHANGE_VALUE reducer', function () {
        expect(actionReducers[actions.CHANGE_VALUE].callCount).to.equal(0)
      })

      it('should call the CHANGE_MODEL reducer', function () {
        expect(actionReducers[actions.CHANGE_MODEL].callCount).to.equal(1)
      })

      it('should not call the CHANGE_VIEW reducer', function () {
        expect(actionReducers[actions.CHANGE_VIEW].callCount).to.equal(0)
      })
    })

    describe('when action.model/view/value is set', function () {
      beforeEach(function () {
        reducer({}, {
          type: actions.CHANGE,
          model: {},
          value: {},
          view: {}
        })
      })

      it('should call the CHANGE_VALUE reducer', function () {
        expect(actionReducers[actions.CHANGE_VALUE].callCount).to.equal(1)
      })

      it('should call the CHANGE_MODEL reducer', function () {
        expect(actionReducers[actions.CHANGE_MODEL].callCount).to.equal(1)
      })

      it('should call the CHANGE_VIEW reducer', function () {
        expect(actionReducers[actions.CHANGE_VIEW].callCount).to.equal(1)
      })
    })

    describe('when action.view is set', function () {
      beforeEach(function () {
        reducer({}, {
          type: actions.CHANGE,
          view: {}
        })
      })

      it('should not call the CHANGE_VALUE reducer', function () {
        expect(actionReducers[actions.CHANGE_VALUE].callCount).to.equal(0)
      })

      it('should not call the CHANGE_MODEL reducer', function () {
        expect(actionReducers[actions.CHANGE_MODEL].callCount).to.equal(0)
      })

      it('should call the CHANGE_VIEW reducer', function () {
        expect(actionReducers[actions.CHANGE_VIEW].callCount).to.equal(1)
      })
    })
  })

  describe('unknown state', function () {
    var reducedState, state

    beforeEach(function () {
      state = {
        foo: 'bar'
      }

      reducedState = reducer(state, {type: 'bolt'})
    })

    it('logs error', function () {
      expect(console.error.callCount).to.equal(1)
      expect(console.error.lastCall.args).to.eql(['Do not recognize action bolt'])
    })

    it('returns state that was passed in', function () {
      expect(reducedState).to.equal(state)
    })
  })

  describe('initial state', function () {
    it('should be what we want', function () {
      var initialState = reducer({}, {type: REDUX_INIT})

      expect(initialState.errors).to.eql({})
      expect(initialState.validationResult).to.eql({warnings: [], errors: []})
      expect(initialState.value).to.eql(null)
    })

    it('does not remove required arrays', function () {

    })
  })

  describe('value manipulation', function () {
    beforeEach(function () {
      global.File = function () {
        // Empty so that recursiveClean would normally try to prune it
      }
    })

    it('can change a value', function () {
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: {
          foo: 12,
          bar: {
            qux: 'cheese'
          }
        },
        baseModel: {}
      }
      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: 'wine', bunsenId: 'bar.qux'})
      expect(changedState.value.bar.qux).to.eql('wine')
      expect(changedState.value.foo).to.eql(12)
    })

    it('can remove a value', function () {
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: {
          foo: 12,
          bar: {
            qux: 'cheese'
          }
        },
        baseModel: {}
      }
      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: '', bunsenId: 'bar.qux'})
      expect(changedState.value).to.eql({foo: 12, bar: {}})
    })

    it('can set the entire value', function () {
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: {
          foo: 12,
          bar: {
            qux: 'cheese'
          }
        },
        baseModel: {}
      }
      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: {baz: 22}, bunsenId: null})
      expect(changedState.value).to.eql({baz: 22})
    })

    it('can handle a value with a "length" property', function () {
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: {},
        baseModel: {}
      }

      var value = {
        foo: {
          bar: {
            length: 3,
            fizz: 'bang'
          }
        }
      }

      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: value, bunsenId: null})
      expect(changedState.value).to.eql(value)
    })

    describe('When handling a File value', function () {
      'use strict'
      let exampleFile

      beforeEach(function () {
        exampleFile = new File()
      })

      it('will not strip Files when changing the whole form value', function () {
        let initialState = {
          errors: {},
          validationResult: {warnings: [], errors: []},
          value: {},
          baseModel: {}
        }

        let value = {
          foo: {
            bar: exampleFile
          }
        }

        let changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: value, bunsenId: null})
        expect(changedState.value).to.eql(value)
      })

      it('will not strip Files when changing nested values', function () {
        let initialState = {
          errors: {},
          validationResult: {warnings: [], errors: []},
          value: {},
          baseModel: {}
        }

        let expectedValue = {
          file: exampleFile
        }

        let changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: exampleFile, bunsenId: 'file'})
        expect(changedState.value).to.eql(expectedValue)
      })
    })

    it('will prune all the dead wood when setting root object', function () {
      var model = {
        type: 'object',
        properties: {
          foo: {
            type: 'object',
            properties: {
              bar: {
                type: 'object',
                properties: {
                  baz: {
                    type: 'null'
                  },
                  qux: {
                    type: 'number'
                  }
                }
              },
              waldo: {
                type: 'null'
              },
              buzz: {
                type: 'boolean'
              },
              fizz: {
                type: 'boolean'
              }
            }
          }
        }
      }
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: null,
        baseModel: model,
        model
      }
      var newValue = {
        foo: {
          bar: {
            baz: null,
            qux: 12
          },
          waldo: null,
          buzz: true,
          fizz: false
        }
      }

      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: newValue, bunsenId: null})
      expect(changedState.value).to.eql({foo: {bar: {qux: 12}, buzz: true, fizz: false}})
    })

    it('will prune all the dead wood out of a complex array', function () {
      var model = {
        type: 'object',
        properties: {
          a: {
            type: 'object',
            properties: {
              b1: {
                type: 'array'
              },
              b2: {
                type: 'array'
              }
            }
          }
        }
      }
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: null,
        baseModel: model,
        model
      }
      var newValue = {
        a: {
          b1: [
            {c1: {
              d: null
            }},
            {c2: 12},
            {c3: [1, 2, 3]}
          ],
          b2: []
        }
      }

      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: newValue, bunsenId: null})
      expect(changedState.value).to.eql({a: {b1: [{c1: {}}, {c2: 12}, {c3: [1, 2, 3]}]}})
    })

    it('should remove empty objects that are required', function () {
      var model = {
        type: 'object',
        properties: {
          foo: {
            type: 'object'
          }
        },
        required: ['foo']
      }

      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: {
          foo: {
            bar: 'baz'
          }
        },
        baseModel: model,
        model
      }

      var storedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: {foo: {}}, bunsenId: null})
      expect(storedState.value).to.eql({})
    })

    it('should not preserve empty objects that are required', function () {
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: {
          foo: {
            fooProp: 'test'
          },
          bar: {
            baz: {
              bazProp: 'test'
            }
          }
        },
        basemodel: {
          type: 'object',
          properties: {
            foo: {
              type: 'object'
            },
            bar: {
              type: 'object',
              properties: {
                baz: {
                  type: 'object',
                  properties: {
                    bazProp: {
                      type: 'string'
                    }
                  }
                }
              },
              required: ['baz']
            }
          },
          required: ['foo']
        }
      }

      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: {}, bunsenId: 'foo'})
      expect(changedState.value).to.eql({bar: {baz: {bazProp: 'test'}}})
      changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: {}, bunsenId: 'bar.baz'})
      expect(changedState.value).to.eql({foo: {fooProp: 'test'}, bar: {}})
    })

    it('should not preserve empty arrays that are required', function () {
      var model = {
        type: 'object',
        properties: {
          foo: {
            type: 'array'
          },
          bar: {
            type: 'object',
            properties: {
              baz: {
                type: 'array',
                item: {
                  type: 'string'
                }
              }
            },
            required: ['baz']
          }
        },
        required: ['foo']
      }

      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: {
          foo: ['foo item'],
          bar: {
            baz: ['baz item']
          }
        },
        baseModel: model,
        model
      }

      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: [], bunsenId: 'foo'})
      expect(changedState.value).to.eql({bar: {baz: ['baz item']}})
      changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: [], bunsenId: 'bar.baz'})
      expect(changedState.value).to.eql({foo: ['foo item'], bar: {}})
    })

    it('should clear deadwood for arrays within arrays', function () {
      var model = {
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  bar: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  }
                },
                required: ['bar']
              }
            }
          }
        },
        required: ['foo']
      }
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: {
          foo: [[{
            bar: ['some array element']
          }]]
        },
        baseModel: model,
        model
      }
      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: [], bunsenId: 'foo.0.0.bar'})
      expect(changedState.value).to.eql({foo: [[{}]]})
    })

    it('can insert values into tuple arrays at specific indices', function () {
      const model = {
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: [{
              type: 'string'
            }, {
              type: 'number'
            }, {
              type: 'boolean'
            }]
          }
        }
      }
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: {foo: ['test']},
        baseModel: model,
        model
      }
      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: true, bunsenId: 'foo.3'})
      expect(changedState.value).to.eql({foo: ['test', undefined, undefined, true]})
    })

    describe('using autoClean', function () {
      'use strict'
      it('will not prune values when nested model prop has autoClean set to false', function () {
        const model = {
          type: 'object',
          properties: {
            things: {
              type: 'array',
              items: {
                autoClean: false,
                type: 'object',
                properties: {
                  name: {type: 'string'}
                }
              }
            }
          }
        }

        const initialState = {
          errors: {},
          validationResult: {warnings: [], errors: []},
          value: {},
          model
        }

        const value = {
          things: [
            {name: ''},
            {name: ''}
          ]
        }

        const changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: value, bunsenId: null})

        expect(changedState.value).to.eql(value)
      })

      it('will prune values when nested model prop has autoClean set to true', function () {
        const model = {
          type: 'object',
          properties: {
            things: {
              type: 'array',
              items: {
                autoClean: true,
                type: 'object',
                properties: {
                  name: {type: 'string'}
                }
              }
            }
          }
        }

        const initialState = {
          errors: {},
          validationResult: {warnings: [], errors: []},
          value: {},
          model
        }

        const value = {
          things: [
            {name: ''},
            {name: ''}
          ]
        }

        const changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: value, bunsenId: null})

        expect(changedState.value).to.eql({
          things: [
            {},
            {}
          ]
        })
      })

      it('will prune values when nested model prop doess not have autoClean set', function () {
        const model = {
          type: 'object',
          properties: {
            things: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {type: 'string'}
                }
              }
            }
          }
        }

        const initialState = {
          errors: {},
          validationResult: {warnings: [], errors: []},
          value: {},
          model
        }

        const value = {
          things: [
            {name: ''},
            {name: ''}
          ]
        }

        const changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: value, bunsenId: null})

        expect(changedState.value).to.eql({
          things: [
            {},
            {}
          ]
        })
      })
    })
  })

  describe('can set the validation', function () {
    it('basic functionality', function () {
      var initialState = {
        errors: ['this is broken'],
        validationResult: ['this sucks'],
        value: {},
        baseModel: {}
      }
      var changedState = reducer(initialState, {
        type: actions.VALIDATION_RESOLVED, errors: [], validationResult: ['you look kinda fat']
      })

      expect(changedState).to.eql({
        errors: [],
        lastAction: 'VALIDATION_RESOLVED',
        validationResult: ['you look kinda fat'],
        value: {},
        baseModel: {}
      })
    })
  })
})
