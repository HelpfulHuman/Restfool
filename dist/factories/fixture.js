'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

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

  return _lodash2['default'].merge(schema, modifier);
}

/**
 * Returns a fixture object using the given schema or factory function.
 *
 * @param  {Object} schema
 * @return {Object}
 */

exports['default'] = function (schema) {
  if (typeof schema === 'object') {
    schema = _utils2['default'].runNestedFunctions.bind(null, schema);
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
      var _arr = [];
      for (var i = 0; i < count; i++) {
        var record = makeRow(schema(), modifier);
        if (record) _arr.push(record);
      }

      return _arr;
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
};

module.exports = exports['default'];