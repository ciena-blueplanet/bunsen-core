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

function set (item, path, value) {
  const segments = path.split('.')
  const segment = segments.shift()
  const segmentIsArrayIndex = /^\d+$/.test(segment)

  if (segmentIsArrayIndex) {
    const array = item && 'asMutable' in item ? item.asMutable() : item || []
    const index = parseInt(segment)

    for (let i = 0; i < index + 1; i++) {
      if (array.length < (i + 1)) {
        array.push(null)
      }
    }

    if (segments.length > 0) {
      array[index] = set(array[index], segments.join('.'), value)
    } else {
      array[index] = value
    }

    return immutable(array)
  }

  const object = item && 'asMutable' in item ? item.asMutable() : item || {}

  if (segments.length > 0) {
    object[segment] = set(object[segment], segments.join('.'), value)
  } else {
    object[segment] = value
  }

  return immutable(object)
}

function unset (obj, path) {
  const segments = path.split('.')
  const lastSegment = segments.pop()
  const relativePath = segments.join('.')
  let relativeItem = _.get(obj, relativePath)

  if (_.isArray(relativeItem)) {
    relativeItem = relativeItem.asMutable()
    relativeItem.splice(parseInt(lastSegment), 1)
  } else {
    relativeItem = relativeItem.without(lastSegment)
  }

  return set(obj, relativePath, relativeItem)
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
  switch (action.type) {
    case CHANGE_VALUE:
      const {value, bunsenId} = action
      let newValue

      if (bunsenId === null) {
        newValue = immutable(recursiveClean(value))
      } else {
        newValue = 'asMutable' in state.value ? state.value : immutable(state.value)

        if (_.includes([null, ''], value) || (_.isArray(value) && value.length === 0)) {
          newValue = unset(newValue, bunsenId)
        } else {
          newValue = set(newValue, bunsenId, value)
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
