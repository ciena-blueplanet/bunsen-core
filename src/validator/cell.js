'use strict'

import '../typedefs'
import _ from 'lodash'

import {getSubModel} from '../utils'
import viewSchema from './view-schemas/v2'

import {
  addErrorResult,
  addWarningResult,
  aggregateResults
} from './utils'

function createFactory (proto) {
  const factory = function () {
    const obj = Object.create(proto)
    return obj.init.apply(obj, arguments)
  }

  factory.proto = proto

  return factory
}

/**
 * Check if a cell includes a custom renderer
 * @param {BunsenCell} cell - the cell to check
 * @returns {Boolean} true if the cell specifies a custom renderer
 */
function isCustomCell (cell) {
  return cell.renderer !== undefined
}

/**
 * Check if the given model is an array of objects
 * @param {BunsenModel} model - the model to check
 * @returns {Boolean} true if model is and array of objects
 */
function isObjectArray (model) {
  return (model.type === 'array') && (model.items.type === 'object')
}

/**
 * @alias validator
 */
export default createFactory({
  /**
   * Initialize the validator
   * @param {BunsenCell[]} cellDefinitions - the cells to validate cell references against
   * @param {BunsenModel} model - the Model to validate model references against
   * @param {String[]} [renderers] - the list of available custom renderers to validate renderer references against
   * @param {Function} validateRenderer - function to validate a renderer
   * @param {Function} validateModelType - function to validate model type
   * @returns {validator} the instance
   */
  init (cellDefinitions, model, renderers, validateRenderer, validateModelType) {
    renderers = renderers || []
    return _.assign(this, {
      cellDefinitions,
      cellsValidated: [],
      model,
      renderers,
      validateModelType,
      validateRenderer
    })
  },

  /**
   * Validate the sub-cell, giving it it's appropriate sub-model
   * @param {String} path - the path the given row
   * @param {String} cellId - the id of the sub-cell
   * @param {BunsenModel} model - the model to use to verify references against
   * @returns {BunsenValidationResult} the results of the sub-cell validation
   */
  _validateSubCell (path, cellId, model) {
    const results = []
    const cell = this.cellDefinitions[cellId]
    if (cell === undefined) {
      addErrorResult(results, path, `Invalid extends reference "${cellId}"`)
    } else {
      results.push(
        this.validate(`#/cellDefinitions/${cellId}`, cell, model)
      )
    }

    return aggregateResults(results)
  },

  /**
   * Validate the given cell, with a custom renderer
   * @param {String} path - the path the given row
   * @param {BunsenCell} cell - the cell to validate
   * @returns {BunsenValidationResult} the results of the cell validation
   */
  _validateCustomCell (path, cell) {
    const results = [
      {
        errors: []
      }
    ]

    const modelType = _.get(cell, 'renderer.options.modelType')
    const rendererName = _.get(cell, 'renderer.name')
    const rendererPathExt = 'renderer'
    const rendererPath = `${path}/${rendererPathExt}`

    // If rendererName is not in renderers mapping and is not a registered component
    if (
      !_.includes(this.renderers, rendererName) &&
      !this.validateRenderer(rendererName)
    ) {
      addErrorResult(results, rendererPath, `Invalid renderer reference "${rendererName}"`)
    }

    if (rendererName === 'select' && modelType && !this.validateModelType(modelType)) {
      addErrorResult(results, `${rendererPath}/options`, `Invalid modelType reference "${modelType}"`)
    }

    return aggregateResults(results)
  },

  /**
   * Validate the given cell, with a sub-model
   * @param {String} path - the path the given row
   * @param {BunsenCell} cell - the cell to validate
   * @param {BunsenModel} [model] - the Model to validate model references against
   * @returns {BunsenValidationResult} the results of the cell validation
   */
  _validateArrayCell (path, cell, model) {
    const results = []
    if (cell.extends) {
      const msg = 'Cells on arrays not currently supported. Maybe you want it on the item sub-object?'
      addErrorResult(results, path, msg)
    } else if (_.get(cell, 'arrayOptions.itemCell.extends')) {
      results.push(
        this._validateSubCell(`${path}/arrayOptions/itemCell/extends`, cell.arrayOptions.itemCell.extends, model.items)
      )
    }

    return aggregateResults(results)
  },

  /**
   * Validate the given cell, with a sub-model
   * @param {String} path - the path the given row
   * @param {BunsenCell} cell - the cell to validate
   * @param {BunsenModel} subModel - the subModel
   * @returns {BunsenValidationResult} the results of the cell validation
   */
  _validateModelCell (path, cell, subModel) {
    const results = []
    if (subModel === undefined) {
      addErrorResult(results, `${path}/model`, `Invalid model reference "${cell.model}"`)
    } else if (isCustomCell(cell)) {
      results.push(
        this._validateCustomCell(path, cell)
      )
    } else if (isObjectArray(subModel)) {
      results.push(
        this._validateArrayCell(path, cell, subModel)
      )
    } else if (subModel.type === 'object' && cell.extends) {
      results.push(
        this._validateSubCell(`${path}/extends`, cell.extends, subModel)
      )
    }

    return aggregateResults(results)
  },

  /**
   * Validate the given cell, with a sub-model dependent on another sub model
   * @param {String} path - the path the given row
   * @param {BunsenCell} cell - the cell to validate
   * @param {BunsenModel} [model] - the Model to validate model references against
   * @returns {BunsenValidationResult} the results of the cell validation
   */
  _validateDependentModelCell (path, cell, model) {
    const results = []
    const dependencyModel = getSubModel(model, cell.dependsOn)

    if (dependencyModel === undefined) {
      addErrorResult(results, `${path}/dependsOn`, `Invalid model reference "${cell.dependsOn}"`)
      return aggregateResults(results)
    }

    const parts = cell.model.split('.')
    const last = parts.pop()
    const modelArg = (/^\d+$/.test(last)) ? parts.join('.') : cell.model
    const subModel = getSubModel(model, modelArg, cell.dependsOn)
    results.push(
      this._validateModelCell(path, cell, subModel)
    )

    return aggregateResults(results)
  },

  /* eslint-disable complexity */
  /**
   * Validate the given cell
   * @param {String} path - the path the given row
   * @param {BunsenCell} cell - the cell to validate
   * @param {BunsenModel} [model] - the Model to validate model references against
   * @returns {BunsenValidationResult} the results of the cell validation
   */
  _validateCell (path, cell, model) {
    const results = []
    let subModel = model

    if (cell.dependsOn) {
      results.push(
        this._validateDependentModelCell(path, cell, model)
      )
    } else if (cell.model) {
      const parts = cell.model.split('.')
      const last = parts.pop()
      const modelArg = (/^\d+$/.test(last)) ? parts.join('.') : cell.model
      subModel = getSubModel(model, modelArg)
      results.push(
        this._validateModelCell(path, cell, subModel)
      )
    } else if (cell.extends) {
      results.push(
        this._validateSubCell(`${path}/extends`, cell.extends, model)
      )
    } else if (!cell.children) {
      addErrorResult(results, path, '"children", "extends", or "model" must be defined for each cell.')
    }

    const knownAttributes = Object.keys(viewSchema.definitions.cell.properties)

    Object.keys(cell).forEach((attr) => {
      if (!_.includes(knownAttributes, attr)) {
        addWarningResult(results, path, `Unrecognized attribute "${attr}"`)
      }
    })

    if (cell.children) {
      cell.children.forEach((child, index) => {
        results.push(
          this._validateCell(`${path}/children/${index}`, child, subModel)
        )
      })
    }

    return aggregateResults(results)
  },
  /* eslint-enable complexity */

  /**
   * Validate the given config
   * @param {String} path - the path to the cell from the root of the config
   * @param {BunsenCell} cell - the cell to validate
   * @param {BunsenModel} [model] - the Model to validate model references against
   * @returns {BunsenValidationResult} the results of the cell validation
   */
  validate (path, cell, model) {
    // keep track of which paths we've validated
    this.cellsValidated.push(path)

    if (model === undefined) {
      model = this.model
    }

    const results = []

    results.push(
      this._validateCell(path, cell, model)
    )

    return aggregateResults(results)
  }
})
