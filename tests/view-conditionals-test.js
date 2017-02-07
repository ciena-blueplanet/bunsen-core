'use strict'
var _ = require('lodash')
var expect = require('chai').expect
var evaluate = require('../lib/view-conditions')

// Fixtures
var simpleView = require('./fixtures/v2-views/view-with-conditional')
var extensionsView = require('./fixtures/v2-views/view-with-extended-conditionals')

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

class ExpectedValue {
  constructor (base) {
    this._value = _.cloneDeep(base)
  }
  get value () {
    return this._value
  }
}

class ExpectedSimpleValue extends ExpectedValue {
  static create () {
    return new ExpectedSimpleValue()
  }
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
      model: 'lastName',
      conditions: [{
        unless: [{
          firstName: {equals: 'Cher'}
        }]
      }]
    })
    this.lastNameIncluded = true
    return this
  }
  includeAlias () {
    if (this.aliasIncluded) {
      return this
    }
    this._value.cells[0].children.push({
      model: 'alias',
      conditions: [{
        if: [{
          firstName: {equals: 'Bruce'},
          lastName: {equals: 'Wayne'}
        }]
      }]
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
      model: 'lastName',
      conditions: [{
        unless: [{
          firstName: {equals: 'Cher'}
        }]
      }]

    })

    return this
  }

  includeAlias () {
    if (this.aliasIncluded) {
      return this
    }

    this._value.cells[0].children.push({
      model: 'alias',
      conditions: [{
        if: [{
          firstName: {equals: 'Bruce'},
          lastName: {equals: 'Wayne'}
        }]
      }]
    })

    return this
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
    it('', function () {

    })
  })
})
