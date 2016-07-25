import _ from 'lodash'

function generateCells () {

}

function convertObjectCell (cell) {

}

function convertArrayCell (cell) {
  const {item} = cell
  const arrayOptions = _.chain(item)
  .pick(['autoAdd', 'compact', 'showLabel', 'sortable'])
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
  return {
    cell: cell.className,
    value: cell.inputClassName,
    label: cell.labelClassName
  }
}

function convertBasicCell (cell) {
  return _.assign({
    renderer: convertRenderer(cell)
  }, _.pick(cell, ['label', 'dependsOn', 'description', 'disabled', 'model', 'placeholder']))
}

export function convertCell (cell) {
  let cellConverter
  if (cell.arrayOptions) {
    cellConverter = convertArrayCell
  } else if (cell.rows) {
    cellConverter = convertObjectCell
  } else {
    cellConverter = convertBasicCell
  }

  return _.assign({
    extends: cell.container,
    classNames: grabClassNames(cell)
  }, cellConverter(cell))
}

export function generateCellDefinitions (containers) {
  return _.chain(containers)
  .map(function (container) {
    const {rows, id} = container
    const flatRows = _.flatMap(rows, convertCell)
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
