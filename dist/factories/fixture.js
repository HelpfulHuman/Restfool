'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runNestedFunctions = runNestedFunctions;
exports.makeRow = makeRow;
exports.factory = factory;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/**
 * Runs over an object and replaces any functional values
 * with their results.
 *
 * @param  {Object} obj
 * @return {Object}
 */
function runNestedFunctions(obj) {
  return _lodash2.default.mapValues(obj, function (val) {
    switch (typeof val === 'undefined' ? 'undefined' : _typeof(val)) {
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
function makeRow(schema, modifier) {
  if (typeof modifier === 'function') {
    return modifier(schema);
  }

  return _lodash2.default.merge(schema, modifier);
}

/**
 * Returns a fixture object using the given schema or factory function.
 *
 * @param  {Object} schema
 * @return {Object}
 */
function factory(schema) {
  if (!Array.isArray(schema) && (typeof schema === 'undefined' ? 'undefined' : _typeof(schema)) === 'object') {
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

    make: function make(count, modifier) {
      var records = [];
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
    makeOne: function makeOne(modifier) {
      return makeRow(schema(), modifier);
    }
  };
}