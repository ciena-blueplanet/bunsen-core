
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

function checkRootContainers (view, value, path, prevVal) {
  return function (cell) {
    if (cell.conditions) { // This root cell has conditions
      // Find a condition that has been met
      const condition = cell.conditions.find(checkConditions(value))
      if (condition !== undefined) {
        if (condition.then) { // Cell has conditional properties, so add them
          return Object.assign(_.cloneDeep(cell), condition.then)
        }
        return cell
      }
      // Returns undefined if conditions aren't met so we can filter
    }

    if (cell.children) {
      cell = checkChildren(view, value, path)(cell)
    }

    return cell
  }
}

function checkCell (cell, meetsCondition) {
  if (cell.conditions) {
    const condition = cell.conditions.find(meetsCondition)
    if (condition === undefined) {
      return
    }
  }
  return cell
}

function checkChildren (view, value, path, prevVal) {
  return function (cell) {
    const newCell = _.clone(cell)
    const meetsCondition = checkConditions(value)
    const children = _.map(cell.children, (child) => {
      let newChild = checkCell(child, meetsCondition)
      if (newChild === undefined) {
        return
      }
      if (child.extends) {
        const extCell = view.cellDefinitions[child.extends]
        newChild = checkCell(extCell, meetsCondition)
      }
      return newChild
    })
    .filter(isNotUndefined)

    newCell.children = children
    return newCell
  }
}

export default function evaluateView (view, value) {
  const cells = view.cells.map(checkRootContainers(view, value)).filter(isNotUndefined)

  return Object.assign(_.clone(view), {
    cells
  })
}
