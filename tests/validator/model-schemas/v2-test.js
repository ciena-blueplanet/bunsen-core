const expect = require('chai').expect
const ZSchema = require('z-schema')

const modelSchema = require('../../../lib/validator/model-schemas/v2')

describe('v2 model schema', () => {
  let validator

  beforeEach(function () {
    validator = new ZSchema({
      breakOnFirstError: false
    })
  })

  describe('model with array property', () => {
    it('is invalid without items', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with array of arrays', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                items: {
                  type: 'string'
                },
                type: 'array'
              },
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with array of booleans', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'boolean'
              },
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with array of integers', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'integer'
              },
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with array of numbers', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'number'
              },
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with array of objects', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'object'
              },
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with array of strings', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'string'
              },
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with maxItems set to positive integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'string'
              },
              maxItems: 1,
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with maxItems set to zero', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'string'
              },
              maxItems: 0,
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with maxItems set to float', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'string'
              },
              maxItems: 1.5,
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is invalid with maxItems set to negative integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'string'
              },
              maxItems: -1,
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with minItems set to positive integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'string'
              },
              minItems: 1,
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with minItems set to zero', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'string'
              },
              minItems: 0,
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with minItems set to float', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'string'
              },
              minItems: 1.5,
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is invalid with minItems set to negative integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'string'
              },
              minItems: -1,
              type: 'array'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with uniqueItems set to true', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'string'
              },
              type: 'array',
              uniqueItems: true
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with uniqueItems set to false', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'string'
              },
              type: 'array',
              uniqueItems: false
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with uniqueItems set to non-boolean', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              items: {
                type: 'string'
              },
              type: 'array',
              uniqueItems: 'test'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })
  })

  it('validates model with boolean property', () => {
    expect(
      validator.validate({
        properties: {
          foo: {
            type: 'boolean'
          }
        },
        type: 'object'
      }, modelSchema)
    )
      .to.equal(true)
  })

  describe('model with integer property', () => {
    it('is valid', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with exclusiveMaximum set to true', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              exclusiveMaximum: true,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with exclusiveMaximum set to false', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              exclusiveMaximum: false,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with non-boolean exclusiveMaximum', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              exclusiveMaximum: 'test',
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with exclusiveMinimum set to true', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              exclusiveMinimum: true,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with exclusiveMinimum set to false', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              exclusiveMinimum: false,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with non-boolean exclusiveMinimum', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              exclusiveMinimum: 'test',
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with maximum set to positive integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              maximum: 1,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with maximum set to negative integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              maximum: -1,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with maximum set to float', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              maximum: 1.5,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with minimum set to positive integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              minimum: 1,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with minimum set to negative integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              minimum: -1,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with minimum set to float', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              minimum: 1.5,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with multipleOf positive integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              multipleOf: 1,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with multipleOf zero', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              multipleOf: 0,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is invalid with multipleOf negative integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              multipleOf: -1,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is invalid with multipleOf positive float', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              multipleOf: 1.5,
              type: 'integer'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })
  })

  describe('model with number property', () => {
    it('is valid', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with exclusiveMaximum set to true', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              exclusiveMaximum: true,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with exclusiveMaximum set to false', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              exclusiveMaximum: false,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with non-boolean exclusiveMaximum', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              exclusiveMaximum: 'test',
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with exclusiveMinimum set to true', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              exclusiveMinimum: true,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with exclusiveMinimum set to false', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              exclusiveMinimum: false,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with non-boolean exclusiveMinimum', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              exclusiveMinimum: 'test',
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with maximum set to positive integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              maximum: 1,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with maximum set to negative integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              maximum: -1,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with maximum set to positive float', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              maximum: 1.5,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with maximum set to negative float', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              maximum: -1.5,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with maximum set to non-numeric', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              maximum: 'test',
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with minimum set to positive integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              minimum: 1,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with minimum set to negative integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              minimum: -1,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with minimum set to positive float', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              minimum: 1.5,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with minimum set to negative float', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              minimum: -1.5,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with minimum set to non-numeric', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              minimum: 'test',
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with multipleOf positive integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              multipleOf: 1,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with multipleOf zero', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              multipleOf: 0,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is invalid with multipleOf negative integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              multipleOf: -1,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with multipleOf positive float', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              multipleOf: 1.5,
              type: 'number'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })
  })

  describe('model with string property', () => {
    it('is valid', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with format set to string', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              format: 'date',
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with format set to non-string', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              format: 1,
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with maxLength set to positive integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              maxLength: 1,
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with maxLength set to zero', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              maxLength: 0,
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with maxLength set to negative integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              maxLength: -1,
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is invalid with maxLength set to float', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              maxLength: 1.5,
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with minLength set to positive integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              minLength: 1,
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is valid with minLength set to zero', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              minLength: 0,
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with minLength set to negative integer', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              minLength: -1,
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is invalid with minLength set to float', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              minLength: 1.5,
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })

    it('is valid with pattern set to string', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              pattern: '^\\d+.\\d+$',
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(true)
    })

    it('is invalid with pattern set to non-string', () => {
      expect(
        validator.validate({
          properties: {
            foo: {
              pattern: 1,
              type: 'string'
            }
          },
          type: 'object'
        }, modelSchema)
      )
        .to.equal(false)
    })
  })
})
