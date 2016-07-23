var expect = require('chai').expect
var conversion = require('../../lib/conversion/view-v1-to-v2')
var _ = require('lodash')

var generateCellDefinitions = conversion.generateCellDefinitions

describe('Bunsen view version 1 to view version 2 conversion', function () {
  it('', function () {
    expect(true).to.be.true
  })
})

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
const CELL_DEF_TEST2 = {
  description: 'converts array array containers',
  inputs: [
    [{
      id: 'array',
      rows: [[
        {
          model: 'some',
          item: {
            container: 'otherContainer'
          }
        }
      ]]
    }]
  ],
  expectedResult: {
    array: {
      model: 'some',
      arrayOptions: {
        itemCell: {
          extends: 'otherContainer'
        }
      }
    }
  }
}


function runTest (unitUnderTest, {expectedResult, description, input}, testNumber) {
  it(description, function () {
    const actualResult = unitUnderTest.apply(this, input)
    if (!_.isEqual(actualResult, expectedResult)) {
      console.log(`TEST ${testNumber + 1} RESULT`, JSON.stringify([actualResult, expectedResult], null, 2))
    }
    expect(actualResult).to.eql(expectedResult)
  })
}

describe('generateCellDefinitions', function () {
  const tests = [
    CELL_DEF_TEST1,
    CELL_DEF_TEST2,
    CELL_DEF_TEST3
  ]
  _.each(tests, _.partial(runTest, generateCellDefinitions))
})
