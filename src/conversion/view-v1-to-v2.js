import _ from 'lodash'

const CARRY_OVER_PROPERTIES = ['label', 'dependsOn', 'description', 'disabled', 'model', 'placeholder']
const ARRAY_CELL_PROPERTIES = ['autoAdd', 'compact', 'showLabel', 'sortable']

/**
 * Turns rootContainers from V1 view into cells in v2 view
 *
 * @export
 * @param {Object[]} rootContainers Containers to convert
 * @returns {object[]} Array of cells converted from rootContainers
 */
export function generateCells (rootContainers) {
  return _.chain(rootContainers).flattenDeep().map(convertCell).filter().value()
}

/**
 * Converts an complex container cell for an object into a v2 cell
 *
 * @param {object} cell Cell that should display an object
 * @returns {object} Cell converted to v2
 */
function convertObjectCell (cell) {
  return _.chain(cell.rows)
  .map(rowsToCells)
  .assign(_.pick(cell, CARRY_OVER_PROPERTIES))
  .value()
}

/**
 * Converts a container cell that displays an array into a v2 cell
 *
 * @param {object} cell Cell that should display an array
 * @returns {object} Cell converted to v2
 */
function convertArrayCell (cell) {
  const {item} = cell
  const arrayOptions = _.chain(item)
  .pick(ARRAY_CELL_PROPERTIES)
  .assign({
    itemCell: convertCell(item)
  })
  .value()
  return {
    arrayOptions,
    model: cell.model
  }
}

/**
 * Creates custom renderer information for a cell
 *
 * @param {string} renderer Name of the desired renderer
 * @param {object} properties Info for to the custom renderer
 * @returns {object} Custom renderer block
 */
function customRenderer (renderer, properties) {
  return _.assign({
    name: renderer
  }, properties)
}

/**
 * Converts v1 renderer information to v2 for a cell
 *
 * @param {object} cell Cell with a custom renderer
 * @returns {object} Custom renderer block for the given cell
 */
function convertRenderer (cell) {
  const {renderer} = cell
  if (renderer === undefined) {
    return
  }
  const basicRenderers = [
    'boolean',
    'string',
    'number'
  ]
  if (basicRenderers.indexOf(renderer) >= 0) {
    return {name: renderer}
  }
  return customRenderer(renderer, cell.properties)
}

/**
 * Creates class name block for v2 cell
 *
 * @param {object} cell Cell to get class names from
 * @returns {object} Class name block for the cell
 */
function grabClassNames (cell) {
  const classNames = _.pickBy({
    cell: cell.className,
    value: cell.inputClassName,
    label: cell.labelClassName
  })
  if (_.size(classNames) > 0) {
    return classNames
  }
}

/**
 * Converts a cell for simple data type (e.g. string, or number)
 *
 * @param {object} cell Cell in v1 to convert to v2
 * @returns {object} Cell converted to v2
 */
function convertBasicCell (cell) {
  return _.pickBy(_.assign({
    renderer: convertRenderer(cell)
  }, _.pick(cell, CARRY_OVER_PROPERTIES)))
}

/**
 * Determines which cell conversion function to use to convert v1 cell to v2 and converts it
 *
 * @export
 * @param {object} cell A v1 cell to convert to v2
 * @returns {object} The cell converted to v2
 */
export function convertCell (cell) {
  let cellConverter
  if (cell.item) {
    cellConverter = convertArrayCell
  } else if (cell.rows) {
    cellConverter = convertObjectCell
  } else {
    cellConverter = convertBasicCell
  }

  return _.pickBy(_.assign({
    extends: cell.container,
    classNames: grabClassNames(cell)
  }, cellConverter(cell)))
}

/**
 * Converts rows of v1 cells to v2 cells. Simplifies the row structure when possible.
 *
 * @param {Array<object>[]} rows A set of rows to convert
 * @returns {object} A v2 cell
 */
function rowsToCells (rows) {
  if (!rows) {
    return {}
  }

  const children = rows
    .map((row) => {
      return {
        children: _.map(row, convertCell)
      }
    })

  return {
    children
  }
}

/**
 * Converts the container declarations in a v1 view to cell definitions in a v2 view
 *
 * @export
 * @param {object[]} containers Set of containers to convert
 * @returns {object} cell definitions for the v2 view.
 */
export function generateCellDefinitions (containers) {
  return _.chain(containers)
  .map(function (container) {
    const {collapsible, rows, id, className, label} = container
    const cell = rowsToCells(rows)

    if (className !== undefined) {
      cell.classNames = {
        cell: className
      }
    }

    if (collapsible !== undefined) {
      cell.collapsible = collapsible
    }

    if (label !== undefined) {
      cell.label = label
    }

    return [id, cell]
  })
  .fromPairs()
  .value()
}

/**
 * Converts a bunsen version 1 view into a bunsen/ui schema version 2 view
 *
 * @export
 * @param {any} v1View A v1 view to convert to v2
 * @returns {object} The v2 view generated from the given v1 view
 */
export default function viewV1ToV2 (v1View) {
  const {type} = v1View

  const cells = generateCells(v1View.rootContainers)

  const cellDefinitions = generateCellDefinitions(v1View.containers)

  return {
    version: '2.0',
    type,
    cells,
    cellDefinitions
  }
}
