import _ from 'lodash'

const CARRY_OVER_PROPERTIES = ['label', 'dependsOn', 'description', 'disabled', 'model', 'placeholder']
const ARRAY_CELL_PROPERTIES = ['autoAdd', 'compact', 'showLabel', 'sortable']

export function generateCells (rootContainers) {
  return _.chain(rootContainers).flattenDeep().map(convertCell).filter().value()
}

function convertObjectCell (cell) {
  return _.chain(cell.rows)
  .map(rowsToCells)
  .assign(_.pick(cell, CARRY_OVER_PROPERTIES))
  .value()
}

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

function customRenderer (renderer, cell) {
  return _.assign({
    name: renderer
  }, cell.properties)
}

function convertRenderer (cell) {
  const {renderer} = cell
  if (renderer === undefined) {
    return
  }
  switch (renderer) {
    case 'boolean':
    case 'string':
    case 'number':
      return {name: renderer}
    case 'button-group':
    case 'select':
    case 'multi-select':
    case 'textarea':
    default:
      return customRenderer(renderer, cell)
  }
}

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

function convertBasicCell (cell) {
  return _.pickBy(_.assign({
    renderer: convertRenderer(cell)
  }, _.pick(cell, CARRY_OVER_PROPERTIES)))
}

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

function rowsToCells (rows) {
  const collapseRows = !_.some(rows, function (row) {
    return row.length > 1
  })
  const collapseColumns = rows.length <= 1
  let rowChain = _.chain(rows)
  if (collapseRows && collapseColumns) {
    return rowChain.flattenDeep().map(convertCell).filter().first().value()
  }
  let children
  if (collapseRows || collapseColumns) {
    children = rowChain.flattenDeep().map(convertCell).filter().value()
  } else {
    children = rowChain.map((row) => {
      return {
        children: _.map(row, convertCell)
      }
    }).filter().value()
  }
  return {
    children
  }
}

export function generateCellDefinitions (containers) {
  return _.chain(containers)
  .map(function (container) {
    const {rows, id} = container
    return [id, rowsToCells(rows)]
  })
  .fromPairs()
  .value()
}

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
