var expect = require('chai').expect
var normalizeView = require('../../lib/conversion/normalize-view').default

describe('normalizeView()', function () {
  it(' normalizes view as expected', function () {
    const input = {
      cellDefinitions: {
        test: {
          children: [
            {model: 'foo[0]'},
            {model: 'foo[0].bar'},
            {model: 'alpha[0][1]'},
            {model: 'alpha[0][1].bravo'}
          ]
        },
        model: {
          children: [
            {model: 'foo[0]'},
            {model: 'foo[0].bar'},
            {model: 'alpha[0][1]'},
            {model: 'alpha[0][1].bravo'}
          ]
        }
      },
      cells: [
        {model: 'foo[0]'},
        {model: 'foo[0].bar'},
        {model: 'alpha[0][1]'},
        {model: 'alpha[0][1].bravo'},
        {
          children: [
            {model: 'foo[0]'},
            {model: 'foo[0].bar'},
            {model: 'alpha[0][1]'},
            {model: 'alpha[0][1].bravo'}
          ]
        },
        {extends: 'test'},
        {extends: 'model'}
      ],
      type: 'form',
      version: '2.0'
    }

    expect(normalizeView(input)).to.eql({
      cellDefinitions: {
        test: {
          children: [
            {model: 'foo.0'},
            {model: 'foo.0.bar'},
            {model: 'alpha.0.1'},
            {model: 'alpha.0.1.bravo'}
          ]
        },
        model: {
          children: [
            {model: 'foo.0'},
            {model: 'foo.0.bar'},
            {model: 'alpha.0.1'},
            {model: 'alpha.0.1.bravo'}
          ]
        }
      },
      cells: [
        {model: 'foo.0'},
        {model: 'foo.0.bar'},
        {model: 'alpha.0.1'},
        {model: 'alpha.0.1.bravo'},
        {
          children: [
            {model: 'foo.0'},
            {model: 'foo.0.bar'},
            {model: 'alpha.0.1'},
            {model: 'alpha.0.1.bravo'}
          ]
        },
        {extends: 'test'},
        {extends: 'model'}
      ],
      type: 'form',
      version: '2.0'
    })
  })
})
