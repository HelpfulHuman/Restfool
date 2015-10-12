import _ from 'lodash'
import utils from '../utils'

/**
 * Processes a single row and returns the value.
 *
 * @param  {Object} schema
 * @param  {Function} modifier
 * @return {Object}
 */
function makeRow (schema, modifier) {
  if (typeof modifier === 'function') {
    return modifier(schema)
  }

  return _.merge(schema, modifier)
}

/**
 * Returns a fixture object using the given schema or factory function.
 *
 * @param  {Object} schema
 * @return {Object}
 */
export default function (schema) {
  if (typeof schema === 'object') {
    schema = utils.runNestedFunctions.bind(null, schema)
  }

  if (typeof schema !== 'function') {
    throw new Error('You must pass either an object or a function!')
  }

  return {

    /**
     * Returns the requested number of fixture records.
     *
     * @param  {Number} count
     * @param  {Object} modifier
     * @return {Array}
     */
    make (count, modifier) {
      var _arr = []
      for (var i = 0; i < count; i++) {
        var record = makeRow(schema(), modifier)
        if (record) _arr.push(record)
      }

      return _arr
    },

    /**
     * Returns a single fixture record.
     *
     * @param  {Object} modifier
     * @return {Object}
     */
    makeOne (modifier) {
      return makeRow(schema(), modifier)
    }

  }
}
