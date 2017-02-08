
import {meetsCondition, pathFinder} from './utils/conditionals'
import _ from 'lodash'

function isNotUndefined (item) {
  return item !== undefined
}

function checkConditions (value) {
  return function (condition) {
    if (condition.unless) {
      const unless = condition.unless.find(conditionItem =>
        _.every(conditionItem, (condition, propName) => {
          const val = _.get(value, propName)
          return meetsCondition(val, condition)
        })
      )
      if (unless !== undefined) {
        return false
      }
    }
    if (condition.if) {
      return isNotUndefined(condition.if.find(conditionItem =>
        _.every(conditionItem, (condition, propName) => meetsCondition(_.get(value, propName), condition))
      ))
    } else {
      return true
    }
  }
}

function checkRootCells (view, value, path, prevVal) {
  const meetsCondition = checkConditions(value)
  return function (cell) {
    return checkCell(view, value, cell, meetsCondition)
  }
}

function checkCellConditions (view, value, cell, meetsCondition) {
  // Find a condition that has been met
  const condition = cell.conditions.find(meetsCondition)
  if (condition === undefined) {
    // Returns undefined if conditions aren't met so we can filter
    return
  }
  if (condition.then) { // Cell has conditional properties, so add them
    cell = Object.assign(_.clone(cell), condition.then)
  }
  return cell
}

function expandExtendedCell (view, value, cell) {
  let extendedCell = view.cellDefinitions[cell.extends]
  if (extendedCell.extends) {
    extendedCell = expandExtendedCell(view, value, extendedCell)
    delete extendedCell.extends
  }

  return _.defaults(
    _.clone(cell),
    extendedCell
  )
}

function checkCell (view, value, cell, meetsCondition) {
  if (cell.extends) {
    cell = expandExtendedCell(view, value, cell)
  }

  if (cell.conditions) { // This cell has conditions
    cell = checkCellConditions(view, value, cell, meetsCondition)
    if (cell === undefined) {
      return
    }
  }

  if (cell.children) {
    cell = checkChildren(view, value, cell, meetsCondition)
  }

  delete cell.conditions
  delete cell.extends
  return cell
}

function checkChildren (view, value, cell, meetsCondition) {
  const newCell = _.clone(cell)
  const children = _.map(cell.children, (child) => {
    return checkCell(view, value, child, meetsCondition)
  })
  .filter(isNotUndefined)

  newCell.children = children
  return newCell
}

export default function evaluateView (view, value) {
  const cells = view.cells.map(checkRootCells(view, value)).filter(isNotUndefined)

  return Object.assign(_.clone(view), {
    cells
  })
}
