import _ from 'lodash'
import immutable from 'seamless-immutable'
import {CHANGE_VALUE, VALIDATION_RESOLVED, CHANGE_MODEL} from './actions'
import evaluateConditions from './evaluate-conditions'
import {set, unset} from './immutable-utils'
import {traverseObject} from './utils'

const INITIAL_VALUE = {
  errors: {},
  validationResult: {warnings: [], errors: []},
  value: null,
  model: {}, // Model calculated by the reducer
  baseModel: {} // Original model recieved
}

export function initialState (state) {
  return _.defaults(state, INITIAL_VALUE)
}

function immutableOnce (object) {
  let immutableObject = object
  if (object.__immutable_invariants_hold === undefined) {
    immutableObject = immutable(object)
  }
  return immutableObject
}

/**
 * We want to go through a state.value object and pull out any references to null
 * @param {Object} value - our current value POJO
 * @returns {Object} a value cleaned of any `null`s
 */
function recursiveClean (value) {
  let output = {}
  if (Array.isArray(value)) {
    output = []
  }
  _.forEach(value, (subValue, key) => {
    if (!_.isEmpty(subValue) || _.isNumber(subValue) || typeof subValue === 'boolean' || subValue instanceof Boolean) {
      if (_.isObject(subValue) || Array.isArray(subValue)) {
        output[key] = recursiveClean(subValue)
      } else {
        output[key] = subValue
      }
    }
  })
  return output
}

export const actionReducers = {
  '@@redux/INIT': function (state, action) {
    if (state && state.baseModel) {
      let initialValue = state.value || {}
      state.model = evaluateConditions(state.baseModel, recursiveClean(initialValue))
      // leave this undefined to force consumers to go through the proper CHANGE_VALUE channel
      // for value changes
      state.value = undefined
    }

    const newState = initialState(state || {})
    newState.value = immutable(newState.value)
    return newState
  },

  /**
   * Update the bunsen model
   * @param {State} state - state to update
   * @param {Action} action - action
   * @returns {State} - updated state
   */
  [CHANGE_MODEL]: function (state, action) {
    return _.defaults({
      baseModel: action.model,
      model: evaluateConditions(action.model, state.value)
    }, state)
  },

  /**
   * Update the bunsen value
   * @param {State} state - state to update
   * @param {Action} action - action
   * @returns {State} - updated state
   */
  [CHANGE_VALUE]: function (state, action) {
    const {value, bunsenId} = action
    let newValue
    let changeSet = new Map()

    if (bunsenId === null) {
      changeSet = getChangeSet(state.value, value)
      newValue = immutableOnce(recursiveClean(value))
    } else {
      newValue = immutableOnce(state.value)

      if (_.includes([null, ''], value) || (Array.isArray(value) && value.length === 0)) {
        changeSet.set(bunsenId, {
          value,
          type: 'unset'
        })
        newValue = unset(newValue, bunsenId)
      } else {
        if (!_.isEqual(value, _.get(newValue, bunsenId))) {
          changeSet.set(bunsenId, {
            value,
            type: 'set'
          })
          newValue = set(newValue, bunsenId, value)
        }
      }
    }

    let model
    if (changeSet.size > 0) {
      const newModel = evaluateConditions(state.baseModel, newValue)
      if (!_.isEqual(state.model, newModel)) {
        model = newModel
      } else {
        model = state.model
      }
    }

    return _.defaults({
      value: newValue,
      changeSet,
      model
    }, state)
  },

  /**
   * Update validation results
   * @param {State} state - state to update
   * @param {Action} action - action
   * @returns {State} - updated state
   */
  [VALIDATION_RESOLVED]: function (state, action) {
    return _.defaults({
      validationResult: action.validationResult,
      errors: action.errors
    }, state)
  }
}

/**
 * Outputs hashmap of bunsenIds that have changed. Each property is either a set or unset.
 * @param {Object} oldValue - the old value
 * @param {Object} newValue - the new value
 * @returns {ChangeSet} the change set of oldValue -> newValue
 */
export function getChangeSet (oldValue, newValue) {
  let changeSet = new Map()

  const a = performance.now()
  traverseObject(oldValue, (node) => {
    changeSet.set(node.path, {
      value: node.value,
      type: 'unset'
    })
  })

  traverseObject(newValue, (node) => {
    let old = changeSet[node.path]

    if (old && _.isEqual(old.value, node.value)) {
      changeSet.delete(node.path)
    } else {
      changeSet.set(node.path, {
        value: node.value,
        type: 'set'
      })
    }
  })

  const b = performance.now()

  console.log('getChangeSet: ' + (b - a))
  return changeSet
}

/**
 * Update the state
 * @param {State} state - state to update
 * @param {Action} action - action
 * @returns {State} - updated state
 */
export function reducer (state, action) {
  if (action.type in actionReducers) {
    const actionReducer = actionReducers[action.type]
    return actionReducer(state, action)
  }

  // TODO: allow consumer to pass in logger class other than console
  console.error(`Do not recognize action ${action.type}`)

  return state
}

export default reducer
