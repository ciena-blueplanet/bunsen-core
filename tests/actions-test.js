var expect = require('chai').expect
var actions = require('../lib/actions')
var _ = require('lodash')
var sinon = require('sinon')

describe('changeValue action', function () {
  it(`returns a dispatcher action with type "${actions.CHANGE_VALUE}"`, function () {
    var action = actions.changeValue('some.path', 'value')

    expect(action).to.eql({
      type: actions.CHANGE_VALUE,
      bunsenId: 'some.path',
      value: 'value'
    })
  })
})

describe('validate action', function () {
  var SCHEMA_WITH_DEFAULTS = {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        default: 'Bruce'
      },
      lastName: {
        type: 'string',
        default: 'Wayne'
      },
      alias: {
        type: 'string',
        title: 'Nickname',
        default: 'Batman'
      },
      onlyChild: {
        type: 'boolean',
        default: true
      },
      age: {
        type: 'number',
        title: 'Age'
      }
    },
    required: ['lastName']
  }

  var SCHEMA_WITH_OBJECT_DEFAULTS = {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        default: 'Bruce'
      },
      lastName: {
        type: 'string',
        default: 'Wayne'
      },
      alias: {
        type: 'string',
        title: 'Nickname',
        default: 'Batman'
      },
      onlyChild: {
        type: 'boolean',
        default: true
      },
      age: {
        type: 'number',
        title: 'Age'
      }
    },
    required: ['lastName'],
    default: {
      firstName: 'Clark',
      lastName: 'Kent',
      alias: 'Superman'
    }
  }
  var SCHEMA_WITH_DEEP_DEFAULTS = {
    type: 'object',
    properties: {
      someotherProp: {
        type: 'object',
        properties: {
          name: {
            type: 'object',
            properties: {
              firstName: {
                type: 'string',
                default: 'Bruce'
              },
              lastName: {
                type: 'string',
                default: 'Wayne'
              }
            }
          }
        }
      },
      alias: {
        type: 'string',
        title: 'Nickname',
        default: 'Batman'
      }
    },
    required: ['alias']
  }

  var SCHEMA_WITH_PARENT_DEFAULTS = {
    type: 'object',
    properties: {
      firstName: {
        type: 'string'
      },
      lastName: {
        type: 'string',
        default: 'Wayne'
      },
      alias: {
        type: 'string',
        title: 'Nickname'
      },
      onlyChild: {
        type: 'boolean'
      },
      age: {
        type: 'number',
        title: 'Age'
      }
    },
    required: ['lastName'],
    default: {
      firstName: 'Clark',
      lastName: 'Kent',
      alias: 'Superman',
      onlyChild: true
    }
  }

  var SCHEMA_WITH_REFS = {
    type: 'object',
    properties: {
      hero: {
        type: 'object',
        '$ref': '#/definitions/superhero'
      }
    },
    required: ['hero'],
    definitions: {
      superhero: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            default: 'Bruce'
          },
          lastName: {
            type: 'string',
            default: 'Wayne'
          },
          alias: {
            type: 'string',
            title: 'Nickname',
            default: 'Batman'
          }
        }
      }
    }
  }

  var SCHEMA_WITH_NO_DEFAULTS = {
    type: 'object',
    properties: {
      someotherProp: {
        type: 'object',
        properties: {
          name: {
            type: 'object',
            properties: {
              firstName: {
                type: 'string'
              },
              lastName: {
                type: 'string'
              }
            }
          }
        }
      },
      alias: {
        type: 'string',
        title: 'Nickname'
      }
    }
  }

  var SCHEMA_WITH_ARRAY_DEFAULTS = {
    type: 'object',
    properties: {
      superheroes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              default: 'Bruce'
            },
            lastName: {
              type: 'string',
              default: 'Wayne'
            },
            alias: {
              type: 'string',
              title: 'Nickname',
              default: 'Batman'
            }
          }
        }
      }
    }
  }

  function getDefaultValue (path, initialValue, schema, mergeDefaults) {
    if (mergeDefaults === undefined) {
      mergeDefaults = false
    }

    var thunk = actions.validate(
      path,
      initialValue,
      schema,
      [],
      undefined,
      false,
      mergeDefaults)
    var defaultValue = {}

    thunk(function (action) {
      _.assign(defaultValue, action.value)
    }, function () { return {} })

    return defaultValue
  }

  it('fills in defaults', function () {
    var defaultValue = getDefaultValue(null, {}, SCHEMA_WITH_DEFAULTS)
    expect(defaultValue).to.eql({
      firstName: 'Bruce',
      lastName: 'Wayne',
      alias: 'Batman',
      onlyChild: true
    })
  })

  it('should merge defaults when mergeDefaults is true', function () {
    var defaultValue = getDefaultValue(null, {firstName: 'Bruce'}, SCHEMA_WITH_DEFAULTS, true)
    expect(defaultValue).to.eql({
      firstName: 'Bruce',
      lastName: 'Wayne',
      alias: 'Batman',
      onlyChild: true
    })
  })

  it('fills in defaults for specific values', function () {
    var defaultValue = getDefaultValue('someotherProp.name', {}, SCHEMA_WITH_DEEP_DEFAULTS)

    expect(defaultValue).to.eql({
      firstName: 'Bruce',
      lastName: 'Wayne'
    })
  })

  it('handles defaults in deep objects', function () {
    var defaultValue = getDefaultValue(null, {}, SCHEMA_WITH_DEEP_DEFAULTS)
    expect(defaultValue).to.eql({
      someotherProp: {
        name: {
          firstName: 'Bruce',
          lastName: 'Wayne'
        }
      },
      alias: 'Batman'
    })
  })

  it('handles defaults for objects', function () {
    var defaultValue = getDefaultValue(null, {}, SCHEMA_WITH_OBJECT_DEFAULTS)
    expect(defaultValue).to.eql({
      firstName: 'Clark',
      lastName: 'Kent',
      alias: 'Superman',
      onlyChild: true
    })
  })

  it('handles defaults for deep objects with parent defaults', function () {
    var defaultValue = getDefaultValue(null, {}, SCHEMA_WITH_PARENT_DEFAULTS)
    expect(defaultValue).to.eql({
      firstName: 'Clark',
      lastName: 'Kent',
      alias: 'Superman',
      onlyChild: true
    })
  })

  it('handles defaults in refs', function () {
    var defaultValue = getDefaultValue(null, {}, SCHEMA_WITH_REFS)
    expect(defaultValue).to.eql({
      hero: {
        firstName: 'Bruce',
        lastName: 'Wayne',
        alias: 'Batman'
      }
    })
  })

  it('handles a schema with no defaults', function () {
    var defaultValue = getDefaultValue(null, {}, SCHEMA_WITH_NO_DEFAULTS)
    expect(defaultValue).to.eql({})
  })

  it('should not initialize required object without defaults', function () {
    var model = {
      type: 'object',
      properties: {
        foo: {
          type: 'object'
        }
      },
      required: ['foo']
    }

    var defaultValue = getDefaultValue(null, {}, model)
    expect(defaultValue).to.eql({})
  })

  function getState () {
    return {
      get value () {
        return {}
      }
    }
  }

  it('resolves if no validators are given', function () {
    var schema = _.cloneDeep(SCHEMA_WITH_DEFAULTS)
    delete schema.required
    var thunk = actions.validate(null, {}, schema, [])
    thunk(function (action) {
      if (action.type === actions.VALIDATION_RESOLVED) {
        expect(action.errors).to.eql({})
      }
    }, getState)
  })

  describe('when value is the same', function () {
    var schema, state, spy

    beforeEach(function () {
      schema = _.cloneDeep(SCHEMA_WITH_NO_DEFAULTS)
      spy = sinon.spy()
      state = {
        value: {
          alias: 'Bob'
        }
      }
    })

    // NOTE: the full form value always re-triggers validation. Otherwise we get
    // ourselves into a state where defaults aren't applied.
    describe('check entire form for changes', function () {
      it('dispatches action', function () {
        var thunk = actions.validate(null, _.cloneDeep(state.value), schema, [])

        thunk(
          spy,
          function () {
            return _.cloneDeep(state)
          }
        )

        expect(spy.callCount).to.equal(2)
      })

      it('dispatches action when forceValidation is disabled', function () {
        var thunk = actions.validate(null, _.cloneDeep(state.value), schema, [], Promise.all, false)

        thunk(
          spy,
          function () {
            return _.cloneDeep(state)
          }
        )

        expect(spy.callCount).to.equal(2)
      })

      it('dispatches action when forceValidation is enabled', function () {
        var thunk = actions.validate(null, _.cloneDeep(state.value), schema, [], Promise.all, true)

        thunk(
          spy,
          function () {
            return _.cloneDeep(state)
          }
        )

        expect(spy.callCount).to.equal(2)
      })
    })

    describe('check property for changes', function () {
      it('does not dispatch action', function () {
        var thunk = actions.validate('alias', _.cloneDeep(state.value.alias), schema, [])

        thunk(
          spy,
          function () {
            return _.cloneDeep(state)
          }
        )

        expect(spy.callCount).to.equal(0)
      })

      it('does not dispatch action when forceValidation is disabled', function () {
        var thunk = actions.validate('alias', _.cloneDeep(state.value.alias), schema, [], Promise.all, false)

        thunk(
          spy,
          function () {
            return _.cloneDeep(state)
          }
        )

        expect(spy.callCount).to.equal(0)
      })

      it('dispatches action when forceValidation is enabled', function () {
        var thunk = actions.validate('alias', _.cloneDeep(state.value.alias), schema, [], Promise.all, true)

        thunk(
          spy,
          function () {
            return _.cloneDeep(state)
          }
        )

        expect(spy.callCount).to.equal(2)
      })
    })
  })

  it('handles defaults for new array elements', function () {
    var defaultValue = getDefaultValue('superheroes.0', {}, SCHEMA_WITH_ARRAY_DEFAULTS)

    expect(defaultValue).to.eql({
      firstName: 'Bruce',
      lastName: 'Wayne',
      alias: 'Batman'
    })
  })
})
