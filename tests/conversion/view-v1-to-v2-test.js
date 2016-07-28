var expect = require('chai').expect
var conversion = require('../../lib/conversion/view-v1-to-v2')
var _ = require('lodash')

var generateCellDefinitions = conversion.generateCellDefinitions
// var generateCell = conversion.generateCells
var convertCell = conversion.convertCell
var viewV1toV2 = conversion.default

function resultFixture (fixtureName) {
  return require(`../fixtures/${fixtureName}`)
}

function inputFixture (fixtureName) {
  return require(`../fixtures/v1-views/${fixtureName}-v1`)
}

const CELL_DEF_TEST1 = {
  description: 'converts a list of containers to cells',
  inputs: [
    [{
      id: 'test',
      rows: [
        [
          {
            model: 'some-property',
            container: 'someContainer'
          }
        ]
      ]
    }]
  ],
  expectedResult: {
    test: {
      children: [
        {
          model: 'some-property',
          extends: 'someContainer'
        }
      ]
    }
  }
}

const CELL_TEST1 = {
  description: 'converts array containers to cells',
  inputs: [
    {
      model: 'some',
      item: {
        container: 'otherContainer'
      }
    }
  ],
  expectedResult: {
    model: 'some',
    arrayOptions: {
      itemCell: {
        extends: 'otherContainer'
      }
    }
  }
}
const FULL_TESTS = []
function addFullTest (description, fixtureName) {
  FULL_TESTS.push({
    description,
    inputs: [inputFixture(fixtureName)],
    expectedResult: resultFixture(fixtureName)
  })
}

addFullTest('converts a v1 view into a v2 view', 'simple-view')

addFullTest('handles more complex views', 'array-view')

addFullTest('converts renderer info', 'custom-renderers-view')

function runTest (unitUnderTest, testData, testNumber) {
  var expectedResult = testData.expectedResult
  var description = testData.description
  var inputs = testData.inputs

  it(description, function () {
    const actualResult = unitUnderTest.apply(this, inputs)
    if (!_.isEqual(actualResult, expectedResult)) {
      console.log(`TEST ${testNumber + 1} RESULT`, JSON.stringify([actualResult, expectedResult], null, 2))
    }
    expect(actualResult).to.eql(expectedResult)
  })
}

describe('generateCellDefinitions', function () {
  const tests = [
    CELL_DEF_TEST1
  ]
  _.each(tests, _.partial(runTest, generateCellDefinitions))
})

describe('generateCell', function () {
  const tests = [
    CELL_TEST1
  ]
  _.each(tests, _.partial(runTest, convertCell))
})

describe('Bunsen view version 1 to view version 2 conversion', function () {
  _.each(FULL_TESTS, _.partial(runTest, viewV1toV2))
})
