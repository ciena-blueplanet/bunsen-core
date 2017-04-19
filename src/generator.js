import './typedefs'

import _ from 'lodash'

import {dereference} from './dereference'

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

function objectCell (propertyName, model, cellDefinitions) {
  return {
    model: propertyName,
    extends: addModelCell(propertyName, model, cellDefinitions)
  }
}
function arrayCell (propertyName, model, cellDefinitions) {
  const cellId = addModelCell(propertyName, model.items, cellDefinitions)
  return {
    model: propertyName,
    arrayOptions: {
      itemCell: {
        extends: cellId
      }
    }
  }
}
function tupleCell (propertyName, model, cellDefinitions) {
  const children = model.items.map((item, index) => {
    const cell = addModel(`${propertyName}.${index}`, item, cellDefinitions)
    cell.model = index + ''
    return cell
  })
  const cell = {
    model: propertyName,
    children
  }
  if (model.additionalItems && typeof model.additionalItems === 'object') {
    cell.arrayOptions = {
      itemCell: {
        extends: addModelCell(propertyName + 'Items', model.additionalItems, cellDefinitions)
      }
    }
  }
  return cell
}

function getModelType (model) {
  if (model.type === 'array' && Array.isArray(model.items)) {
    return 'tuple'
  }
  return model.type
}
/**
 * Add a model cell for the given model
 * @param {String} propertyName - the name of the property that holds the model
 * @param {BunsenModel} model - the model to add a cell for
 * @param {BunsenCell[]} cellDefinitions - the cells set to add the model cell to
 * @returns {String} the cell name
 */
function addModelCell (propertyName, model, cellDefinitions) {
  const cell = {}

  var defName = propertyName
  var counter = 1

  while (defName in cellDefinitions) {
    defName = `${propertyName}${counter}`
    counter++
  }

  cellDefinitions[defName] = cell

  const props = getPropertyOrder(model.properties)
  const children = props.map((propName) => {
    // we have a circular dependency
    /* eslint-disable no-use-before-define */
    return addModel(propName, model.properties[propName], cellDefinitions)
    /* eslint-enable no-use-before-define */
  })

  if (model.dependencies) {
    _.forIn(model.dependencies, (dep, depName) => {
      const depProps = getPropertyOrder(dep.properties)
      const depChildren = depProps.map((propName) => {
        // we have a circular dependency
        /* eslint-disable no-use-before-define */
        return addDependentModel(propName, depName, dep.properties[propName], cellDefinitions)
        /* eslint-enable no-use-before-define */
      })
      children.push.apply(children, depChildren)
    })
  }
  if (children.length > 0) {
    cell.children = children
  }
  return defName
}

/**
 * Add a property to default layout
 * @param {String} propertyName - the name of the property that holds this model
 * @param {BunsenModel} model - the actual model
 * @param {BunsenCell[]} cellDefinitions - the set of all cell definitions
 * @returns {BunsenCell} - the new cell
 */
function addModel (propertyName, model, cellDefinitions) {
  let cell = {
    model: propertyName
  }
  const modelType = getModelType(model)
  switch (modelType) {
    case 'array':
      if (model.items) {
        cell = arrayCell(propertyName, model, cellDefinitions)
      }
      break

    case 'object':
      cell = objectCell(propertyName, model, cellDefinitions)
      break
    case 'tuple':
      cell = tupleCell(propertyName, model, cellDefinitions)
  }

  return cell
}
/**
 * Add a property to default layout
 * @param {String} propertyName - the name of the property that holds this model
 * @param {String} dependencyName - the name of the dependency of this model
 * @param {BunsenModel} model - the actual model
 * @param {BunsenCell[]} cellDefinitions - the set of all cell definitions
 * @returns {BunsenCell} - The new cell
 */
function addDependentModel (propertyName, dependencyName, model, cellDefinitions) {
  const cell = addModel(propertyName, model, cellDefinitions)
  cell.dependsOn = dependencyName
  return cell
}

/**
 * Generate a default view for a JSON schema model
 * @param {BunsenModel} schema - the schema to generate a default view for
 * @returns {BunsenView} the generated view
 */
export function generateView (schema) {
  const model = dereference(schema || {}).schema
  const props = getPropertyOrder(model.properties)
  const cellDefinitions = {
    main: {}
  }

  const children = props.map((propName) => addModel(propName, model.properties[propName], cellDefinitions))
  cellDefinitions.main.children = children
  const view = {
    version: '2.0',
    type: 'form',
    cells: [{extends: 'main'}],
    cellDefinitions
  }

  return view
}

export default generateView
