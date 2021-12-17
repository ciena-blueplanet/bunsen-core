import _ from 'lodash'
import {BunsenModelPath} from './utils'
/**
 * Convert a model reference to a proper path in the model schema
 *
 * hero.firstName => hero.properties.firstName
 * foo.bar.baz => foo.properties.bar.properties.baz
 *
 * Leading or trailing '.' mess up our trivial split().join() and aren't valid anyway, so we
 * handle them specially, undefined being passed into _.get() will yield undefined, and display
 * the error we want to display when the model reference is invalid, so we return undefined
 *
 * hero. => undefined
 * .hero => undefined
 *
 * @param {String} reference - the dotted reference to the model
 * @returns {String} the proper dotted path in the model schema (or undefined if it's a bad path)
 */
export function getModelPath (reference) {
  const pattern = /^[^.](.*[^.])?$/
  let path = pattern.test(reference) ? `properties.${reference.split('.').join('.properties.')}` : undefined

  if (typeof path === 'string' || path instanceof String) {
    path = path.replace(/\.properties\.(\d+)\./g, '.items.') // Replace array index with "items"
  }

  return path
}

/**
 * Create a path to add within a model
 *
 * @param {String} modelPath Path to current place within the model
 * @param {String} id Id specified in the cell
 * @param {Boolean} internal True if we want to add an internal model
 * @returns {String} Path to add within the model
 */
function appendModelPath (modelPath, id, internal) {
  const addedModelPath = getModelPath(id)
  if (internal) {
    if (modelPath === '') {
      return `properties._internal.${addedModelPath}`
    }
    return `${modelPath}.properties._internal.${addedModelPath}`
  }
  if (modelPath === '') {
    return addedModelPath
  }
  return `${modelPath}.${addedModelPath}`
}

/**
 * Copies a cell. If the cell extends cell definions, properties from teh extended cell
 * are copied into the new cell.
 *
 * @param {BunsenCell} cell Cell to build up with cell definitions
 * @param {Object} cellDefinitions Cell definitions available in the view
 * @returns {BunsenCell} The expanded cell
 */
function extendCell (cell, cellDefinitions) {
  cell = _.clone(cell)
  while (cell.extends) {
    const extendedCell = cellDefinitions[cell.extends]
    if (!_.isObject(extendedCell)) {
      throw new Error(`'${cell.extends}' is not a valid model definition`)
    }
    delete cell.extends
    cell = _.defaults(cell, extendedCell)
  }
  return cell
}

/**
 * Add property model into full model
 * @param {BunsenModel} bunsenModel - full model
 * @param {BunsenModel} propertyModel - property model
 * @param {String} modelPath - path to property in full model
 * @returns {BunsenModel} full model with property model inserted
 */
export function addBunsenModelProperty (bunsenModel, propertyModel, modelPath) {
  const model = Object.assign({}, bunsenModel)
  const segments = modelPath.split('.')

  let pointer = model

  while (segments.length) {
    const key = segments.shift()

    if (key in pointer) {
      pointer[key] = Object.assign({}, pointer[key])
    } else if (segments.length !== 0) {
      pointer[key] = {
        properties: {},
        type: 'object'
      }
    }
    if (segments.length === 0) {
      pointer[key] = propertyModel
    }

    pointer = pointer[key]
  }

  return model
}

/**
 * Normalizes cells within arrayOptions
 *
 * @param {BunsenCell} cell Cell with arrayOptions to normalize
 * @param {Object} cellDefinitions Hash of cell definitions
 * @returns {Object} The normalized arrayOptions
 */
function normalizeArrayOptions (cell, cellDefinitions) {
  const arrayOptions = _.clone(cell.arrayOptions)
  if (arrayOptions.itemCell) {
    if (Array.isArray(arrayOptions.itemCell)) {
      arrayOptions.itemCell = arrayOptions.itemCell.map(cell => normalizeCell(cell, cellDefinitions))
    } else {
      arrayOptions.itemCell = normalizeCell(arrayOptions.itemCell, cellDefinitions)
    }
  }
  if (arrayOptions.tupleCells) {
    arrayOptions.tupleCells = arrayOptions.tupleCells.map(cell => normalizeCell(cell, cellDefinitions))
  }
  return arrayOptions
}

/**
 * Normalize view cell
 * @param {BunsenCell} cell - cell to normalize
 * @param {Object} cellDefinitions - parent nodes
 * @returns {BunsenCell} - normalized state (contains model, view, and parents)
 */
export function normalizeCell (cell, cellDefinitions) {
  const newCell = extendCell(cell, cellDefinitions)
  if (typeof newCell.model === 'object') {
    const isInternal = newCell.internal === true
    const model = isInternal ? `_internal.${newCell.id}` : newCell.id
    newCell.model = model
  }

  const children = normalizeChildren(newCell, cellDefinitions)
  if (children) {
    newCell.children = children
  }
  if (newCell.arrayOptions) {
    newCell.arrayOptions = normalizeArrayOptions(newCell, cellDefinitions)
  }

  return newCell
}

/**
 * Normalize top level cells
 * @param {BunsenView} view – unnormalized view
 * @returns {Object} - normalized view
 */
export function normalizeCells (view) {
  if (!view || !Array.isArray(view.cells)) return view
  const newCells = view.cells.map((cell) => {
    const cellDefinitions = view.cellDefinitions || {}
    return normalizeCell(cell, cellDefinitions)
  })

  const newView = _.clone(view)
  newView.cells = newCells

  return newView
}

/**
 * Normalize view cell's children
 * @param {BunsenCell} cell - cell that contains children to normalize
 * @param {Object} cellDefinitions - hash of cell definitions
 * @returns {BunsenCell[]} - normalized state (contains model, view, and parents)
 */
export function normalizeChildren (cell, cellDefinitions) {
  if (!Array.isArray(cell.children)) return

  return cell.children.map((cell) => normalizeCell(cell, cellDefinitions))
}

/**
 * Collects schemas from a cell's array options to add to the model in a hash.
 *
 * @param {BunsenCell} cell BunsenCell with array options
 * @param {BunsenModelPath} modelPath Current path within the model
 * @param {Object} models Hash containing schemas to add
 * @param {Object} cellDefinitions Hash containing cell definitions
 */
function pluckFromArrayOptions (cell, modelPath, models, cellDefinitions) {
  if (cell.arrayOptions.tupleCells) {
    cell.arrayOptions.tupleCells.forEach(function (cell, index) {
      pluckModels(cell, modelPath.concat(index), models, cellDefinitions)
    })
  }
  if (cell.arrayOptions.itemCell) {
    const itemCell = cell.arrayOptions.itemCell
    if (Array.isArray(itemCell)) {
      itemCell.forEach(function (cell, index) {
        pluckModels(cell, modelPath.concat(index), models, cellDefinitions)
      })
    } else {
      pluckModels(itemCell, modelPath.concat('0'), models, cellDefinitions)
    }
  }
}

/**
 * Verify if any of the children need to be added to the model
 * @param {BunsenCell} cell BunsenCell with array options
 * @param {BunsenModelPath} modelPath Current path within the model
 * @param {Object} models Hash containing schemas to add
 * @param {Object} cellDefinitions Hash containing cell definitions
 * @param {boolean} includeParentPath Will the path be prepended with the parent
 */
function pluckChildren (cell, modelPath, models, cellDefinitions, includeParentPath) {
  cell.children.forEach((aCell) => {
    const path = includeParentPath ? `${cell.id}.${aCell.model}` : aCell.model
    const newPath = typeof aCell.model === 'string' ? modelPath.concat(path) : modelPath
    pluckModels(aCell, newPath, models, cellDefinitions)
  })
}

/**
 * Collects schemas from a cell to add to the model in a hash. Keys in the hash are
 * the schema's path within the bunsen model.
 *
 * @param {BunsenCell} cell BunsenCell with array options
 * @param {BunsenModelPath} modelPath Current path within the model
 * @param {Object} models Hash containing schemas to add
 * @param {Object} cellDefinitions Hash containing cell definitions
 */
export function pluckModels (cell, modelPath, models, cellDefinitions) {
  cell = extendCell(cell, cellDefinitions)
  if (_.isObject(cell.model)) {
    const addedPath = appendModelPath(modelPath.modelPath(), cell.id, cell.internal)
    models[addedPath] = cell.model
    if (cell.children) {
      pluckChildren(cell, modelPath, models, cellDefinitions, true)
    }
  } else if (cell.children) { // recurse on objects
    pluckChildren(cell, modelPath, models, cellDefinitions, false)
  } else if (cell.arrayOptions) { // recurse on arrays
    pluckFromArrayOptions(cell, modelPath, models, cellDefinitions)
  }
}

/**
 * Collects schemas from a cell to add to the model in a hash.
 *
 * @param {BunsenView} view View to check for additional schemas
 * @param {BunsenModelPath} modelPath Path to start within the model
 * @returns {Object} Hash of schemas. The keys are paths within the model
 */
function aggregateModels (view, modelPath) {
  const models = {}
  view.cells.forEach(function (cell) {
    const newPath = typeof cell.model === 'string' ? modelPath.concat(cell.model) : modelPath
    pluckModels(cell, newPath, models, view.cellDefinitions)
  })
  return models
}

/**
 * Adds to an existing bunsen model with schemas defined in the view
 *
 * @param {BunsenModel} model Model to expand
 * @param {BunsenView} view View containing additional schema
 * @returns {BunsenModel} Expanded version of the model
 */
function expandModel (model, view) {
  const modelPath = new BunsenModelPath(model)
  const modelExpansions = aggregateModels(view, modelPath)
  let newModel = model
  _.forEach(modelExpansions, (propertyModel, path) => {
    newModel = addBunsenModelProperty(newModel, propertyModel, path)
  })
  return newModel
}

/**
 * Normalize bunsen model and view from model partials defined in view
 * @param {BunsenModel} model - bunsen model
 * @param {BunsenView} view - bunsen view
 * @returns {Object} - normalized state (contains model and view)
 */
export default function ({model, view}) {
  try {
    const expandedModel = expandModel(model, view)
    const normalizedView = normalizeCells(view)
    return {model: expandedModel, view: normalizedView}
  } catch (e) {
    // Unfortunately this is necessary because view validation happens outside of the reducer,
    // so we have no guarantee that the view is valid and it may cause run time errors. Returning
    return {model, view}
  }
}
