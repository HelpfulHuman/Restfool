'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultOptions = undefined;
exports.factory = factory;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _capture = require('../middleware/capture');

var _capture2 = _interopRequireDefault(_capture);

var _nodeNotifier = require('node-notifier');

var _nodeNotifier2 = _interopRequireDefault(_nodeNotifier);

var _dashboard = require('../middleware/dashboard');

var _dashboard2 = _interopRequireDefault(_dashboard);

var _bridge = require('./bridge');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The default options for new server instances that RESTfool
 * creates for the user.
 *
 * @type {Object}
 */
var defaultOptions = exports.defaultOptions = {

  /**
   * Enables Growl notifications
   * @type {Boolean}
   */
  notify: true

};

/**
 * Creates a new RESTfool server.
 *
 * @param  {Object} options
 * @return {Express}
 */
function factory(options) {

  // we need to create 2 servers, one for the RESTfool and the other
  // for the UI
  var server = (0, _express2.default)();
  var dashboard = (0, _express2.default)();

  // we're going to overwrite the listen function for the RESTfool
  // server so we need to store the old one somewhere
  var oldListen = server.listen;

  // next we create a "bridge" middleware for linking everything up
  var bridge = (0, _bridge.factory)();

  // merge our default settings with any given settings
  options = _lodash2.default.merge(defaultOptions, options || {});

  // if notifications are enabled, attach a notifier onto the
  // "request-close" event
  if (options.notify) {
    bridge.on('request-close', function (record) {
      _nodeNotifier2.default.notify({
        title: 'RESTfool ~ Sent ' + record.response.statusCode,
        message: record.method + ' ' + record.path
      });
    });
  }

  // standard middleware
  server.use(_bodyParser2.default.json());
  server.use(_bodyParser2.default.urlencoded({ extended: true }));

  // allows the use of CORS for all routes
  server.use((0, _cors2.default)());

  // capture middleware to informat bridge of requests
  server.use((0, _capture2.default)(bridge));

  // set up the dashboard
  dashboard.use((0, _dashboard2.default)(bridge));

  // replace Express' listen() method with our own that launches
  // the dashboard instance
  server.listen = function () {
    // start the listener for the RESTfool server
    var listener = oldListen.apply(server, arguments);

    // capture the listener's reported port
    var restfoolPort = listener.address().port;

    // define the port that the UI will listen on
    var dashboardPort = restfoolPort + 1;

    // start the UI server
    dashboard.listen(dashboardPort, function () {
      console.log('Serving RESTfool on port %d', restfoolPort);
      console.log('Serving RESTfool dashboard on port %d', dashboardPort);
    });
  };

  return server;
}