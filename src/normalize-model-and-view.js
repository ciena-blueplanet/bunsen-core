/**
 * Convert a model reference to a proper path in the model schema
 *
 * hero.firstName => hero.properties.firstName
 * foo.bar.baz => foo.properties.bar.properties.baz
 *
 * Leading or trailing '.' mess up our trivial split().join() and aren't valid anyway, so we
 * handle them specially, undefined being passed into _.get() will yield undefined, and display
 * the error we want to display when the model reference is invalid, so we return undefined
 *
 * hero. => undefined
 * .hero => undefined
 *
 * @param {String} reference - the dotted reference to the model
 * @returns {String} the proper dotted path in the model schema (or undefined if it's a bad path)
 */
export function getModelPath (reference) {
  const pattern = /^[^.](.*[^.])?$/
  let path = pattern.test(reference) ? `properties.${reference.split('.').join('.properties.')}` : undefined

  if (typeof path === 'string' || path instanceof String) {
    path = path.replace(/\.properties\.(\d+)\./g, '.items.') // Replace array index with "items"
  }

  return path
}

/**
 * Add property model into full model
 * @param {BunsenModel} bunsenModel - full model
 * @param {BunsenModel} propertyModel - property model
 * @param {String} modelPath - path to property in full model
 * @returns {BunsenModel} full model with property model inserted
 */
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

/**
 * Normalize cell definitions
 * @param {Object} state – unnormalized state (contains model and view)
 * @returns {Object} - normalized state (contains model and view)
 */
export function normalizeCellDefinitions (state) {
  if (!state.view || !state.view.cellDefinitions) return state

  const newState = Object.keys(state.view.cellDefinitions)
    .reduce(
      (_state, key) => {
        const cell = _state.view.cellDefinitions[key]

        const parents = [
          _state.view,
          _state.view.cellDefinitions
        ]

        return normalizeCell(_state, cell, parents)
      },
      state
    )

  delete newState.parents

  return newState
}

/**
 * Normalize view cell
 * @param {Object} state - unnormalized state (contains model and view)
 * @param {BunsenCell} cell - cell to normalize
 * @param {Array<BunsenView | BunsenCell>} parents - parent nodes
 * @returns {Object} - normalized state (contains model, view, and parents)
 */
export function normalizeCell (state, cell, parents) {
  if (typeof cell.model === 'object') {
    const isInternal = cell.internal === true
    const id = isInternal ? `_internal.${cell.id}` : cell.id
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

/**
 * Normalize properties on a view cell
 * @param {Array<BunsenView | BunsenCell>} nodes - cell node and all parent nodes
 * @param {String} modelPath - model path
 * @returns {Object} - normalized state (contains model and view)
 */
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

/**
 * Normalize top level cells
 * @param {Object} state – unnormalized state (contains model and view)
 * @returns {Object} - normalized state (contains model and view)
 */
export function normalizeCells (state) {
  if (!state.view || !Array.isArray(state.view.cells)) return state

  const newState = state.view.cells.reduce(
    (_state, cell) => {
      const parents = [_state.view, _state.view.cells]
      return normalizeCell(_state, cell, parents)
    },
    state
  )

  delete newState.parents

  return newState
}

/**
 * Normalize view cell's children
 * @param {Object} state - unnormalized state (contains model and view)
 * @param {BunsenCell} cell - cell that contains children to normalize
 * @param {Array<BunsenView | BunsenCell>} parents - parent nodes
 * @returns {Object} - normalized state (contains model, view, and parents)
 */
export function normalizeChildren (state, cell, parents) {
  if (!Array.isArray(cell.children)) return state

  const newState = cell.children.reduce(
    (_state, child, index) => {
      const childParents = _state.parents.slice(0, parents.length + 2)
      return normalizeCell(_state, child, childParents)
    },
    Object.assign({}, state, {
      parents: parents.concat([cell, cell.children])
    })
  )

  // Make sure outbound parents are just clones of inbound parents
  newState.parents = newState.parents.slice(0, parents.length)

  return newState
}

/**
 * Normalize bunsen model and view from model partials defined in view
 * @param {BunsenModel} model - bunsen model
 * @param {BunsenView} view - bunsen view
 * @returns {Object} - normalized state (contains model and view)
 */
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
