'use strict'
const expect = require('chai').expect
const evaluateValue = require('../lib/value-utils')

const baseView = {
  cells: [
    {
      children: [
        {
          model: 'foo',
          renderer: {
            name: 'radio',
            options: {
              inputs: [
                {
                  label: 'Yes',
                  value: 'true'
                },
                {
                  label: 'No',
                  value: 'false'
                }
              ]
            }
          }
        },
        {
          model: 'test',
          renderer: {
            name: 'radio',
            options: {
              inputs: [
                {
                  label: 'test',
                  value: 'test'
                },
                {
                  label: 'No test',
                  value: 'no test'
                }
              ]
            }
          }
        },
        {
          model: 'bar',
          conditions: [
            {
              if: [
                {
                  './foo': {
                    equals: 'true'
                  }
                }
              ]
            }
          ]
        },
        {
          model: 'baz',
          conditions: [
            {
              if: [
                {
                  './foo': {
                    equals: 'false'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  type: 'form',
  version: '2.0'
}

const newView = {
  cells: [
    {
      children: [
        {
          model: 'foo',
          renderer: {
            name: 'radio',
            options: {
              inputs: [
                {
                  label: 'Yes',
                  value: 'true'
                },
                {
                  label: 'No',
                  value: 'false'
                }
              ]
            }
          }
        },
        {
          model: 'test',
          renderer: {
            name: 'radio',
            options: {
              inputs: [
                {
                  label: 'test',
                  value: 'test'
                },
                {
                  label: 'No test',
                  value: 'no test'
                }
              ]
            }
          }
        },
        {
          model: 'bar'
        }
      ]
    }
  ],
  type: 'form',
  version: '2.0'
}
const value = {
  foo: 'true',
  test: 'test',
  bar: 'bar',
  baz: 'baz'
}

describe('value with conditionals', function () {
  const result = evaluateValue(baseView, newView, value)

  expect(result).to.be.eql({
    foo: 'true',
    test: 'test',
    bar: 'bar'
  })
})
