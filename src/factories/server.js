import _ from 'lodash';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import capture from '../middleware/capture';
import notifier from 'node-notifier';
import createDashboard from '../middleware/dashboard';
import {factory as createBridge} from './bridge';

/**
 * The default options for new server instances that RESTfool
 * creates for the user.
 *
 * @type {Object}
 */
export const defaultOptions = {

  /**
   * Enables Growl notifications
   * @type {Boolean}
   */
  notify: true

}

/**
 * Creates a new RESTfool server.
 *
 * @param  {Object} options
 * @return {Express}
 */
export function factory (options) {

  // we need to create 2 servers, one for the RESTfool and the other
  // for the UI
  let server    = express();
  let dashboard = express();

  // we're going to overwrite the listen function for the RESTfool
  // server so we need to store the old one somewhere
  let oldListen = server.listen;

  // next we create a "bridge" middleware for linking everything up
  let bridge    = createBridge();

  // merge our default settings with any given settings
  options = _.merge(defaultOptions, options || {});

  // if notifications are enabled, attach a notifier onto the
  // "request-close" event
  if (options.notify) {
    bridge.on('request-close', function (record) {
      notifier.notify({
        title: 'RESTfool ~ Sent ' + record.response.statusCode,
        message: record.method + ' ' + record.path
      });
    });
  }

  // standard middleware
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))

  // allows the use of CORS for all routes
  server.use(cors());

  // capture middleware to informat bridge of requests
  server.use(capture(bridge));

  // set up the dashboard
  dashboard.use(createDashboard(bridge));

  // replace Express' listen() method with our own that launches
  // the dashboard instance
  server.listen = function () {
    // start the listener for the RESTfool server
    let listener = oldListen.apply(server, arguments);

    // capture the listener's reported port
    let restfoolPort = listener.address().port;

    // define the port that the UI will listen on
    let dashboardPort = restfoolPort + 1;

    // start the UI server
    dashboard.listen(dashboardPort, function () {
      console.log('Serving RESTfool on port %d', restfoolPort);
      console.log('Serving RESTfool dashboard on port %d', dashboardPort);
    });
  }

  return server;
}
