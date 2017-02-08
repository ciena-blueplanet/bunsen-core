'use strict'
const cellDefinitions = {
  main: {
    children: [{
      extends: 'name'
    }, {
      model: 'isSuperHero'
    }]
  },
  name: {
    label: 'Name',
    model: 'name',
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
  lastName: {
    model: 'lastName'
  },
  alias: {
    model: 'alias',
    conditions: [{
      if: [{
        '../isSuperHero': {equals: true}
      }],
      unless: [{
        './firstName': {equals: 'Luke'},
        './lastName': {equals: 'Cage'}
      }]
    }, {
      if: [{
        './firstName': {equals: 'Peter'},
        './lastName': {equals: 'Parker'}
      }],
      then: {
        label: 'Alter Ego'
      }
    }]
  }
}

const version = '2.0'
const type = 'form'
const view = {
  version,
  type,
  cells: [
    {
      label: 'Main',
      extends: 'main'
    }
  ],
  cellDefinitions
}

var ExpectedValue = require('../expected-value')
var baseValue = {
  version,
  type,
  cells: [{
    label: 'Main',
    children: [{
      label: 'Name',
      model: 'name',
      children: [
        {
          model: 'firstName'
        },
        {
          model: 'lastName'
        }
      ]
    }, {
      model: 'isSuperHero'
    }]
  }],
  cellDefinitions
}

class ExpectedComplexConditional extends ExpectedValue {
  constructor () {
    super(baseValue)
    this.aliasIncluded = false
  }

  includeAlias () {
    if (this.aliasIncluded) {
      return this
    }

    this._value.cells[0].children[0].children.push({
      model: 'alias'
    })

    return this
  }

  includeAlterEgo () {
    if (this.aliasIncluded) {
      return this
    }

    this._value.cells[0].children[0].children.push({
      label: 'Alter Ego',
      model: 'alias'
    })

    return this
  }
}

Object.assign(module.exports, {
  view,
  ExpectedComplexConditional
})
