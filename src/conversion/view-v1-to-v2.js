import _ from 'lodash'

const CARRY_OVER_PROPERTIES = ['label', 'dependsOn', 'description', 'disabled', 'model', 'placeholder']
const ARRAY_CELL_PROPERTIES = ['autoAdd', 'compact', 'showLabel', 'sortable']

export function generateCells (rootContainers) {
  return _.chain(rootContainers).flattenDeep().map(convertCell).filter().value()
}

function convertObjectCell (cell) {
  return _.chain(cell.rows)
  .map(function (row) {
    const flatRows = _.chain(row).flattenDeep().map(convertCell).filter().value()
    return {
      children: flatRows
    }
  })
  .fromPairs()
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

function convertRenderer (rendererName) {

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

export function generateCellDefinitions (containers) {
  return _.chain(containers)
  .map(function (container) {
    const {rows, id} = container
    const flatRows = _.chain(rows).flattenDeep().map(convertCell).filter().value()
    return [id, {
      children: flatRows
    }]
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
