import _ from 'lodash'
import immutable from 'seamless-immutable'
import {CHANGE_VALUE, VALIDATION_RESOLVED, CHANGE_MODEL} from './actions'
import evaluateConditions from './evaluate-conditions'
import {set, unset} from './immutable-utils'
import {dereference} from './dereference'
import {getChangeSet} from './change-utils'

const INITIAL_VALUE = {
  lastAction: null,
  errors: {},
  validationResult: {warnings: [], errors: []},
  value: null,
  model: {}, // Model calculated by the reducer
  baseModel: {}, // Original model recieved,
  valueChangeSet: null
}

export function initialState (state) {
  return _.defaults(state, INITIAL_VALUE)
}

function immutableOnce (object) {
  if (object === null || object === undefined) {
    return immutable({})
  }

  let immutableObject = object
  if (object.asMutable === undefined) {
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

function getDereferencedModelSchema (model) {
  let dereferencedModel = dereference(model).schema

  delete dereferencedModel.definitions
  return dereferencedModel
}

export const actionReducers = {
  '@@redux/INIT': function (state, action) {
    if (state && state.baseModel) {
      let initialValue = state.value || {}
      state.baseModel = getDereferencedModelSchema(state.baseModel)
      state.model = evaluateConditions(_.cloneDeep(state.baseModel), recursiveClean(initialValue))
      // leave this undefined to force consumers to go through the proper CHANGE_VALUE channel
      // for value changes
      state.value = undefined
    }

    const newState = initialState(state || {})
    newState.lastAction = 'INIT'
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
    const model = getDereferencedModelSchema(action.model)
    return _.defaults({
      baseModel: model,
      lastAction: CHANGE_MODEL,
      model: evaluateConditions(_.cloneDeep(model), state.value)
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
    let valueChangeSet = new Map()

    if (bunsenId === null) {
      valueChangeSet = getChangeSet(state.value, value)
      newValue = immutableOnce(recursiveClean(value))
    } else {
      newValue = immutableOnce(state.value)
      const segments = bunsenId.split('.')
      const lastSegment = segments.pop()
      const isArrayItem = /^\d+$/.test(lastSegment)

      if (isArrayItem) {
        const parentPath = segments.join('.')
        const parentObject = _.get(newValue, parentPath)

        if (parentObject && _.includes([null, ''], value)) {
          valueChangeSet.set(bunsenId, {
            value,
            type: 'unset'
          })
          newValue = unset(newValue, bunsenId)
        } else {
          valueChangeSet.set(bunsenId, {
            value,
            type: 'set'
          })
          newValue = set(newValue, bunsenId, value)
        }
      } else if (_.includes([null, ''], value) || (Array.isArray(value) && value.length === 0)) {
        valueChangeSet.set(bunsenId, {
          value,
          type: 'unset'
        })
        newValue = unset(newValue, bunsenId)
      } else {
        if (!_.isEqual(value, _.get(newValue, bunsenId))) {
          valueChangeSet.set(bunsenId, {
            value,
            type: 'set'
          })
          newValue = set(newValue, bunsenId, value)
        }
      }
    }

    let model = state.model || state.baseModel
    if (valueChangeSet.size > 0) {
      const newModel = evaluateConditions(_.cloneDeep(state.baseModel), newValue)
      if (!_.isEqual(state.model, newModel)) {
        model = newModel
      } else {
        model = state.model
      }
    }

    return _.defaults({
      value: newValue,
      valueChangeSet,
      model,
      lastAction: CHANGE_VALUE
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
      errors: action.errors,
      lastAction: VALIDATION_RESOLVED,
      validationResult: action.validationResult
    }, state)
  }
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
