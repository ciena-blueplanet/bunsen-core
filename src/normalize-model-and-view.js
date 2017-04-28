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
    const id = cell.id
    const isInternal = cell.internal === true
    const modelPath = getModelPath(isInternal ? `form.${id}` : id)

    state = {
      model: addBunsenModelProperty(state.model, cell.model, modelPath),
      view: normalizeCellModelProperty(cell, parents, modelPath)
    }
  }

  return normalizeChildren(state, cell, parents)
}

export function normalizeCellModelProperty (cell, parents, modelPath) {
  const view = Object.assign({}, parents.shift())
  const next = parents.shift()

  if (next === view.cells) {
    //
  } else if (next === view.cellDefinitions) {
    //
  }

  let pointer = view

  while (parents.length) {
    const parent = parents.shift()
    const index = pointer.children.indexOf(parent)

    // return new array with same children except a shallow clone for parent
    pointer.children = pointer.children.slice(0, index) // get all items before parent
      .concat(Object.assign({}, parent)) // shallow clone parent
      .concat(pointer.children.slice(index + 1)) // get all items after parent

    pointer = parent
  }

  // TODO: update cell model property and update cell in parent

  return view
}

export function normalizeCells (state) {
  if (!state.view || !state.view.cells) return state

  const parents = [state.view, state.view.cells]

  return state.view.cells.reduce(
    (_state, cell) => normalizeCell(_state, cell, parents),
    state
  )
}

export function normalizeChildren (state, cell, parents) {
  if (!Array.isArray(cell.children)) return state

  return cell.children.reduce(
    (_state, child) => {
      parents = Array.from(parents)
      parents.push(cell, cell.children)
      return normalizeCell(_state, parents)
    },
    state
  )
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
