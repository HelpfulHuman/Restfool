'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

/**
 * Runs over an object and replaces any functional values
 * with their results.
 *
 * @param  {Object} obj
 * @return {Object}
 */
function runNestedFunctions(obj) {
  return _lodash2['default'].mapValues(obj, function (val) {
    switch (typeof val) {
      case 'function':
        return val();
      case 'object':
        return runNestedFunctions(obj);
      default:
        return val;
    }
  });
}

exports['default'] = {
  runNestedFunctions: runNestedFunctions
};
module.exports = exports['default'];