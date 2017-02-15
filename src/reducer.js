import _ from 'lodash'
import immutable from 'seamless-immutable'
import {CHANGE_VALUE, VALIDATION_RESOLVED, CHANGE_MODEL, CHANGE_VIEW} from './actions'
import evaluateConditions from './evaluate-conditions'
import evaluateViewConditions from './view-conditions'
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
  baseView: null,
  valueChangeSet: null
}

function isArrayItem (segment) {
  return /^\d+$/.test(segment)
}

function subModel (model, modelPath) {
  if (modelPath.length <= 0) {
    return model
  }
  const pathSeg = modelPath.pop()
  if (isArrayItem(pathSeg)) {
    return subModel(model.items, modelPath)
  }
  return subModel(model.properties[pathSeg], modelPath)
}

function isRequired (model, id) {
  if (id === null) {
    return false
  }
  const modelPath = id.split('.')
  const lastSegment = modelPath.pop()
  modelPath.reverse()
  const parentModel = subModel(model, modelPath)
  return _.includes(parentModel.required, lastSegment)
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

/* eslint-disable complexity */
/**
 * We want to go through a state.value object and pull out any references to null
 * @param {Object} value - our current value POJO
 * @param {Object} model Schema for the given value
 * @returns {Object} a value cleaned of any `null`s
 */
function recursiveClean (value, model) {
  let output = Array.isArray(value) ? [] : {}
  _.forEach(value, (subValue, key) => {
    const notEmpty = !_.isEmpty(subValue)
    if (Array.isArray(subValue) && (notEmpty || _.includes(_.get(model, 'required'), key))) {
      output[key] = recursiveClean(subValue, _.get(model, 'items'))
    } else if (_.isObject(subValue) && (notEmpty || _.includes(_.get(model, 'required'), key))) {
      output[key] = recursiveClean(subValue, _.get(model, 'properties.' + key))
    } else if (notEmpty || _.isNumber(subValue) || typeof subValue === 'boolean' || subValue instanceof Boolean) {
      output[key] = subValue
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
    if (state) {
      let initialValue = state.value || {}
      if (state.baseModel) {
        state.baseModel = getDereferencedModelSchema(state.baseModel)
        state.model = evaluateConditions(_.cloneDeep(state.baseModel), recursiveClean(initialValue, state.baseModel))
        // leave this undefined to force consumers to go through the proper CHANGE_VALUE channel
        // for value changes
        state.value = undefined
      }
      if (state.view && !state.baseView) {
        state.baseView = state.view
      }
      if (state.baseView) {
        state.view = evaluateViewConditions(state.baseView, initialValue)
      }
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
   * Update the bunsen model
   * @param {State} state - state to update
   * @param {Action} action - action
   * @returns {State} - updated state
   */
  [CHANGE_VIEW]: function (state, action) {
    return _.defaults({
      baseView: action.view,
      lastAction: CHANGE_VIEW,
      view: evaluateViewConditions(action.view, state.value)
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
      newValue = immutableOnce(recursiveClean(value, state.model))
    } else {
      newValue = immutableOnce(state.value)
      const segments = bunsenId.split('.')
      const lastSegment = segments.pop()

      if (isArrayItem(lastSegment)) {
        valueChangeSet.set(bunsenId, {
          value,
          type: 'set'
        })
        newValue = set(newValue, bunsenId, value)
      } else if (_.includes([null, ''], value) ||
        (Array.isArray(value) && value.length === 0 && !isRequired(state.model, bunsenId))
      ) {
        valueChangeSet.set(bunsenId, {
          value,
          type: 'unset'
        })
        newValue = unset(newValue, bunsenId)
      } else if (!_.isEqual(value, _.get(newValue, bunsenId))) {
        valueChangeSet.set(bunsenId, {
          value,
          type: 'set'
        })
        newValue = set(newValue, bunsenId, value)
      }
    }

    const newState = {
      value: newValue,
      valueChangeSet,
      lastAction: CHANGE_VALUE
    }

    let model = state.model || state.baseModel
    if (valueChangeSet.size > 0) {
      const newModel = evaluateConditions(_.cloneDeep(state.baseModel), newValue)
      model = _.isEqual(state.model, newModel) ? state.model : newModel
      if (state.baseView) {
        const newView = evaluateViewConditions(state.baseView, newValue)
        const view = _.isEqual(state.view, newView) ? state.view : newView
        newState.view = view
      }
    }
    newState.model = model

    return _.defaults(newState, state)
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
/* eslint-enable complexity */

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
