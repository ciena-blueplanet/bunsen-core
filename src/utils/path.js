import _ from 'lodash'

/* eslint-disable complexity */
/**
 * Find how many path elements we have to go back in order to find the absolute path
 *
 * @param {string[]} path Array of path elements. THIS ARRAY IS MUTATED BY THE FUNCTION
 * @param {number} [index=0] How many elements we've already gone back
 * @returns {number} How many elements back we need go
 */
function findRelativePath (path, index = 0) {
  let nextInPath = _.last(path)

  if (nextInPath === '') { // . for sibling
    if (index <= 0) {
      index += 1
    }
    path.pop()
    if (_.last(path) === '') { // .. for sibling of parent
      path.pop()
      nextInPath = path.pop().replace('/', '')// get rid of leading slash
      if (nextInPath === '') {
        return findRelativePath(path, index + 1)
      }
      path.push(nextInPath)
      return index + 1
    } else {
      nextInPath = path.pop().replace('/', '')// get rid of leading slash
      if (nextInPath === '') {
        return findRelativePath(path, index)
      }
      path.push(nextInPath)
      return index
    }
  }
}
/* eslint-enable complexity */

/**
 * Class to wrap value objects to find values based on relative and absolute paths
 *
 * @class ValueWrapper
 */
export class ValueWrapper {
  static pathAsArray (path) {
    if (!Array.isArray(path)) {
      return path.split('.')
    }
    return path
  }

  constructor (value, curPath) {
    this.value = value
    this.path = ValueWrapper.pathAsArray(curPath)
  }

  /**
   * Get the value at an absolute or relative path. Paths with a leading './' or '../' are treated as relative,
   * and others are treated as absolute.
   *
   * Relative paths are relative to a stored path. To add to the path use the pushPath method.
   *
   * @param {string | string[]} path Path to the desired value.
   * @returns {any} Value at the given path.
   *
   * @memberOf ValueWrapper
   */
  get (path) {
    let absolutePath
    if (path === undefined) {
      if (this.path.length <= 0) {
        return this.value
      }
      return _.get(this.value, this.path.join('.'))
    }
    path = ValueWrapper.pathAsArray(path)

    let nextInPath = _.first(path)

    if (nextInPath === '') {
      let index = findRelativePath(path.reverse())
      absolutePath = this.path.slice(0, this.path.length - index).concat(path)
    } else {
      absolutePath = path
    }

    return _.get(this.value, absolutePath.join('.'))
  }

  /**
   * Creates another value wrapper with a relative path
   *
   * @param {string | string[]} path Element(s) to add to the currently stored path
   * @returns {ValueWrapper} A value wrapper with the new path elements
   *
   * @memberOf ValueWrapper
   */
  pushPath (path) {
    if (path === undefined) {
      return this
    }
    path = ValueWrapper.pathAsArray(path)
    return new ValueWrapper(this.value, this.path.concat(path))
  }
}
