import _ from 'lodash'
import {BunsenModelPath} from './utils'
import {ValueWrapper} from './utils/path'
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

function appendModelPath (modelPath, id, internal) {
  const addedModelPath = getModelPath(id)
  if (internal) {
    return `${modelPath}.properties._internal.${addedModelPath}`
  }
  return `${modelPath}.${addedModelPath}`
}

function expandCell (cell, cellDefinitions) {
  while (cell.extends) {
    const extendedCell = cellDefinitions[cell.extends]
    cell = Object.assign({}, extendedCell, _.without(cell, 'extends'))
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
    } else if (segments.length === 0) {
      pointer[key] = propertyModel
    } else {
      pointer[key] = {
        properties: {},
        type: 'object'
      }
    }

    pointer = pointer[key]
  }

  return model
}

/**
 * Normalize view cell
 * @param {BunsenCell} cell - cell to normalize
 * @param {Object} modelDefinitions - parent nodes
 * @returns {BunsenCell} - normalized state (contains model, view, and parents)
 */
export function normalizeCell (cell, cellDefinitions) {
  const newCell = expandCell(cell, cellDefinitions)
  if (typeof newCell.model === 'object') {
    const isInternal = newCell.internal === true
    const model = isInternal ? `_internal.${newCell.id}` : newCell.id
    newCell.model = model
  }

  const children = normalizeChildren(cell, cellDefinitions)
  if (children) {
    newCell.children = children
  }
  if (cell.arrayOptions) {
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
    newCell.arrayOptions = arrayOptions
  }

  return newCell
}

/**
 * Normalize properties on a view cell
 * @param {Array<BunsenView | BunsenCell>} nodes - cell node and all parent nodes
 * @param {String} modelPath - model path
 * @returns {Object} - normalized state (contains model and view)
 */
export function normalizeCellProperties (nodes, modelPath) {
  const view = Object.assign({}, nodes.shift())
  const next = nodes.shift()
  const parents = [view]

  let pointer = view

  if (next === view.cells) {
    const cell = nodes.shift()
    const index = view.cells.indexOf(cell)

    pointer = Object.assign({}, cell)

    // return new array with same cells except a shallow clone for cell
    view.cells = view.cells.slice(0, index) // get all cells before cell
      .concat(pointer) // shallow clone cell
      .concat(view.cells.slice(index + 1)) // get all cells after cell

    parents.push(view.cells, pointer)
  } else if (next === view.cellDefinitions) {
    view.cellDefinitions = Object.assign({}, view.cellDefinitions)
    const def = nodes.shift()

    let defKey

    Object.keys(view.cellDefinitions).find((key) => {
      const result = view.cellDefinitions[key] === def
      if (result) defKey = key
      return result
    })

    pointer = view.cellDefinitions[defKey] = Object.assign({}, def)
    parents.push(view.cellDefinitions, pointer)
  }

  while (nodes.length) {
    if (pointer.children) {
      nodes.shift() // children

      const child = nodes.shift()
      const index = pointer.children.indexOf(child)
      const clone = Object.assign({}, child)

      // return new array with same children except a shallow clone for parent
      pointer.children = pointer.children.slice(0, index) // get all items before parent
        .concat(clone) // shallow clone parent
        .concat(pointer.children.slice(index + 1)) // get all items after parent

      parents.push(pointer.children, clone)
      pointer = clone
    }
  }

  pointer.model = modelPath
  delete pointer.id
  delete pointer.internal

  return {
    parents,
    view
  }
}

/**
 * Normalize top level cells
 * @param {BunsenView} view – unnormalized view
 * @returns {Object} - normalized view
 */
export function normalizeCells (view) {
  if (!view || !Array.isArray(view.cells)) return view
  const newCells = view.cells.map((cell) => {
    return normalizeCell(cell, view.cellDefinitions)
  })

  const newView = _.clone(view)
  newView.cells = newCells

  return newView
}

/**
 * Normalize view cell's children
 * @param {Object} state - unnormalized state (contains model and view)
 * @param {BunsenCell} cell - cell that contains children to normalize
 * @param {Array<BunsenView | BunsenCell>} parents - parent nodes
 * @returns {Object} - normalized state (contains model, view, and parents)
 */
export function normalizeChildren (cell, modelDefinitions) {
  if (!Array.isArray(cell.children)) return

  return cell.children.map((cell) => normalizeCell(cell, modelDefinitions))
}

function pluckModels (cell, modelPath, models, cellDefinitions) {
  cell = expandCell(cell, cellDefinitions)
  if (_.isObject(cell.model)) {
    const addedPath = appendModelPath(modelPath.modelPath(), cell.id, cell.internal)
    models[addedPath] = cell.model
  } else if (cell.children) { // recurse on objects
    cell.children.forEach((cell) => {
      pluckModels(cell, modelPath.concat(cell.model), models, cellDefinitions)
    })
  } else if (cell.arrayOptions) { // recurse on arrays
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
}

function aggregateModels (view, modelPath, models = {}) {
  view.cells.forEach(function (cell) {
    const newPath = typeof cell.model === 'string' ? modelPath.concat(cell.model) : modelPath
    pluckModels(cell, newPath, models, view.cellDefinitions)
  })
  return models
}

function expandModel (model, view) {
  const modelPath = new BunsenModelPath(model)
  const modelExpansions = aggregateModels(view, modelPath)
  let newModel = model
  _.forEach(modelExpansions, (propertyModel, path) => {
    newModel = addBunsenModelProperty(newModel, propertyModel, path)
  })
  return {model: newModel, modelExpansions}
}

/**
 * Normalize bunsen model and view from model partials defined in view
 * @param {BunsenModel} model - bunsen model
 * @param {BunsenView} view - bunsen view
 * @returns {Object} - normalized state (contains model and view)
 */
export default function ({model, view}) {
  const expandedModel = expandModel(model, view)
  const normalizedView = normalizeCells(view)
  return {model: expandedModel.model, view: normalizedView}
}
