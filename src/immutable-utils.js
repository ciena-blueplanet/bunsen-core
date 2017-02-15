import _ from 'lodash'
import immutable from 'seamless-immutable'

function unsetArray (obj, path, segments) {
  const key = segments.splice(0, 1)
  const index = parseInt(key)

  if (segments.length === 0) {
    return obj.slice(0, index).concat(obj.slice(index + 1))
  }

  const newValue = unset(obj[index], segments.join('.'))

  // NOTE: concatenating the newValue in an array to preserve multi-dimensional arrays
  return obj.slice(0, index).concat([newValue]).concat(obj.slice(index + 1))
}

function unsetObject (obj, path, segments) {
  const key = segments.splice(0, 1)

  if (segments.length === 0) {
    return obj.without(key)
  }

  const newValue = unset(obj[key], segments.join('.'))
  return obj.set(key, newValue)
}

/* eslint-disable complexity */
export function set (item, path, value) {
  const segments = path.split('.')
  const segment = segments.shift()
  const segmentIsArrayIndex = /^\d+$/.test(segment)

  if (segmentIsArrayIndex) {
    item = item || []
    const index = parseInt(segment)

    for (let i = 0; i < index + 1; i++) {
      if (item.length < (i + 1)) {
        item.concat(null)
      }
    }

    const newValue = segments.length > 0 ? set(item[index], segments.join('.'), value) : value

    // Return immutable array with item at index updated
    // NOTE: concatenating the newValue in an array to preserve multi-dimensional arrays
    return item.slice(0, index).concat([newValue]).concat(item.slice(index + 1))
  }

  const object = item || immutable({})
  const newValue = segments.length > 0 ? set(object[segment], segments.join('.'), value) : value

  return object.set(segment, newValue)
}
/* eslint-enable complexity */

/**
 * Unset value in an object given a path to the key to unset
 * @param {Immutable} obj - object to unset path within
 * @param {String} path - path to value to unset
 * @returns {Immutable} new value with path unset
 */
export function unset (obj, path) {
  const segments = path.split('.')

  if (Array.isArray(obj)) {
    return unsetArray(obj, path, segments)
  }

  if (_.isObject(obj)) {
    return unsetObject(obj, path, segments)
  }

  // NOTE: explicitly checking for null because "typeof null === 'object'" which is misleading
  const type = obj === null ? 'null' : typeof obj

  throw new Error(`A path can only be unset for objects and arrays not ${type}`)
}
