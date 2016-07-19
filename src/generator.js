import './typedefs'

import _ from 'lodash'

import {dereference} from './dereference'

/**
 * Get a unique cell name starting with name
 * @param {String} id - the ID to start with
 * @param {BunsenCell[]} cellDefinitions - the existing cells (used to avoid duplicates)
 * @returns {String} the unique ID
 */
function getCellId (id, cellDefinitions) {
  if (_.find(cellDefinitions, {id}) === undefined) {
    return id
  }

  let count = 0
  let uniqueId = ''

  do {
    count += 1
    uniqueId = `${id}-${count}`
  } while (_.find(cellDefinitions, {id: uniqueId}) !== undefined)

  return uniqueId
}

/**
 * Take the properties of an object and put primitive types above non-primitive types
 * @param {BunsenModelSet} properties - the properties for the model (key-value)
 * @returns {String[]} an array of property names in the order we should display them
 */
function getPropertyOrder (properties) {
  const primitiveProps = []
  const complexProps = []

  _.forIn(properties, (prop, propName) => {
    if (prop.type === 'object' || prop.type === 'array') {
      complexProps.push(propName)
    } else {
      primitiveProps.push(propName)
    }
  })

  return primitiveProps.concat(complexProps)
}

/**
 * Add a model cell for the given model
 * @param {String} propertyName - the name of the property that holds the model
 * @param {BunsenModel} model - the model to add a cell for
 * @param {BunsenCell[]} cellDefinitions - the cells set to add the model cell to
 * @returns {String} the cell name
 */
function addModelCell (propertyName, model, cellDefinitions) {
  const cellId = getCellId(propertyName, cellDefinitions)
  const cell = {
    id: cellId,
    children: []
  }

  cellDefinitions.push(cell)

  const props = getPropertyOrder(model.properties)
  props.forEach((propName) => {
    // we have a circular dependency
    /* eslint-disable no-use-before-define */
    addModel(propName, model.properties[propName], cell.children, cellDefinitions)
    /* eslint-enable no-use-before-define */
  })

  if (model.dependencies) {
    _.forIn(model.dependencies, (dep, depName) => {
      const depProps = getPropertyOrder(dep.properties)
      depProps.forEach((propName) => {
        // we have a circular dependency
        /* eslint-disable no-use-before-define */
        addDependentModel(propName, depName, dep.properties[propName], cell.children, cellDefinitions)
        /* eslint-enable no-use-before-define */
      })
    })
  }

  return cellId
}

/**
 * Add a property to default layout
 * @param {String} propertyName - the name of the property that holds this model
 * @param {BunsenModel} model - the actual model
 * @param {BunsenRow[]} children - the children we're adding the given model wrapper to
 * @param {BunsenCell[]} cellDefinitions - the set of all cells
 */
function addModel (propertyName, model, children, cellDefinitions) {
  const cell = {
    model: propertyName
  }

  const isObject = (model.type === 'object')
  const isArray = (model.type === 'array') && (model.items.type === 'object')

  if (isObject || isArray) {
    const subModel = isArray ? model.items : model
    const cellId = addModelCell(propertyName, subModel, cellDefinitions)
    if (isArray) {
      cell.item = {extends: cellId}
    } else {
      cell.extends = cellId
    }
  }
  children.push([cell])
}

/**
 * Add a property to default layout
 * @param {String} propertyName - the name of the property that holds this model
 * @param {String} dependencyName - the name of the dependency of this model
 * @param {BunsenModel} model - the actual model
 * @param {BunsenRow[]} children - the children we're adding the given model wrapper to
 * @param {BunsenCell[]} cellDefinitions - the set of all cells
 */
function addDependentModel (propertyName, dependencyName, model, children, cellDefinitions) {
  const cell = {
    model: propertyName,
    dependsOn: dependencyName
  }

  const isObject = (model.type === 'object')
  const isArray = (model.type === 'array') && (model.items.type === 'object')

  if (isObject || isArray) {
    const subModel = isArray ? model.items : model
    const cellId = addModelCell(propertyName, subModel, cellDefinitions)
    if (isArray) {
      cell.item = {extends: cellId}
    } else {
      cell.extends = cellId
    }
  }
  children.push([cell])
}

/**
 * Generate a default view for a JSON schema model
 * @param {BunsenModel} schema - the schema to generate a default view for
 * @returns {BunsenView} the generated view
 */
export function getDefaultView (schema) {
  const model = dereference(schema || {}).schema

  const view = {
    version: '2.0',
    type: 'form',
    cells: [{label: 'Main', extends: 'main'}],
    cellDefinitions: [
      {
        id: 'main',
        children: []
      }
    ]
  }

  const props = getPropertyOrder(model.properties)
  props.forEach((propName) => {
    addModel(propName, model.properties[propName], view.cellDefinitions[0].children, view.cellDefinitions)
  })

  return view
}
