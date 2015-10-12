import _ from 'lodash'

/**
 * Runs over an object and replaces any functional values
 * with their results.
 *
 * @param  {Object} obj
 * @return {Object}
 */
function runNestedFunctions (obj) {
  return _.mapValues(obj, function (val) {
    switch (typeof val) {
      case 'function':
        return val()
      case 'object':
        return runNestedFunctions(obj)
      default:
        return val
    }
  })
}

export default {
  runNestedFunctions
}
