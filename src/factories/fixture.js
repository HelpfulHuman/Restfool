import _ from 'lodash';

/**
 * Runs over an object and replaces any functional values
 * with their results.
 *
 * @param  {Object} obj
 * @return {Object}
 */
export function runNestedFunctions (obj) {
  return _.mapValues(obj, function (val) {
    switch (typeof val) {
      case 'function':
        return val();
      case 'object':
        return runNestedFunctions(val);
      default:
        return val;
    }
  });
}

/**
 * Processes a single row and returns the value.
 *
 * @param  {Object} schema
 * @param  {Function} modifier
 * @return {Object}
 */
export function makeRow (schema, modifier) {
  if (typeof modifier === 'function') {
    return modifier(schema);
  }

  return _.merge(schema, modifier);
}

/**
 * Returns a fixture object using the given schema or factory function.
 *
 * @param  {Object} schema
 * @return {Object}
 */
export function factory (schema) {
  if ( ! Array.isArray(schema) && typeof schema === 'object') {
    schema = runNestedFunctions.bind(null, schema);
  }

  if (typeof schema !== 'function') {
    throw new Error('You must pass either an object or a function!');
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
      let records = [];
      for (var i = 0; i < count; i++) {
        var record = makeRow(schema(), modifier);
        if (record) records.push(record);
      }

      return records;
    },

    /**
     * Returns a single fixture record.
     *
     * @param  {Object} modifier
     * @return {Object}
     */
    makeOne (modifier) {
      return makeRow(schema(), modifier);
    }

  }
}
