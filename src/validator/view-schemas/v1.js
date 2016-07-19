// The JSON Schema for a view definition (version 2.0)
export default {
  additionalProperties: false,
  definitions: {

    // boolean renderer options
    booleanRenderer: {
      additionalProperties: false,
      properties: {
        // name can only be 'boolean'
        name: {
          enum: ['boolean'],
          type: 'string'
        }

        // no options yet
      },
      type: 'object'
    },

    // button-group renderer options
    buttonGroupRenderer: {
      additionalProperties: false,
      properties: {
        // name can only be 'button-group'
        name: {
          enum: ['button-group'],
          type: 'string'
        }

        // no options yet
      },
      type: 'object'
    },

    // A cell is basically just a "div" it can wrap an array of other cells or it can be a leaf
    // in which case it should define particular "renderer"
    cell: {
      additionalProperties: false,
      properties: {
        // class names to put on DOM elements
        classNames: {
          additionalProperties: false,
          properties: {
            // the class name for the div that is the cell itself
            cell: {
              type: 'string'
            },

            // the class name for the label of the cell
            label: {
              type: 'string'
            },

            // the class name for the value of the cell (generally an input)
            value: {
              type: 'string'
            }
          },
          type: 'object'
        },

        container: {
          type: 'string',
          description: 'The "id" of a container in the "containers" array'
        },
        dependsOn: {
          type: 'string',
          description: 'Dotted notation reference to a property in the model that this property depends on'
        },
        disabled: {
          type: 'boolean',
          description: 'True to disable the input'
        },
        item: {
          additionalProperties: false,
          type: 'object',
          description: 'The configuration for a particular item when the parent is an array',
          properties: {
            autoAdd: {
              type: 'boolean',
              description: 'When true, an empty item will always be added to the end of the array',
              default: false
            },

            // class names to put on DOM elements
            classNames: {
              additionalProperties: false,
              properties: {
                // the class name for the div that is the cell itself
                cell: {
                  type: 'string'
                },

                // the class name for the label of the cell
                label: {
                  type: 'string'
                },

                // the class name for the value of the cell (generally an input)
                value: {
                  type: 'string'
                }
              },
              type: 'object'
            },

            compact: {
              type: 'boolean',
              description: 'When true, render input(s) on same line as remove button',
              default: false
            },
            container: {
              type: 'string',
              description: 'The "id" of a container in the "containers" array'
            },
            inline: {
              type: 'boolean',
              description: 'When true, use inline item rendering instead of tabs'
            },
            label: {
              type: 'string',
              description: 'The user-visible label for this cell'
            },
            placeholder: {
              type: 'string',
              description: 'Text to display when no value is set'
            },
            properties: {
              type: 'object',
              description: 'Properties to pass to custom renderers'
            },

            // Configuration for rendering a portion of the model
            renderer: {
              oneOf: [
                {'$ref': '#/definitions/booleanRenderer'},
                {'$ref': '#/definitions/buttonGroupRenderer'},
                {'$ref': '#/definitions/customRenderer'},
                {'$ref': '#/definitions/numberRenderer'},
                {'$ref': '#/definitions/selectRenderer'},
                {'$ref': '#/definitions/stringRenderer'}
              ]
            },

            showLabel: {
              type: 'boolean',
              description: 'When true, show label for each item',
              default: true
            },
            sortable: {
              type: 'boolean',
              description: 'When true, array items can be sorted',
              default: false
            }
          }
        },
        label: {
          type: 'string',
          description: 'The user-visible label for this cell'
        },
        model: {
          type: 'string',
          description: 'Dotted notation reference to a property in the Model'
        },
        placeholder: {
          type: 'string',
          description: 'Text to display when no value is set'
        },
        properties: {
          type: 'object',
          description: 'Properties to pass to custom renderers'
        },
        readTransforms: {
          '$ref': '#/definitions/transforms',
          type: 'array'
        },

        // Configuration for rendering a portion of the model
        renderer: {
          oneOf: [
            {'$ref': '#/definitions/booleanRenderer'},
            {'$ref': '#/definitions/buttonGroupRenderer'},
            {'$ref': '#/definitions/customRenderer'},
            {'$ref': '#/definitions/numberRenderer'},
            {'$ref': '#/definitions/selectRenderer'},
            {'$ref': '#/definitions/stringRenderer'}
          ]
        },

        writeTransforms: {
          '$ref': '#/definitions/transforms',
          type: 'array'
        }
      },
      type: 'object'
    },

    // custom renderer options
    customRenderer: {
      additionalProperties: false,
      properties: {
        // name can be anything that's not builtin
        name: {
          type: 'string',
          pattern: '^(?!boolean$|button-group$|multi-select$|number$|select$|string$).*'
        },

        // the opaque options passed to a custom renderer
        options: {
          additionalProperties: true,
          type: 'object'
        }
      },
      type: 'object'
    },

    // number renderer options
    numberRenderer: {
      additionalProperties: false,
      properties: {
        // name can only be 'number'
        name: {
          enum: ['number'],
          type: 'string'
        }

        // no options yet
      },
      type: 'object'
    },

    objectTransform: {
      additionalProperties: false,
      properties: {
        object: {
          additionalProperties: {type: 'string'},
          type: 'object'
        }
      },
      type: 'object'
    },

    // select renderer options
    selectRenderer: {
      additionalProperties: false,
      properties: {

        // the only valid names for a select are 'select' and 'multi-select'
        name: {
          enum: ['select', 'multi-select'],
          type: 'string'
        },

        // the options specific to a select renderer
        options: {
          additionalProperties: false,
          properties: {
            // the attribute of the listed items to use as a label
            labelAttribute: {
              type: 'string'
            },

            // description: the type of Ember model to fetch for list-based inputs
            modelType: {
              type: 'string'
            },

            // description: a hash of key/value pairs to use as query string to fetch values for list-based inputs
            query: {
              additionalProperties: {
                type: 'string'
              },
              type: 'object'
            },

            // the attribute of the listed items to use as a value
            valueAttribute: {
              type: 'string'
            }
          },
          type: 'object'
        }
      },
      type: 'object'
    },

    // string renderer options
    stringRenderer: {
      additionalProperties: false,
      properties: {
        // name can only be 'string'
        name: {
          enum: ['string'],
          type: 'string'
        }

        // no options yet
      },
      type: 'object'
    },

    stringTransform: {
      additionalProperties: false,
      properties: {
        from: {type: 'string'},
        global: {type: 'boolean'},
        regex: {type: 'boolean'},
        to: {type: 'string'}
      },
      required: ['from', 'to'],
      type: 'object'
    },
    transforms: {
      items: {
        oneOf: [
          {
            '$ref': '#/definitions/objectTransform',
            type: 'object'
          },
          {
            '$ref': '#/definitions/stringTransform',
            type: 'object'
          }
        ]
      },
      type: 'array'
    }
  },
  type: 'object',
  description: 'The JSON Schema for a view definition',
  properties: {
    buttonLabels: {
      type: 'object',
      properties: {
        cancel: {
          type: 'string',
          description: 'The user-visible label for the cancel button',
          default: 'Cancel'
        },
        submit: {
          type: 'string',
          description: 'The user-visible label for the submit button',
          default: 'Submit'
        }
      }
    },
    containers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          className: {
            type: 'string',
            description: 'A CSS className for the container div itself'
          },
          defaultClassName: {
            type: 'string',
            description: 'A default "className" to use on all cells that do not specify one'
          },
          id: {
            type: 'string',
            description: 'A unique identifier for this container (used as a reference to it)'
          },
          children: {
            type: 'array',
            items: {
              type: 'array',
              description: 'A representation of a row in a grid layout, defined as an array of cells',
              items: {
                '$ref': '#/definitions/cell'
              }
            },
            minItems: 1
          }
        },
        required: [
          'id',
          'children'
        ]
      },
      minItems: 1
    },
    cells: {
      type: 'array',
      description: 'Top-level entry-point containers (i.e. tabs) currently only one is allowed',
      items: {
        type: 'object',
        properties: {
          container: {
            type: 'string',
            description: 'The "id" of a container in the "containers" array'
          },
          label: {
            type: 'string',
            description: 'User-visible label for the entry-point (i.e. tab)'
          }
        },
        required: [
          'container',
          'label'
        ]
      },
      minItems: 1
    },
    type: {
      type: 'string',
      description: 'What kind of view is this? A form that requests information, or detail that displays it?',
      enum: [
        'form',
        'detail'
      ]
    },
    version: {
      type: 'string',
      description: 'This schema is just for v1',
      enum: [
        '2.0'
      ]
    }
  },
  required: [
    'cells',
    'containers',
    'type',
    'version'
  ]
}
