'use strict'
var expect = require('chai').expect
var evaluate = require('../lib/view-conditions')

// Fixtures
var simpleView = require('./fixtures/v2-views/view-with-conditional')
var extensionsView = require('./fixtures/v2-views/view-with-extended-conditionals')
var complexConditional = require('./fixtures/v2-views/complex-conditionals-view')
var arrayConditional = require('./fixtures/v2-views/view-with-array-conditionals')
var complexConditionalView = complexConditional.view
var ExpectedComplexConditional = complexConditional.ExpectedComplexConditional
var ExpectedValue = require('./fixtures/expected-value')
const expectedBase = {
  version: '2.0',
  type: 'form',
  cells: [
    {
      label: 'Main',
      children: [{
        model: 'firstName'
      }]
    }
  ]
}

class ExpectedSimpleValue extends ExpectedValue {
  constructor () {
    super(expectedBase)
    this.lastNameIncluded = false
    this.aliasIncluded = false
  }
  includeLastName () {
    if (this.lastNameIncluded) {
      return this
    }
    this._value.cells[0].children.push({
      model: 'lastName'
    })
    this.lastNameIncluded = true
    return this
  }
  includeAlias () {
    if (this.aliasIncluded) {
      return this
    }
    this._value.cells[0].children.push({
      model: 'alias'
    })
    this.aliasIncluded = true
    return this
  }
}

class ExpectedExtendedValue extends ExpectedValue {
  constructor () {
    super(expectedBase)
    this._value.cellDefinitions = {
      lastName: {
        model: 'lastName',
        conditions: [{
          unless: [{
            firstName: {equals: 'Cher'}
          }]
        }]
      },
      alias: {
        model: 'alias',
        conditions: [{
          if: [{
            firstName: {equals: 'Bruce'},
            lastName: {equals: 'Wayne'}
          }]
        }]
      }
    }
    this.lastNameIncluded = false
    this.aliasIncluded = false
  }
  includeLastName () {
    if (this.lastNameIncluded) {
      return this
    }

    this._value.cells[0].children.push({
      model: 'lastName'
    })

    return this
  }

  includeAlias () {
    if (this.aliasIncluded) {
      return this
    }

    this._value.cells[0].children.push({
      model: 'alias'
    })

    return this
  }
}

class ExpectedArrayValue extends ExpectedValue {
  constructor () {
    super({
      version: '2.0',
      type: 'form',
      cells: [
        {
          label: 'Main',
          model: 'superheroes',
          arrayOptions: {
            inline: false,
            autoAdd: true,
            itemCell: [{
              children: [
                {
                  model: 'firstName'
                },
                {
                  model: 'lastName'
                }
              ]
            }, {
              children: [
                {
                  model: 'firstName'
                },
                {
                  model: 'lastName'
                },
                {
                  model: 'alias'
                }
              ]
            }, {
              children: [
                {
                  model: 'firstName'
                },
                {
                  model: 'lastName'
                }
              ]
            }, {
              children: [
                {
                  model: 'firstName'
                }
              ]
            }]
          }
        }, {
          label: 'Foo',
          model: 'foo',
          arrayOptions: {
            tupleCells: [{
              children: [{
                model: 'bar'
              }, {
                model: 'baz'
              }]
            }, {
              model: 'include'
            }]
          }
        }
      ],
      cellDefinitions: {
        superhero: {
          children: [
            {
              model: 'firstName'
            },
            {
              extends: 'lastName'
            },
            {
              extends: 'alias'
            }
          ]
        },
        firstName: {
          model: 'firstName'
        },
        lastName: {
          model: 'lastName',
          conditions: [{
            unless: [{
              './firstName': {equals: 'Cher'}
            }]
          }]
        },
        alias: {
          model: 'alias',
          conditions: [{
            if: [{
              './firstName': {equals: 'Bruce'},
              './lastName': {equals: 'Wayne'}
            }]
          }]
        }
      }
    })
  }
}

describe('views with conditionals', function () {
  describe('hide cells when', function () {
    it('"unless" conditions are met', function () {
      var result = evaluate(simpleView, {
        firstName: 'Cher'
      })

      expect(result).to.be.eql(new ExpectedSimpleValue().value)
    })
    it('"if" conditions are not met', function () {
      var result = evaluate(simpleView, {
        firstName: 'Bart'
      })
      expect(result).to.be.eql(
        new ExpectedSimpleValue()
        .includeLastName()
        .value
      )
    })
    it('cells extend cells with a condition that is not met', function () {
      var result = evaluate(extensionsView, {firstName: 'Bart'})

      expect(result).to.be.eql(
        new ExpectedExtendedValue()
        .includeLastName()
        .value
      )
    })
  })

  describe('show cells when', function () {
    it('conditions are met', function () {
      var result = evaluate(simpleView, {
        firstName: 'Bruce',
        lastName: 'Wayne'
      })
      expect(result).to.be.eql(
        new ExpectedSimpleValue()
        .includeLastName()
        .includeAlias()
        .value
     )
    })

    it('conditions of extended cells', function () {
      var result = evaluate(extensionsView, {
        firstName: 'Bruce',
        lastName: 'Wayne'
      })

      expect(result).to.be.eql(
        new ExpectedExtendedValue()
        .includeLastName()
        .includeAlias()
        .value
      )
    })
  })

  describe('handle complex cases like', function () {
    it('children of an extended cell extending another cell', function () {
      var result = evaluate(complexConditionalView, {
        name: {
          firstName: 'Norman',
          lastName: 'Osborne'
        },
        isSuperHero: false
      })

      expect(result).to.be.eql(
        new ExpectedComplexConditional()
        .value
      )
    })

    it('checking against siblings', function () {
      var result = evaluate(complexConditionalView, {
        name: {
          firstName: 'Peter',
          lastName: 'Parker'
        }
      })

      expect(result).to.be.eql(
        new ExpectedComplexConditional()
        .includeAlterEgo()
        .value
      )
    })

    it('checking against siblings of ancestors', function () {
      var result = evaluate(complexConditionalView, {
        name: {
          firstName: 'Tony',
          lastName: 'Stark'
        },
        isSuperHero: true
      })

      expect(result).to.be.eql(
        new ExpectedComplexConditional()
        .includeAlias()
        .value
      )
    })

    it('an "if" and "unless" block defined on the same condtion', function () {
      var result = evaluate(complexConditionalView, {
        name: {
          firstName: 'Luke',
          lastName: 'Cage'
        },
        isSuperHero: true
      })

      expect(result).to.be.eql(
        new ExpectedComplexConditional()
        .value
      )
    })
    it('an array items', function () {
      var result = evaluate(arrayConditional, {
        superheroes: [{
          firstName: 'Luke',
          lastName: 'Cage'
        }, {
          firstName: 'Bruce',
          lastName: 'Wayne'
        }, {
          firstName: 'Peter',
          lastName: 'Parker'
        }, {
          firstName: 'Cher'
        }],
        foo: [{bar: '', baz: ''}, true]
      })
      expect(result).to.be.eql(
        new ExpectedArrayValue()
        .value
      )
    })
  })

  describe('do not convert invalid cells type to array', function () {
    expect({
      cells: 'main',
      type: 'form',
      version: '2.0'
    }, {}).to.eql({
      cells: 'main',
      type: 'form',
      version: '2.0'
    })
  })
})
