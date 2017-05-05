/* global File */
import _ from 'lodash'
import immutable from 'seamless-immutable'

import {CHANGE_MODEL, CHANGE_VALUE, CHANGE_VIEW, VALIDATION_RESOLVED} from './actions'
import {getChangeSet} from './change-utils'
import {dereference} from './dereference'
import evaluateConditions from './evaluate-conditions'
import {set, unset} from './immutable-utils'
import normalizeModelAndView from './normalize-model-and-view'
import evaluateViewConditions from './view-conditions'

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
  let isValueArray = Array.isArray(value)
  let output = isValueArray ? [] : {}
  let iteratorFn = isValueArray ? _.forEach : _.forIn
  iteratorFn(value, (subValue, key) => {
    const notEmpty = !_.isEmpty(subValue) || subValue instanceof File
    if (Array.isArray(subValue) && (notEmpty || _.includes(_.get(model, 'required'), key))) {
      output[key] = recursiveClean(subValue, _.get(model, 'items'))
    } else if (!(subValue instanceof File) && _.isObject(subValue) &&
      (notEmpty || _.includes(_.get(model, 'required'), key))) {
      output[key] = recursiveClean(subValue, _.get(model, 'properties.' + key))
    } else if (notEmpty || _.isNumber(subValue) || typeof subValue === 'boolean' || subValue instanceof Boolean) {
      output[key] = subValue
    }
  })
  return output
}
/* eslint-enable complexity */

function getDereferencedModelSchema (model) {
  let dereferencedModel = dereference(model).schema

  delete dereferencedModel.definitions
  return dereferencedModel
}

/**
 * Change value of entire form
 * @param {Object} prevValue - previous form value
 * @param {Object} nextValue - next form value
 * @param {BunsenModel} model - model
 * @returns {Object} new state with value and value changeset
 */
function changeEntireFormValue ({model, nextValue, prevValue}) {
  return {
    value: immutableOnce(recursiveClean(nextValue, model)),
    valueChangeSet: getChangeSet(prevValue, nextValue)
  }
}

/**
 * Change value of form at specified path
 * @param {String} bunsenId - path to part of form to change value of
 * @param {Object} formValue - current form value
 * @param {BunsenMOdel} model - model
 * @param {Object} value - new value for path
 * @returns {Object} new state with value and value changeset
 */
function changeNestedFormValue ({bunsenId, formValue, model, value}) {
  const valueChangeSet = new Map()

  let newValue = immutableOnce(formValue)
  const segments = bunsenId.split('.')
  const lastSegment = segments.pop()

  if (isArrayItem(lastSegment)) {
    valueChangeSet.set(bunsenId, {
      value,
      type: 'set'
    })
    newValue = set(newValue, bunsenId, value)
  } else if (_.includes([null, ''], value) ||
    (Array.isArray(value) && value.length === 0 && !isRequired(model, bunsenId))
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

  return {
    value: newValue,
    valueChangeSet
  }
}

export const actionReducers = {
  /* eslint-disable complexity */
  '@@redux/INIT': function (state, action) {
    if (state) {
      let initialValue = state.value || {}
      if (state.baseModel) {
        state.baseModel = getDereferencedModelSchema(state.baseModel)
        state.model = evaluateConditions(state.baseModel, recursiveClean(initialValue, state.baseModel))
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
  /* eslint-enable complexity */

  /**
   * Update the bunsen model
   * @param {State} state - state to update
   * @param {Action} action - action
   * @returns {State} - updated state
   */
  [CHANGE_MODEL]: function (state, action) {
    const newState = {
      lastAction: CHANGE_MODEL
    }

    // Replace $ref's with definitions so consumers don't have to parse references
    newState.baseModel = getDereferencedModelSchema(action.model)

    // If we have an unnormalized view then we need to update our model to make
    // sure any model extensions defined in the view get applied
    if (state.unnormalizedView) {
      newState.baseModel = normalizeModelAndView({
        model: newState.baseModel,
        view: state.unnormalizedView
      }).model
    }

    // Evaluate and remove model conditions so consumers don't have to parse conditions
    newState.model = evaluateConditions(newState.baseModel, state.value)

    return _.defaults(newState, state)
  },

  /**
   * Update the bunsen model
   * @param {State} state - state to update
   * @param {Action} action - action
   * @returns {State} - updated state
   */
  [CHANGE_VIEW]: function (state, action) {
    // Apply coniditions to view cells
    const view = evaluateViewConditions(action.view, state.value)

    const newState = {
      baseView: action.view,
      lastAction: CHANGE_VIEW,
      unnormalizedView: action.unnormalizedView,
      view
    }

    return _.defaults(newState, state)
  },

  /* eslint-disable complexity */
  /**
   * Update the bunsen value
   * @param {State} state - state to update
   * @param {Action} action - action
   * @returns {State} - updated state
   */
  [CHANGE_VALUE]: function (state, action) {
    const {bunsenId, value} = action

    const newState = {
      lastAction: CHANGE_VALUE
    }

    if (bunsenId === null) {
      Object.assign(newState, changeEntireFormValue({
        model: state.model,
        nextValue: value,
        prevValue: state.value
      }))
    } else {
      Object.assign(newState, changeNestedFormValue({
        bunsenId,
        formValue: state.value,
        model: state.model,
        value
      }))
    }

    newState.model = state.model || state.baseModel

    // If the value actually changed then we need to re-compute the model and view
    // so conditionals are correctly applied
    if (newState.valueChangeSet.size > 0) {
      const newModel = evaluateConditions(state.baseModel, newState.value)
      newState.model = _.isEqual(state.model, newModel) ? state.model : newModel

      if (state.baseView) {
        const newView = evaluateViewConditions(state.baseView, newState.value)
        newState.view = _.isEqual(state.view, newView) ? state.view : newView
      }
    }

    return _.defaults(newState, state)
  },
  /* eslint-enable complexity */

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
