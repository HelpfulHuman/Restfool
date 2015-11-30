'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (bridge) {

  var routes = new _express2.default.Router();

  /**
   * Serves the CSS for the dashboard.
   */
  routes.get('/dashboard.css', function (req, res, next) {
    var css = (0, _stylus2.default)('').import(assets + '/styles/index.styl').render();

    res.type('css').send(css);
  });

  /**
   * Serves the client-side JS for the dashboard.
   */
  routes.get('/dashboard.js', (0, _browserifyMiddleware2.default)(assets + '/scripts/index.js', {
    cache: true,
    precompile: true
  }));

  /**
   * Clears out all of the stored records.
   */
  routes.get('/clear', function (req, res, next) {
    bridge.clear();
    res.redirect('/');
  });

  /**
   * Returns/displays a list of all the results sorted by date.
   */
  routes.get('/:id?', function (req, res, next) {
    var records = _lodash2.default.sortByOrder(bridge.all(), 'started_at', 'asc').reverse();

    res.send(_jade2.default.renderFile(assets + '/views/index.jade', {
      records: bridge.all(),
      selected: bridge.find(req.params.id) || records[0]
    }));
  });

  return routes;
};

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _jade = require('jade');

var _jade2 = _interopRequireDefault(_jade);

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _browserifyMiddleware = require('browserify-middleware');

var _browserifyMiddleware2 = _interopRequireDefault(_browserifyMiddleware);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assets = __dirname + '/../../dashboard';

/**
 * Generates the routes for the Dashboard.
 *
 * @param  {Object} bridge
 * @return {Object}
 */