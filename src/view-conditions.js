import './typedefs'
import {meetsCondition} from './utils/conditionals'
import {ValueWrapper} from './utils/path'
import _ from 'lodash'
import Immutable from 'seamless-immutable'

/**
 * Function used for filtering out undefined values from arrays.
 *
 * @param {any} item Item we want to check the value of
 * @returns {boolean} True if the provided value is not undefined
 */
function isNotUndefined (item) {
  return item !== undefined
}

/**
 * Check a list conditions for a cell against a provided value
 *
 * @param {ValueWrapper} value The wrapped value we want to check the conditions against
 * @returns {Function} Function that returns true if a condition has been met
 */
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

/**
 * Check the root cells of a view
 *
 * @param {BunsenView} view View we are checking
 * @param {ValueWrapper} value The wrapped value we want to check the conditions against
 * @returns {Function} Iterator function to check cells
 */
function checkRootCells (view, value) {
  return function (cell) {
    return checkCell(view, value, Immutable.from(cell)).asMutable()
  }
}

/**
 * Check a cell for conditions and apply any conditional properties if a condition is met.
 *
 * @param {BunsenView} view View the cell is a part of
 * @param {ValueWrapper} value The wrapped value we want to check the conditions against
 * @param {BunsenCell} cell Cell to check
 * @returns {BunsenCell} The cell after conditions have been processed. If a condition is not met undefined is returned
 */
function checkCellConditions (view, value, cell) {
  // Find a condition that has been met
  const meetsCondition = checkConditions(value)
  const condition = cell.conditions.find(meetsCondition)
  if (condition === undefined) {
    // Returns undefined if conditions aren't met so we can filter
    return
  }

  if (condition.then) { // Cell has conditional properties, so add them
    cell = Immutable.merge(cell, condition.then)
  }
  return cell
}

/**
 * Expands the array options of a bunsen cell
 *
 * @param {BunsenView} view View the cell is a part of
 * @param {BunsenCell} extendedCell Cell with options to expand
 * @returns {Object} The expanded options
 */
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

/**
 * Copy properties from an extended cell. Extends child cells recrusively.
 *
 * @param {BunsenView} view View the cell is a part of
 * @param {BunsenCell} cell Cell to copy properties onto
 * @returns {BunsenCell} Resulting cell after applying properties from extended cells
 */
function expandExtendedCell (view, cell) {
  const cellProps = {}
  let extendedCell = _.get(view.cellDefinitions, cell.extends)
  if (extendedCell.extends) {
    extendedCell = Immutable.without(expandExtendedCell(view, extendedCell), 'extends')
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

  return Immutable.merge(cell, extendedCell, cellProps)
}
/**
 * Check a cell's arrayOptions to make sure the value meets any conditions the cell provides
 *
 * @param {BunsenView} view View we are checking
 * @param {ValueWrapper} value The wrapped value we want to check the conditions against
 * @param {BunsenCell} cell Cell to check
 * @returns {BunsenCell} Cell with properties from any extended cells
 */
function checkArrayOptions (view, value, cell) {
  if (!cell.arrayOptions) {
    return cell
  }
  const arrayOptions = _.clone(cell.arrayOptions)
  let itemCell = _.get(arrayOptions, 'itemCell')
  if (itemCell) {
    const itemsCells = value.get().map((val, index) =>
      Immutable.without(
        checkCell(view, value.pushPath(index + ''), itemCell),
        'conditions',
        'extends'
      )
    )
    arrayOptions.itemCell = itemsCells
  }
  let tupleCells = _.get(arrayOptions, 'tupleCells')
  if (tupleCells) {
    const itemsCells = value.get().map((val, index) =>
      Immutable.without(
        checkCell(view, value.pushPath(index + ''), tupleCells[index]),
        'conditions',
        'extends'
      )
    )
    arrayOptions.tupleCells = itemsCells
  }
  return Immutable.merge(cell, {arrayOptions})
}

/**
 * Adds a cells model to the path of a ValueWrapper, if it has a model. For cells with the 'id' property,
 * the path will be reconstructed completely.
 *
 * @param {ValueWrapper} value ValueWrapper for the current path
 * @param {BunsenCell} cell Cell we want to push to the path
 * @returns {ValueWrapper} A ValueWrapper with the new path
 */
function pushModel (value, cell) {
  if (typeof cell.model === 'object') {
    const id = cell.internal ? '_internal.' + cell.id : cell.id
    return new ValueWrapper(value.value, id)
  }
  return value.pushPath(cell.model)
}

/**
 * Check a cell of a view to make sure the value meets any conditions the cell provides
 *
 * @param {BunsenView} view View we are checking
 * @param {ValueWrapper} value The wrapped value we want to check the conditions against
 * @param {BunsenCell} cell Cell to check
 * @returns {BunsenCell} Cell with properties from any extended cells
 */
function checkCell (view, value, cell) {
  if (cell.extends) {
    cell = expandExtendedCell(view, cell)
  }

  value = pushModel(value, cell)

  if (cell.conditions) { // This cell has conditions
    cell = checkCellConditions(view, value, cell)
    if (cell === undefined) {
      return
    }
  }

  if (cell.children) {
    cell = checkChildren(view, value, cell)
  }

  cell = checkArrayOptions(view, value, cell)
  return Immutable.without(cell, 'conditions', 'extends')
}

/**
 * Check conditions of a cell's children
 *
 * @param {BunsenView} view View we are checking
 * @param {ValueWrapper} value The wrapped value we want to check the conditions against
 * @param {BunsenCell} cell Cell to check
 * @returns {BunsenCell} Cell with the children checked
 */
function checkChildren (view, value, cell) {
  const children = _.map(cell.children, (child) => {
    return checkCell(view, value, child)
  })
  .filter(isNotUndefined)

  return Immutable.set(cell, 'children', children)
}

/**
 * Apply conditions (and extensions) to the cells of a view
 *
 * @export
 * @param {BunsenView} view View to process
 * @param {any} value The value we want to check conditions against
 * @returns {BunsenView} View after conditions have been applied
 */
export default function evaluateView (view, value) {
  const wrappedValue = new ValueWrapper(value, [])
  const immutableView = Immutable.from(view)
  if (view.cells === undefined) {
    return view
  }
  try {
    // Make sure we preserve non-array value so we get useful validation errors
    const cells = !Array.isArray(view.cells) ? view.cells : _.chain(view.cells)
      .map(checkRootCells(immutableView, wrappedValue))
      .filter(isNotUndefined)
      .value()

    return Object.assign(_.clone(view), {
      cells
    })
  } catch (e) {
    // Unfortunately this is necessary because view validation happens outside of the reducer,
    // so we have no guarantee that the view is valid and it may cause run time errors. Returning
    return view
  }
}
