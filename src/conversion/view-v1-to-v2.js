import _ from 'lodash'

function generateCells () {

}

function convertObjectCell(cell) {
  
}

function convertArrayCell(cell) {
  const {item} = cell
  const arrayOptions = _.chain(item)
  .pick(['autoAdd', 'compact', 'showLabel', 'sortable'])
  .assign({
    itemCell: _.assign({
      extends: item.container
    }, _.pick(item, ['label', '']))
  })
  .value()
  return {
    arrayOptions
  }
}

function convertBasicCell (cell) {

}

export function convertCell (cell) {
  return {
    extends: cell.container,
    classNames: cell.className
  }
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

export function viewV1ToV2 (v1View) {
  const {type} = v1View

  const cells = generateCells

  const cellDefinitions = generateCellDefinitions(v1View.containers)

  return {
    version: '2.0',
    type,
    cells,
    cellDefinitions
  }
}
