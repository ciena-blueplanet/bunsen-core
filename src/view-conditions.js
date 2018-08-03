import './typedefs'
import {meetsCondition} from './utils/conditionals'
import {ValueWrapper} from './utils/path'
import _ from 'lodash'

function isNotUndefined (item) {
  return item !== undefined
}

function checkConditions (value, formValue) {
  return function (condition) {
    const metCondition = conditionItem =>
        _.every(conditionItem, (condition, propName) =>
          meetsCondition(value.get(propName), condition, formValue)
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

function checkRootCells (view, value, formValue) {
  return function (cell) {
    return checkCell(view, value, cell, formValue)
  }
}

function checkCellConditions (view, value, cell, formValue) {
  // Find a condition that has been met
  const meetsCondition = checkConditions(value, formValue)
  const condition = cell.conditions.find(meetsCondition)
  if (condition === undefined) {
    // Returns undefined if conditions aren't met so we can filter
    return
  }

  if (condition.then) { // Cell has conditional properties, so add them
    cell = Object.assign({}, cell, condition.then)
  }
  return cell
}

function expandArrayOptions (view, extendedCell) {
  const arrayOptions = {}
  if (extendedCell.arrayOptions.itemCell && extendedCell.arrayOptions.itemCell.extends) {
    arrayOptions.itemCell = expandExtendedCell(view, extendedCell.itemCell)
  }
  if (extendedCell.arrayOptions.tupleCells) {
    arrayOptions.tupleCells = extendedCell.arrayOptions.tupleCells.map(child => {
      if (child.extends) {
        return expandExtendedCell(view, child)
      }
      return child
    })
  }
  return arrayOptions
}

function expandExtendedCell (view, cell) {
  const cellProps = {}
  let extendedCell = _.get(view.cellDefinitions, cell.extends)
  if (extendedCell.extends) {
    extendedCell = _.omit(expandExtendedCell(view, extendedCell), ['extends'])
  }

  if (extendedCell.arrayOptions) {
    cellProps.arrayOptions = expandArrayOptions(view, extendedCell)
  }

  if (extendedCell.children) {
    cellProps.children = extendedCell.children.map(child => {
      if (child.extends) {
        return expandExtendedCell(view, child)
      }
      return child
    })
  }

  return Object.assign({}, cell, extendedCell, cellProps)
}

function getItemCell (itemCell, index) {
  if (Array.isArray(itemCell)) {
    return itemCell[index]
  }
  return itemCell
}

function cellFromArrayValues (view, value, cell, formValue) {
  const val = value.get()
  if (val && val.length > 0) {
    const possibleCellSchema = val.map((val, index) => {
      const indexedCell = getItemCell(cell, index)
      const evaluatedCell = checkCell(view, value.pushPath(String(index)), indexedCell, formValue)
      return _.omit(evaluatedCell || cell, ['conditions', 'extends'])
    })
    const first = possibleCellSchema[0]
    const isHeterogenous = possibleCellSchema.some((cell) => !_.isEqual(cell, first))

    if (isHeterogenous) {
      return possibleCellSchema
    } else {
      return possibleCellSchema[0]
    }
  } else {
    return _.omit(
      checkCell(view, value.pushPath('0'), getItemCell(cell, 0), formValue) || cell,
      ['conditions', 'extends']
    )
  }
}

function checkArrayOptions (view, value, cell, formValue) {
  if (!cell.arrayOptions) {
    return cell
  }
  const arrayOptions = _.clone(cell.arrayOptions)
  let itemCell = _.get(arrayOptions, 'itemCell')
  if (itemCell) {
    arrayOptions.itemCell = cellFromArrayValues(view, value, itemCell, formValue)
  }

  let tupleCells = _.get(arrayOptions, 'tupleCells')
  if (tupleCells) {
    const itemsCells = tupleCells.map((cell, index) =>
      _.omit(
        checkCell(view, value.pushPath(index + ''), cell, formValue) || cell,
        ['conditions', 'extends']
      )
    )
    arrayOptions.tupleCells = itemsCells
  }
  return Object.assign({}, cell, {arrayOptions})
}

function pushModel (value, cell) {
  if (typeof cell.model === 'object') {
    const id = cell.internal ? '_internal.' + cell.id : cell.id
    return new ValueWrapper(value.value, id)
  }
  return value.pushPath(cell.model)
}

function checkCell (view, value, cell, formValue) {
  if (cell.extends) {
    cell = expandExtendedCell(view, cell)
  }

  value = pushModel(value, cell)

  if (cell.conditions) { // This cell has conditions
    cell = checkCellConditions(view, value, cell, formValue)
    if (cell === undefined) {
      return
    }
  }

  if (cell.children) {
    cell = checkChildren(view, value, cell, formValue)
  }

  cell = checkArrayOptions(view, value, cell, formValue)
  return _.omit(cell, ['conditions', 'extends'])
}

function checkChildren (view, value, cell, formValue) {
  const children = cell.children.map((child) => {
    return checkCell(view, value, child, formValue)
  })
  .filter(isNotUndefined)

  return Object.assign({}, cell, {children})
}

export default function evaluateView (view, value) {
  const wrappedValue = new ValueWrapper(value, [])
  if (view.cells === undefined) {
    return view
  }
  try {
    const cells = view.cells
      .map(checkRootCells(view, wrappedValue, value))
      .filter(isNotUndefined)

    return Object.assign({}, view, {cells})
  } catch (e) {
    // Unfortunately this is necessary because view validation happens outside of the reducer,
    // so we have no guarantee that the view is valid and it may cause run time errors. Returning
    return view
  }
}
