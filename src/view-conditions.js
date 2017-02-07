
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

function checkRootContainers (view, value, prevVal) {
  return function (cell) {
    if (cell.container) {
      // Find if the named cell's condition's are met

    }

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
    } else {
      return cell
    }
  }
}

function checkContainer (view, value, path, prevVal) {
  return function (container) {
    const newContainer = _.clone(container)
    const rows = _.map(container.rows, (row) => {
      const newRow = row.map(cell => {
        cell = _.clone(cell)
        if (cell.conditions) {
          const condition = cell.conditions.find(checkConditions(value))
          if (condition === undefined) {
            return
          }
          delete cell.conditions
        }

        if (cell.extends) {
          const extContainer = view.containers.find(container => container.id === cell.extends)
          if (extContainer.conditions) {
            const condition = extContainer.conditions.find(checkConditions(value))
            if (condition === undefined) {
              return
            }
          }
        }
        return cell
      }).filter(isNotUndefined)
      if (newRow.length > 0) {
        return newRow
      }
    }).filter(isNotUndefined)
    if (rows.length > 0) {
      newContainer.rows = rows
    }
    return newContainer
  }
}

export default function evaluateView (view, value) {
  // const rootContainers = view.rootContainers.map(checkRootContainers(view, value)).filter(isNotUndefined)
  let containers
  if (view.containers) {
    containers = view.containers.map(checkContainer(view, value, '')).filter(isNotUndefined)
  }

  return Object.assign(_.cloneDeep(view), {
    // rootContainers,
    containers
  })
}
