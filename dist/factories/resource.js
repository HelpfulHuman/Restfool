'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

/**
 * The default options for a resource.
 *
 * @var {Object}
 */
var defaultOptions = {

  seed: [],

  format: function format(data) {
    return data;
  },

  onCreate: function onCreate(data, index) {
    data.id = index + 1;

    return data;
  },

  onUpdate: function onUpdate(data, index) {
    return data;
  },

  onSave: function onSave(data, index) {
    return data;
  },

  onDelete: function onDelete(data, index) {
    return false;
  }

};

/**
 * Creates a complete set of RESTful routes.
 *
 * @param  {Object} options
 * @return {Object}
 */

exports['default'] = function (options) {
  // throw an error if no resource is defined
  if (!options.name) {
    throw new Error('You must define a name for a resource!');
  }

  options = _lodash2['default'].merge(defaultOptions, options);
  var routes = new _express2['default'].Router();
  var _rows = Array.isArray(options.seed) ? options.seed : [];
  var name = options.name;

  routes.route('/' + name).get(function (req, res, next) {
    res.send(options.format(_rows));
  }).post(function (req, res, next) {
    var index = _rows.length;
    var row = options.onSave(options.onCreate(req.body, index), index);
    _rows.push(row);

    res.send(options.format(row));
  });

  /**
   * Returns a specific resource if it exists.
   */
  routes.param(name, function (req, res, next) {
    var rowIndex = _lodash2['default'].findIndex(_rows, 'id', req.params[name]);
    if (!rowIndex) return res.send(404);
    req.rowIndex = rowIndex;
    req.row = _rows[rowIndex];
    next();
  });

  routes.route('/' + name + '/:' + name).get(function (req, res, next) {
    res.send(options.format(req.row));
  }).put(function (req, res, next) {
    var row = _lodash2['default'].merge(req.row, req.body);
    row = options.onSave(options.onUpdate(row, index), index);
    _rows[req.rowIndex] = row;
    res.send(options.format(row));
  })['delete'](function (req, res, next) {
    var row = options.onDelete(req.row, index);
    if (!row) _rows.splice(req.rowIndex, 1);
    res.send(options.format(row));
  });

  return routes;
};

module.exports = exports['default'];