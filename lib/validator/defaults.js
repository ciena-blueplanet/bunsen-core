'use strict'

require('../typedefs')
const _ = require('lodash')
const viewSchema = require('./view-schemas/v1')

const lib = {
  /**
   * Get the default button labels from the schema
   * @returns {Object} key-value pairs of the button and it's default label
   */
  getButtonLabelDefaults () {
    const labels = {}
    _.forIn(viewSchema.properties.buttonLabels.properties, (value, key) => {
      labels[key] = value['default']
    })
    return labels
  },

  /**
   * Get the default values for properties on a Cell
   * @returns {Object} - the defaults for a Cell
   */
  getCellDefaults () {
    const cellSchema = viewSchema.definitions.cell

    const cellDefaults = {}

    _.forIn(cellSchema.properties, (value, key) => {
      const defaultValue = value['default']
      if (defaultValue !== undefined) {
        cellDefaults[key] = defaultValue
      }
    })

    return cellDefaults
  }
}

module.exports = lib
