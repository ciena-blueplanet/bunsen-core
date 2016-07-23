import _ from 'lodash'

function generateCells () {

}

export function convertCell (cell) {
  return {
    extends: cell.container
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
