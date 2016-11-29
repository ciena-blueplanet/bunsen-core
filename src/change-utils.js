import _ from 'lodash'

/**
 * Traverses the object only calling iteratee on the leaf
 * @param {Object} object - object to traverse
 * @param {Object} iteratee - callback which gets passed an object with `path` and `value`
 */
export function traverseObjectLeaf (object, iteratee) {
  let stack = [{value: object, path: ''}]

  // iterative depth-first traversal
  while (stack.length > 0) {
    let node = stack.pop()

    if (_.isObject(node.value) && !_.isEmpty(node.value)) {
      Object.keys(node.value).forEach((property) => {
        const value = node.value[property]
        stack.push({
          value,
          path: `${node.path}.${property}`
        })
      })
    } else if (Array.isArray(node.value) && node.value.length > 0) {
      node.value.forEach((item, index) => {
        stack.push({
          value: item,
          path: `${node.path}.${index}`,
          type: _.isObject(item) ? 'object' : (Array.isArray(item) ? 'array' : 'value')
        })
      })
    } else if (node.path) {
      // will remove the leading .
      node.path = node.path.replace(/^\./, '')
      iteratee(node)
    }
  }
}

/**
 * Outputs map of bunsenIds that have changed. Each property is either a set or unset.
 *
 * Algorithm Explaination:
 *
 * This algorithm diffs an object value from it's previous value. Normally, tree-diffing algorithms
 * has a time complexity that is O(n^3), at least in the general case. The objects we diff have a
 * very specific schema allowing us to consider the path to any value to be unique and we're not
 * concerned with nodes in this tree being arbitrarily reassigned to other branches, meaning it's
 * enough to know that leaf values have changed.
 *
 * Since we can consider the paths to each value to be unique, we can use those ids to create a lookup
 * table. Comparing two maps for (added/updated/deleted) values is trivial and results in a solution
 * that is O(n).
 * @param {Object} oldValue - the old value
 * @param {Object} newValue - the new value
 * @returns {ChangeSet} the change set of oldValue -> newValue
 */
export function getChangeSet (oldValue, newValue) {
  let changeSet = new Map()

  // create lookup table of old value
  traverseObjectLeaf(oldValue, (node) => {
    changeSet.set(node.path, {
      value: node.value,
      type: 'unset'
    })
  })

  // using the lookup table of the old value, reconcile the differences
  traverseObjectLeaf(newValue, (node) => {
    let old = changeSet.get(node.path)

    if (old && _.isEqual(old.value, node.value)) {
      changeSet.delete(node.path)
    } else {
      changeSet.set(node.path, {
        value: node.value,
        type: 'set'
      })
    }
  })

  return changeSet
}

/**
 * Computes the differences between oldValue and newValue
 * @param {Object} oldValue old form value
 * @param {Object} newValue new form value
 * @returns {Object} an object with the patch contents
 */
export function computePatch (oldValue, newValue) {
  const changeSets = getChangeSet(oldValue, newValue)
  const diff = {}
  // tests array indexes in the path and capture the path leading up to
  // but not including the index
  const indexRegex = /^(\D*)\.\d+|^\d+\./

  changeSets.forEach((changeSet, pathId) => {
    if (changeSet.type === 'set') {
      // need to apply the updated array value instead of patching the array contents
      // since patching arrays don't make sense
      const matches = pathId.match(indexRegex)
      if (matches) {
        const arrayAnc = matches[1] || ''
        _.set(diff, arrayAnc, _.cloneDeep(_.get(newValue, arrayAnc)))
      } else {
        _.set(diff, pathId, changeSet.value)
      }
    }
  })

  return diff
}
