import _ from 'lodash'
import express from 'express'

/**
 * The default options for a resource.
 *
 * @var {Object}
 */
let defaultOptions = {

  seed: [],

  format (data) {
    return data
  },

  onCreate (data, index) {
    data.id = index + 1

    return data
  },

  onUpdate (data, index) {
    return data
  },

  onSave (data, index) {
    return data
  },

  onDelete (data, index) {
    return false
  }

}

/**
 * Creates a complete set of RESTful routes.
 *
 * @param  {Object} options
 * @return {Object}
 */
export default function (options) {
  // throw an error if no resource is defined
  if ( ! options.name) {
    throw new Error('You must define a name for a resource!')
  }

  options = _.merge(defaultOptions, options)
  var routes = new express.Router()
  var _rows  = (Array.isArray(options.seed) ? options.seed : [])
  var name   = options.name

  routes.route(`/${name}`)
  .get(function (req, res, next) {
    res.send(options.format(_rows))
  })
  .post(function (req, res, next) {
    var index = _rows.length
    var row = options.onSave(options.onCreate(req.body, index), index)
    _rows.push(row)

    res.send(options.format(row))
  })

  /**
   * Returns a specific resource if it exists.
   */
  routes
  .param(name, function (req, res, next) {
    var rowIndex = _.findIndex(_rows, 'id', req.params[name])
    if ( ! rowIndex) return res.send(404)
    req.rowIndex = rowIndex
    req.row = _rows[rowIndex]
    next()
  })

  routes
  .route(`/${name}/:${name}`)
  .get(function (req, res, next) {
    res.send(options.format(req.row))
  })
  .put(function (req, res, next) {
    var row = _.merge(req.row, req.body)
    row = options.onSave(options.onUpdate(row, index), index)
    _rows[req.rowIndex] = row
    res.send(options.format(row))
  })
  .delete(function (req, res, next) {
    var row = options.onDelete(req.row, index)
    if ( ! row) _rows.splice(req.rowIndex, 1)
    res.send(options.format(row))
  })


  return routes
}
