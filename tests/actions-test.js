var expect = require('chai').expect
var actions = require('../lib/actions')
var _ = require('lodash')
var sinon = require('sinon')
var RSVP = require('rsvp')

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
      undefined,
      false,
      mergeDefaults)

    var defaultValue
    thunk(function (action) {
      if (action.value) {
        defaultValue = action.value
      }
    }, function () {
      return {
        value: defaultValue,
        model: schema
      }
    })

    return defaultValue
  }

  it('should use the latest model to validate against', function () {
    const beforeSchema = {
      type: 'object'
    }
    const afterSchema = {
      type: 'object',
      required: ['foo'],
      properties: {
        foo: {type: 'string'}
      }
    }

    var thunk = actions.validate(null, {}, beforeSchema, [])

    thunk(function (action) {
      if (action.type === actions.VALIDATION_RESOLVED) {
        expect(action.errors).to.eql({
          'foo': [
            'Field is required.'
          ]
        })
      }
    }, function () {
      return {
        value: {},
        model: afterSchema
      }
    })
  })

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

  it('fills in defaults for non-object values', function () {
    var defaultValue = getDefaultValue('someotherProp.name.firstName', {}, SCHEMA_WITH_DEEP_DEFAULTS)

    expect(defaultValue).to.eql('Bruce')
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
      },
      get model () {
        return {type: 'object'}
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
        },
        model: schema
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
        var thunk = actions.validate(null, _.cloneDeep(state.value), schema, [], undefined, Promise.all, false)

        thunk(
          spy,
          function () {
            return _.cloneDeep(state)
          }
        )

        expect(spy.callCount).to.equal(2)
      })

      it('dispatches action when forceValidation is enabled', function () {
        var thunk = actions.validate(null, _.cloneDeep(state.value), schema, [], undefined, Promise.all, true)

        thunk(
          spy,
          function () {
            return _.cloneDeep(state)
          }
        )

        expect(spy.callCount).to.equal(1)
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
        var thunk = actions.validate('alias', _.cloneDeep(state.value.alias), schema, [], undefined, Promise.all, false)

        thunk(
          spy,
          function () {
            return _.cloneDeep(state)
          }
        )

        expect(spy.callCount).to.equal(0)
      })

      it('dispatches action when forceValidation is enabled', function () {
        var thunk = actions.validate('alias', _.cloneDeep(state.value.alias), schema, [], undefined, Promise.all, true)

        thunk(
          spy,
          function () {
            return _.cloneDeep(state)
          }
        )

        expect(spy.callCount).to.equal(1)
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

function _validator (errors = [], warnings = []) {
  return (formValue, field = 'foo') => {
    return RSVP.resolve({
      value: {
        errors: errors.map((error) => {
          return _.assign({}, error, {path: `#/${field}`})
        }),
        warnings
      }
    })
  }
}
describe('custom validators', function () {
  describe('form validators', function () {
    it('should call form validators', function (done) {
      var thunk = actions.validate(null, {
        foo: 'bar'
      }, {}, [_validator([{
        path: '#/foo',
        message: 'I do no like bars'
      }]), _validator([], [{
        path: '#/foo',
        message: 'They are bad'
      }])], undefined, RSVP.all)

      thunk((action) => {
        if (action.type === actions.VALIDATION_RESOLVED) {
          expect(action.validationResult).to.deep.eql({
            errors: [{
              path: '#/foo',
              message: 'I do no like bars'
            }],
            warnings: [{
              path: '#/foo',
              message: 'They are bad'
            }]})
          done()
        }
      }, () => {
        return {
          value: {
            foo: 'foo'
          },
          model: {
            type: 'object',
            properties: {
              foo: {
                type: 'string'
              }
            }
          }
        }
      })
    })
  })

  function _changeValue (state, action) {
    if (action.type === actions.CHANGE_VALUE) {
      state.value = action.value
    }
  }
  describe('field validators', function () {
    let state, getState
    beforeEach(function () {
      state = {
        value: {
          foo: 'foo'
        },
        model: {
          type: 'object',
          properties: {
            foo: {
              type: 'string'
            },
            bar: {
              type: 'string'
            }
          }
        }
      }

      getState = () => state
    })

    describe('ensure validation are called', function () {
      function validateFieldAndValidatorCalled (thunk, done, expectedErrors) {
        thunk((action) => {
          _changeValue(state, action)
          if (action.type === actions.VALIDATION_RESOLVED && action.fieldErrors) {
            expect(action.fieldValidationResult).to.deep.eql({
              errors: [{
                path: '#/foo',
                field: 'foo',
                validationId: 'foo-0',
                message: 'I do no like bars'
              }],
              warnings: []})
            done()
          }
        }, getState)
      }
      it('should call field and validator', function (done) {
        var thunk = actions.validate(null, {
          foo: 'bar',
          bar: 'foo'
        }, {}, [], [{
          field: 'foo',
          validator: _validator([{
            path: '#/foo',
            message: 'I do no like bars'
          }])
        }], RSVP.all)

        validateFieldAndValidatorCalled(thunk, done)
      })

      it('should call fields and validators', function (done) {
        var thunk = actions.validate(null, {
          foo: 'bar',
          bar: 'foo'
        }, {}, [], [{
          fields: ['foo'],
          validators: [_validator([{
            path: '#/foo',
            message: 'I do no like bars'
          }])]
        }], RSVP.all)

        validateFieldAndValidatorCalled(thunk, done)
      })

      it('should call field and validators', function (done) {
        var thunk = actions.validate(null, {
          foo: 'bar',
          bar: 'foo'
        }, {}, [], [{
          field: 'foo',
          validators: [_validator([{
            path: '#/foo',
            message: 'I do no like bars'
          }])]
        }], RSVP.all)

        validateFieldAndValidatorCalled(thunk, done)
      })

      it('should call fields and validator', function (done) {
        var thunk = actions.validate(null, {
          foo: 'bar',
          bar: 'foo'
        }, {}, [], [{
          fields: ['foo'],
          validator: _validator([{
            path: '#/foo',
            message: 'I do no like bars'
          }])
        }], RSVP.all)

        validateFieldAndValidatorCalled(thunk, done)
      })

      it('should call all fields and validators', function (done) {
        let count = 0
        var thunk = actions.validate(null, {
          foo: 'bar',
          bar: 'foo'
        }, {}, [], [{
          fields: ['foo', 'bar'],
          validators: [_validator([{
            path: '#/foo',
            message: 'I do no like bars'
          }]), _validator([{
            path: '#/bar',
            message: 'I do no like foo'
          }])]
        }], RSVP.all)

        thunk((action) => {
          _changeValue(state, action)
          if (action.type === actions.VALIDATION_RESOLVED && action.fieldErrors) {
            count++
            state.fieldErrors = action.fieldErrors
            state.fieldValidationResult = action.fieldValidationResult
            if (count === 4) {
              expect(state.fieldValidationResult).to.deep.eql({
                errors: [{
                  path: '#/foo',
                  field: 'foo',
                  validationId: 'foo-0',
                  message: 'I do no like bars'
                }, {
                  path: '#/foo',
                  field: 'foo',
                  validationId: 'foo-1',
                  message: 'I do no like foo'
                },
                {
                  path: '#/bar',
                  field: 'bar',
                  validationId: 'bar-0',
                  message: 'I do no like bars'
                },
                {
                  path: '#/bar',
                  field: 'bar',
                  validationId: 'bar-1',
                  message: 'I do no like foo'
                }],
                warnings: []})
              done()
            }
          }
        }, getState)
      })
      function debouncePromise (f, interval) {
        let timer = null

        return (...args) => {
          clearTimeout(timer)
          return new Promise((resolve) => {
            timer = setTimeout(
              () => resolve(f(...args)),
              interval
            )
          })
        }
      }
      it('should dispatch all validations indivdually', function (done) {
        let count = 0
        var thunk = actions.validate(null, {
          foo: 'bar',
          bar: 'foo'
        }, {}, [], [{
          field: 'foo',
          validators: [debouncePromise(_validator([{
            path: '#/foo',
            message: 'I do no like bars'
          }]), 400), _validator([{
            path: '#/bar',
            message: 'I do no like foo'
          }])]
        }], RSVP.all)

        // eslint-disable-next-line complexity
        thunk((action) => {
          _changeValue(state, action)
          if (action.type === actions.VALIDATION_RESOLVED && action.fieldErrors) {
            count++
            switch (count) {
              case 1:
                expect(action.fieldValidationResult).to.deep.eql({
                  errors: [{
                    path: '#/foo',
                    field: 'foo',
                    validationId: 'foo-1',
                    message: 'I do no like foo'
                  }],
                  warnings: []
                })
                break
              case 2:
                expect(action.fieldValidationResult).to.deep.eql({
                  errors: [{
                    path: '#/foo',
                    field: 'foo',
                    validationId: 'foo-0',
                    message: 'I do no like bars'
                  }],
                  warnings: []
                })
                done()
                break
            }
          }
        }, getState)
      })
    })
  })
})
