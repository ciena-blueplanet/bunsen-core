/* global File */
import _ from 'lodash'
import immutable from 'seamless-immutable'

import {
  CHANGE,
  CHANGE_MODEL,
  CHANGE_VALUE,
  CHANGE_VIEW,
  IS_VALIDATING,
  IS_VALIDATING_FIELD,
  VALIDATION_RESOLVED
} from './actions'
import {getChangeSet} from './change-utils'
import {dereference} from './dereference'
import evaluateConditions from './evaluate-conditions'
import {set, unset} from './immutable-utils'
import normalizeModelAndView from './normalize-model-and-view'
import evaluateValue from './value-utils'
import evaluateViewConditions from './view-conditions'

const INITIAL_VALUE = {
  lastAction: null,
  errors: {},
  fieldErrors: {},
  validatingFields: {},
  validationResult: {warnings: [], errors: []},
  fieldValidationResult: {warnings: [], errors: []},
  value: null,
  model: {}, // Model calculated by the reducer
  baseModel: {}, // Original model recieved,
  baseView: null,
  valueChangeSet: null
}

function isArrayItem (segment) {
  return /^\d+$/.test(segment)
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
    const notEmpty = !_.isEmpty(subValue) ||
      _.isNumber(subValue) ||
      typeof subValue === 'boolean' ||
      subValue instanceof Boolean ||
      subValue instanceof File

    let subModel

    // arrays have their model props nested further than objects
    if (Array.isArray(subValue)) {
      subModel = _.get(model, `properties.${key}.items`)
    // if we are iterating through an array
    // all of the items will need the current model
    } else if (isValueArray) {
      subModel = model
    // normal object props are nested in properties under the key name
    } else {
      subModel = _.get(model, `properties.${key}`)
    }

    let autoClean = _.get(subModel, 'autoClean')

    // recur on objects and arrays that are not files or not empty if autoClean is not strictly false
    if ((typeof subValue === 'object') && !(subValue instanceof File) && autoClean !== false && notEmpty) {
      output[key] = recursiveClean(subValue, subModel)
    // set normal values
    } else if (notEmpty || autoClean === false) {
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
/* eslint-disable complexity */
function changeNestedFormValue ({bunsenId, formValue, model, value}) {
  const segments = bunsenId.split('.')
  const lastSegment = segments.pop()
  const isEmpty = _.isEmpty(value) && (Array.isArray(value) || _.isObject(value)) && !(value instanceof File)

  // Make sure form value is immutable
  formValue = immutableOnce(formValue)

  if (isArrayItem(lastSegment)) {
    return setProperty({bunsenId, formValue, value})
  }

  if (_.includes([null, undefined, ''], value) || isEmpty) {
    return unsetProperty({bunsenId, formValue, value})
  }

  if (!_.isEqual(value, _.get(formValue, bunsenId))) {
    return setProperty({bunsenId, formValue, value})
  }

  return {
    value: formValue,
    valueChangeSet: new Map()
  }
}
/* eslint-enable complexity */

/**
 * Set a specific propertry in the form
 * @param {String} bunsenId - path to property to set
 * @param {Object} formValue - current form value
 * @param {*} value - value to set property to
 * @returns {Object} object containing new form value and changeset
 */
function setProperty ({bunsenId, formValue, value}) {
  const valueChangeSet = new Map()

  valueChangeSet.set(bunsenId, {
    value,
    type: 'set'
  })

  return {
    value: set(formValue, bunsenId, value),
    valueChangeSet
  }
}

/**
 * Unset a specific property in the form
 * @param {String} bunsenId - path to property to unset
 * @param {Object} formValue - current form value
 * @param {*} value - property value that triggered unset
 * @returns {Object} object containing new form value and changeset
 */
function unsetProperty ({bunsenId, formValue, value}) {
  const valueChangeSet = new Map()

  valueChangeSet.set(bunsenId, {
    value,
    type: 'unset'
  })

  return {
    value: unset(formValue, bunsenId),
    valueChangeSet
  }
}

export const actionReducers = {
  /* eslint-disable complexity */
  '@@redux/INIT': function (state, action) {
    if (state) {
      let initialValue = state.value || {}
      if (state.baseModel) {
        initialValue = recursiveClean(initialValue, state.baseModel)
        state.baseModel = getDereferencedModelSchema(state.baseModel)
        state.model = evaluateConditions(state.baseModel, initialValue, undefined, initialValue)
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
    newState.unnormalizedModel = getDereferencedModelSchema(action.model)

    // If we have an unnormalized view then we need to update our model to make
    // sure any model extensions defined in the view get applied
    if (state.unnormalizedView) {
      const normalized = normalizeModelAndView({
        model: newState.unnormalizedModel,
        view: state.unnormalizedView
      })
      newState.baseModel = normalized.model
      newState.baseView = normalized.view
      newState.view = evaluateViewConditions(newState.baseView, state.value)
    } else {
      newState.baseModel = newState.unnormalizedModel
    }

    // Evaluate and remove model conditions so consumers don't have to parse conditions
    newState.model = evaluateConditions(newState.baseModel, state.value, undefined, state.value)

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
    let normalized
    let view
    if (state.unnormalizedModel) {
      normalized = normalizeModelAndView({
        model: state.unnormalizedModel,
        view: action.view
      })

      view = evaluateViewConditions(normalized.view, state.value)
    } else {
      view = evaluateViewConditions(state.baseView, state.value)
      normalized = {
        view,
        model: state.model
      }
    }

    const newState = {
      baseView: normalized.view,
      lastAction: CHANGE_VIEW,
      unnormalizedView: action.view,
      view
    }

    if (!_.isEqual(state.baseModel, normalized.model)) {
      Object.assign(newState, {
        baseModel: normalized.model,
        model: evaluateConditions(normalized.model, state.value, undefined, state.value)
      })
    }

    return _.defaults(newState, state)
  },

  [CHANGE]: function (state, action) {
    let newState = state

    if (action.value) {
      newState = actionReducers[CHANGE_VALUE](newState, action)
    }

    if (action.model) {
      newState = actionReducers[CHANGE_MODEL](newState, action)
    }

    if (action.view) {
      newState = actionReducers[CHANGE_VIEW](newState, action)
    }

    newState.lastAction = CHANGE
    return newState
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
      const newModel = evaluateConditions(state.baseModel, newState.value, undefined, newState.value)
      newState.model = _.isEqual(state.model, newModel) ? state.model : newModel

      if (state.baseView) {
        const newView = evaluateViewConditions(state.baseView, newState.value)
        const newValue = evaluateValue(state.baseView, newView, newState.value)
        newState.view = _.isEqual(state.view, newView) ? state.view : newView

        newState.value = newValue
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
      fieldErrors: action.fieldErrors,
      lastAction: VALIDATION_RESOLVED,
      validationResult: action.validationResult,
      fieldValidationResult: action.fieldValidationResult
    }, state)
  },

    /**
   * Update is validating result
   * @param {State} state - state to update
   * @param {Action} action - action
   * @returns {State} - updated state
   */
  [IS_VALIDATING]: function (state, action) {
    return _.defaults({
      isValidating: action.isValidating,
      lastAction: IS_VALIDATING
    }, state)
  },

  [IS_VALIDATING_FIELD]: function (state, action) {
    let {validatingFields = {}} = state
    let newValidatingFields
    // Currently validating the field
    if (action.validating === true) {
      newValidatingFields = _.defaults({
        [action.field]: true
      }, validatingFields)
    } else {
      newValidatingFields = _.omit(validatingFields, [action.field])
    }
    return _.defaults({
      validatingFields: newValidatingFields
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
