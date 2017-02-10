
import {meetsCondition} from './utils/conditionals'
import _ from 'lodash'
import Immutable from 'seamless-immutable'

function isNotUndefined (item) {
  return item !== undefined
}

function checkConditions (value) {
  return function (condition) {
    const metCondition = conditionItem =>
        _.every(conditionItem, (condition, propName) =>
          meetsCondition(value.get(propName), condition)
        )

    if (condition.unless) {
      const unless = condition.unless.find(metCondition)
      if (unless !== undefined) {
        return false
      }
    }
    if (condition.if) {
      return isNotUndefined(condition.if.find(metCondition))
    } else {
      return true
    }
  }
}

function checkRootCells (view, value) {
  return function (cell) {
    return checkCell(view, value, cell)
  }
}

function checkCellConditions (view, value, cell) {
  // Find a condition that has been met
  const meetsCondition = checkConditions(value)
  const condition = cell.conditions.find(meetsCondition)
  if (condition === undefined) {
    // Returns undefined if conditions aren't met so we can filter
    return
  }
  cell = _.clone(cell)
  if (condition.then) { // Cell has conditional properties, so add them
    cell = Object.assign(cell, condition.then)
  }
  return cell
}

function expandExtendedCell (view, cell) {
  let extendedCell = view.cellDefinitions[cell.extends]
  if (extendedCell.extends) {
    extendedCell = expandExtendedCell(view, extendedCell)
    delete extendedCell.extends
  }

  if (extendedCell.itemCell && extendedCell.itemCell.extends) {
    extendedCell = _.clone(extendedCell)
    extendedCell.itemCell = expandExtendedCell(view, extendedCell.itemCell)
  }

  if (extendedCell.children) {
    extendedCell.children = extendedCell.children.map(child => {
      if (child.extends) {
        return expandExtendedCell(view, child)
      }
      return child
    })
  }

  return _.defaults(
    _.clone(cell),
    extendedCell
  )
}

function checkCell (view, value, cell) {
  if (cell.extends) {
    cell = expandExtendedCell(view, cell)
  }

  value = value.pushPath(cell.model)

  if (cell.conditions) { // This cell has conditions
    cell = checkCellConditions(view, value, cell)
    if (cell === undefined) {
      return
    }
  }

  if (cell.children) {
    cell = checkChildren(view, value, cell)
  }

  delete cell.conditions
  delete cell.extends
  return cell
}

function checkChildren (view, value, cell) {
  const newCell = _.clone(cell)
  const children = _.map(cell.children, (child) => {
    return checkCell(view, value, child)
  })
  .filter(isNotUndefined)

  newCell.children = children
  return newCell
}

export default function evaluateView (view, value) {
  value = new ValueWrapper(value, [])
  const cells = view.cells.map(checkRootCells(view, value)).filter(isNotUndefined)

  return Object.assign(_.clone(view), {
    cells
  })
}

function findRelativePath (path, index = 0) {
  let nextInPath = _.last(path)

  if (nextInPath === '') { // . for sibling
    if (index <= 0) {
      index += 1
    }
    path.pop()
    if (_.last(path) === '') { // .. for sibling of parent
      path.pop()
      nextInPath = path.pop().replace('/', '')// get rid of leading slash
      if (nextInPath === '') {
        return findRelativePath(path, index + 1)
      }
      path.push(nextInPath)
      return index + 1
    } else {
      nextInPath = path.pop().replace('/', '')// get rid of leading slash
      if (nextInPath === '') {
        return findRelativePath(path, index)
      }
      path.push(nextInPath)
      return index
    }
  }
}

class ValueWrapper {
  static pathAsArray (path) {
    if (!Array.isArray(path)) {
      return path.split('.')
    }
    return path
  }
  constructor (value, curPath) {
    this.value = value
    this.path = Immutable(ValueWrapper.pathAsArray(curPath))
  }
  get (path) {
    let absolutePath
    if (path === undefined) {
      if (this.path.length <= 0) {
        return this.value
      }
      return _.get(this.value, this.path.join('.'))
    }
    path = ValueWrapper.pathAsArray(path)

    let nextInPath = _.first(path)

    if (nextInPath === '') {
      let index = findRelativePath(path.reverse())
      absolutePath = this.path.slice(0, this.path.length - index).concat(path)
    } else {
      absolutePath = path
    }

    return _.get(this.value, absolutePath.join('.'))
  }

  pushPath (path) {
    if (path === undefined) {
      return this
    }
    path = ValueWrapper.pathAsArray(path)
    return new ValueWrapper(this.value, this.path.concat(path))
  }
}
