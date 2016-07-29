import _ from 'lodash'
import immutable from 'seamless-immutable'
import {CHANGE_VALUE, VALIDATION_RESOLVED, CHANGE_MODEL} from './actions'
import evaluateConditions from './evaluate-conditions'

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

/**
 * We want to go through a state.value object and pull out any references to null
 * @param {Object} value - our current value POJO
 * @returns {Object} a value cleaned of any `null`s
 */
function recursiveClean (value) {
  let output = {}
  if (_.isArray(value)) {
    output = []
  }
  _.each(value, (subValue, key) => {
    if (!_.isEmpty(subValue) || _.isNumber(subValue) || _.isBoolean(subValue)) {
      if (_.isObject(subValue) || _.isArray(subValue)) {
        output[key] = recursiveClean(subValue)
      } else {
        output[key] = subValue
      }
    }
  })
  return output
}

export function reducer (state, action) {
  // state = immutable(state)

  switch (action.type) {
    case CHANGE_VALUE:
      const {value, bunsenId} = action
      let newValue

      if (bunsenId === null) {
        newValue = immutable(recursiveClean(value))
      } else {
        // Ensure immutable object
        if (!('setIn' in state.value)) {
          state.value = immutable(state.value)
        }

        if (_.includes([null, ''], value) || (_.isArray(value) && value.length === 0)) {
          newValue = state.value.without(bunsenId.split('.'))
        } else {
          newValue = state.value.setIn(bunsenId.split('.'), value)
        }
      }
      const newModel = evaluateConditions(state.baseModel, newValue)
      let model
      if (!_.isEqual(state.model, newModel)) {
        model = newModel
      } else {
        model = state.model
      }

      return _.defaults({
        value: immutable(newValue),
        model
      }, state)

    case VALIDATION_RESOLVED:
      return _.defaults({
        validationResult: action.validationResult,
        errors: action.errors
      }, state)
    case CHANGE_MODEL:

      return _.defaults({
        baseModel: action.model,
        model: evaluateConditions(action.model, state.value)
      }, state)
    case '@@redux/INIT':
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

    default:
      // TODO: allow consumer to pass in logger class other than console
      console.error(`Do not recognize action ${action.type}`)
  }
  return state
}

export default reducer
