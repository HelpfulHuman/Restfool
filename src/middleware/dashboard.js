import express from 'express'
import jade from 'jade'
import stylus from 'stylus'
import browserify from 'browserify-middleware'
import _ from 'lodash'

let assets = __dirname + '/../../dashboard';

/**
 * Generates the routes for the Dashboard.
 *
 * @param  {Object} bridge
 * @return {Object}
 */
export default function (bridge) {

  let routes = new express.Router()

  /**
   * Serves the CSS for the dashboard.
   */
  routes.get('/dashboard.css', function (req, res, next) {
    var css = stylus('')
      .import(assets + '/styles/index.styl')
      .render()

    res.type('css').send(css)
  })

  /**
   * Serves the client-side JS for the dashboard.
   */
  routes.get('/dashboard.js', browserify(assets + '/scripts/index.js', {
    cache: true,
    precompile: true
  }))

  /**
   * Clears out all of the stored records.
   */
  routes.get('/clear', function (req, res, next) {
    bridge.clear()
    res.redirect('/')
  })

  /**
   * Returns/displays a list of all the results sorted by date.
   */
  routes.get('/:id?', function (req, res, next) {
    var records  = _.sortByOrder(bridge.all(), 'started_at', 'asc').reverse()

    res.send(jade.renderFile(assets + '/views/index.jade', {
      records: bridge.all(),
      selected: bridge.find(req.params.id) || records[0]
    }))
  })

  return routes

}
