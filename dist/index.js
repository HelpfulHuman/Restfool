'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _middlewareDashboard = require('./middleware/dashboard');

var _middlewareDashboard2 = _interopRequireDefault(_middlewareDashboard);

var _middlewareCapture = require('./middleware/capture');

var _middlewareCapture2 = _interopRequireDefault(_middlewareCapture);

var _nodeNotifier = require('node-notifier');

var _nodeNotifier2 = _interopRequireDefault(_nodeNotifier);

var _factoriesBridge = require('./factories/bridge');

var _factoriesBridge2 = _interopRequireDefault(_factoriesBridge);

var _factoriesFixture = require('./factories/fixture');

var _factoriesFixture2 = _interopRequireDefault(_factoriesFixture);

var _factoriesResource = require('./factories/resource');

var _factoriesResource2 = _interopRequireDefault(_factoriesResource);

var defaultOptions = {
  notify: true
};

exports['default'] = {

  /**
   * Creates a new RESTfool server.
   *
   * @param  {Object} options
   * @return {Express}
   */
  create: function create(options) {
    var server = (0, _express2['default'])();
    var dashboard = (0, _express2['default'])();
    var oldListen = server.listen;
    var bridge = (0, _factoriesBridge2['default'])();

    // merge our default settings with any given settings
    options = _lodash2['default'].merge(defaultOptions, options || {});

    // enable notifications
    // if (options.notify) {
    bridge.on('request-close', function (record) {
      _nodeNotifier2['default'].notify({
        title: 'RESTfool ~ Sent ' + record.response.statusCode,
        message: record.method + ' ' + record.path
      });
    });
    // }

    // standard middleware
    server.use(_bodyParser2['default'].json());
    server.use(_bodyParser2['default'].urlencoded({ extended: true }));

    // capture middleware to informat bridge of requests
    server.use((0, _middlewareCapture2['default'])(bridge));

    // set up the dashboard as well
    dashboard.use((0, _middlewareDashboard2['default'])(bridge));

    // replace Express' listen() method with our own that launches
    // the dashboard instance
    server.listen = function () {
      var listener = oldListen.apply(server, arguments);
      var dashboardPort = listener.address().port + 1;
      dashboard.listen(dashboardPort);
      console.log('Serving RESTfool dashboard on port %d', dashboardPort);
    };

    return server;
  },

  fixture: _factoriesFixture2['default'],

  resource: _factoriesResource2['default']

};
module.exports = exports['default'];