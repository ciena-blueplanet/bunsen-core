export default {
  definitions: {
    array: {
      properties: {
        items: {
          oneOf: [
            {'$ref': '#/definitions/array'},
            {'$ref': '#/definitions/boolean'},
            {'$ref': '#/definitions/integer'},
            {'$ref': '#/definitions/number'},
            {'$ref': '#/definitions/object'},
            {'$ref': '#/definitions/string'}
          ]
        },
        maxItems: {
          minimum: 0,
          type: 'integer'
        },
        minItems: {
          minimum: 0,
          type: 'integer'
        },
        type: {
          enum: ['array'],
          type: 'string'
        },
        uniqueItems: {
          type: 'boolean'
        }
      },
      required: ['items', 'type'],
      type: 'object'
    },
    boolean: {
      properties: {
        type: {
          enum: ['boolean'],
          type: 'string'
        }
      },
      required: ['type'],
      type: 'object'
    },
    integer: {
      properties: {
        exclusiveMaximum: {
          type: 'boolean'
        },
        exclusiveMinimum: {
          type: 'boolean'
        },
        maximum: {
          multipleOf: 1,
          type: 'integer'
        },
        minimum: {
          multipleOf: 1,
          type: 'integer'
        },
        multipleOf: {
          exclusiveMinimum: true,
          minimum: 0,
          type: 'integer'
        },
        type: {
          enum: ['integer'],
          type: 'string'
        }
      },
      required: ['type'],
      type: 'object'
    },
    number: {
      properties: {
        exclusiveMaximum: {
          type: 'boolean'
        },
        exclusiveMinimum: {
          type: 'boolean'
        },
        maximum: {
          type: 'number'
        },
        minimum: {
          type: 'number'
        },
        multipleOf: {
          exclusiveMinimum: true,
          minimum: 0,
          type: 'number'
        },
        type: {
          enum: ['number'],
          type: 'string'
        }
      },
      required: ['type'],
      type: 'object'
    },
    object: {
      properties: {
        properties: {
          additionalProperties: {
            oneOf: [
              {'$ref': '#/definitions/array'},
              {'$ref': '#/definitions/boolean'},
              {'$ref': '#/definitions/integer'},
              {'$ref': '#/definitions/number'},
              {'$ref': '#/definitions/object'},
              {'$ref': '#/definitions/string'}
            ]
          },
          type: 'object'
        },
        type: {
          enum: ['object'],
          type: 'string'
        }
      },
      required: ['type'],
      type: 'object'
    },
    string: {
      properties: {
        format: {
          type: 'string'
        },
        maxLength: {
          minimum: 0,
          type: 'integer'
        },
        minLength: {
          minimum: 0,
          type: 'integer'
        },
        pattern: {
          type: 'string'
        },
        type: {
          enum: ['string'],
          type: 'string'
        }
      },
      required: ['type'],
      type: 'object'
    }
  },
  properties: {
    properties: {
      additionalProperties: {
        oneOf: [
          {'$ref': '#/definitions/array'},
          {'$ref': '#/definitions/boolean'},
          {'$ref': '#/definitions/integer'},
          {'$ref': '#/definitions/number'},
          {'$ref': '#/definitions/object'},
          {'$ref': '#/definitions/string'}
        ]
      },
      type: 'object'
    }
  },
  type: 'object'
}
