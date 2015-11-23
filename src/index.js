import _ from 'lodash'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import createDashboard from './middleware/dashboard'
import capture from './middleware/capture'
import notifier from 'node-notifier'

import createBridge from './factories/bridge'
import createFixture from './factories/fixture'
import createResource from './factories/resource'

let defaultOptions = {
  notify: true
}
import {factory as createFixture} from './factories/fixture';

export default {

  /**
   * Creates a new RESTfool server.
   *
   * @param  {Object} options
   * @return {Express}
   */
  create (options) {
    var server    = express()
    var dashboard = express()
    var oldListen = server.listen
    var bridge    = createBridge()

    // merge our default settings with any given settings
    options = _.merge(defaultOptions, options || {})

    // enable notifications
    // if (options.notify) {
      bridge.on('request-close', function (record) {
        notifier.notify({
          title: 'RESTfool ~ Sent ' + record.response.statusCode,
          message: record.method + ' ' + record.path
        })
      })
    // }

    // standard middleware
    server.use(bodyParser.json())
    server.use(bodyParser.urlencoded({ extended: true }))

    // allows the use of CORS for all routes
    server.use(cors())

    // capture middleware to informat bridge of requests
    server.use(capture(bridge))

    // set up the dashboard as well
    dashboard.use(createDashboard(bridge))

    // replace Express' listen() method with our own that launches
    // the dashboard instance
    server.listen = function () {
      var listener = oldListen.apply(server, arguments)
      var dashboardPort = listener.address().port + 1
      dashboard.listen(dashboardPort)
      console.log('Serving RESTfool dashboard on port %d', dashboardPort);
    }

    return server
  },

  fixture: createFixture,

  resource: createResource,

}
