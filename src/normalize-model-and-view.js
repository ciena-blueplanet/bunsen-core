import {getModelPath} from './utils'

export function addBunsenModelProperty (bunsenModel, propertyModel, modelPath) {
  const model = Object.assign({}, bunsenModel)
  const segments = modelPath.split('.')

  let pointer = model

  while (segments.length) {
    const key = segments.shift()

    if (key in pointer) {
      pointer[key] = Object.assign({}, pointer[key])
    } else if (segments.length === 0) {
      pointer[key] = propertyModel
    } else {
      pointer[key] = {
        properties: {},
        type: 'object'
      }
    }

    pointer = pointer[key]
  }

  return model
}

export function normalizeCellDefinitions (state) {
  if (!state.view || !state.view.cellDefinitions) return state

  Object.keys(state.model.cellDefinitions).forEach((key) => {
    //
  })

  return state
}

export function normalizeCell (state, cell, parents) {
  if (typeof cell.model === 'object') {
    const isInternal = cell.internal === true
    const id = isInternal ? `internal.${cell.id}` : cell.id
    const modelPath = getModelPath(id)
    const viewState = normalizeCellProperties(parents.concat(cell), id)

    // This makes it so parents are the shallow clones created within
    // normalizeCellProperties() which are now in state.view
    parents = viewState.parents.slice(0, parents.length)

    state = {
      model: addBunsenModelProperty(state.model, cell.model, modelPath),
      parents,
      view: viewState.view
    }
  }

  return normalizeChildren(state, cell, parents)
}

export function normalizeCellProperties (nodes, modelPath) {
  const view = Object.assign({}, nodes.shift())
  const next = nodes.shift()
  const parents = [view]

  let pointer = view

  if (next === view.cells) {
    const cell = nodes.shift()
    const index = view.cells.indexOf(cell)

    pointer = Object.assign({}, cell)

    // return new array with same cells except a shallow clone for cell
    view.cells = view.cells.slice(0, index) // get all cells before cell
      .concat(pointer) // shallow clone cell
      .concat(view.cells.slice(index + 1)) // get all cells after cell

    parents.push(view.cells, pointer)
  } else if (next === view.cellDefinitions) {
    view.cellDefinitions = Object.assign({}, view.cellDefinitions)
    const def = nodes.shift()

    let defKey

    Object.keys(view.cellDefinitions).find((key) => {
      const result = view.cellDefinitions[key] === def
      if (result) defKey = key
      return result
    })

    pointer = view.cellDefinitions[defKey] = Object.assign({}, def)
    parents.push(view.cellDefinitions, pointer)
  }

  while (nodes.length) {
    if (pointer.children) {
      nodes.shift() // children

      const child = nodes.shift()
      const index = pointer.children.indexOf(child)
      const clone = Object.assign({}, child)

      // return new array with same children except a shallow clone for parent
      pointer.children = pointer.children.slice(0, index) // get all items before parent
        .concat(clone) // shallow clone parent
        .concat(pointer.children.slice(index + 1)) // get all items after parent

      parents.push(pointer.children, clone)
      pointer = clone
    }
  }

  pointer.model = modelPath
  delete pointer.id
  delete pointer.internal

  return {
    parents,
    view
  }
}

export function normalizeCells (state) {
  if (!state.view || !Array.isArray(state.view.cells)) return state

  return state.view.cells.reduce(
    (_state, cell) => {
      const parents = [_state.view, _state.view.cells]
      return normalizeCell(_state, cell, parents)
    },
    state
  )
}

export function normalizeChildren (state, cell, parents) {
  if (!Array.isArray(cell.children)) return state

  const newState = cell.children.reduce(
    (_state, child) => {
      let childParents

      if (_state.parents) {
        childParents = _state.parents.slice(0, parents.length + 2)
      } else {
        childParents = parents.concat([cell, cell.children])
      }

      return normalizeCell(_state, child, childParents)
    },
    state
  )

  // Make sure outbound parents are just clones of inbound parents
  newState.parents = newState.parents.slice(0, parents.length)

  return newState
}

export default function ({model, view}) {
  return [
    normalizeCellDefinitions,
    normalizeCells
  ]
    .reduce(
      (state, method) => method(state),
      {model, view}
    )
}
