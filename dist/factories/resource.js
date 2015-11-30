'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultOptions = undefined;
exports.factory = factory;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The default options for a resource.
 *
 * @var {Object}
 */
var defaultOptions = exports.defaultOptions = {

  /**
   * The primary key used by find, update and delete.
   */
  primaryKey: 'id',

  /**
   * All resource output is first passed through this method before
   * being sent out to the requesting client.
   *
   * @param  {Object|Array} data
   * @return {Object|Array}
   */
  format: function format(data) {
    return data;
  },

  /**
   * Filters all of the rows returned by the GET /index route.
   * This is the only event-type method that receives the
   * request object (bound to "this") for accessing parameters.
   *
   * @param  {Array} data
   * @return {Array}
   */
  indexQueryFilter: function indexQueryFilter(data) {
    var startIndex = this.query.page ? this.query.page - 1 : 0;
    var limitIndex = startIndex + (this.query.limit || 50);
    return data.slice(startIndex, limitIndex);
  },

  /**
   * This method is called when a new record is being saved for
   * the first time.  This is the best place to add an auto-incrementing
   * unique primary key.
   *
   * @param  {Object} data
   * @return {Object}
   */
  onCreate: function onCreate(data) {
    data.id = _shortid2.default.generate();
    return data;
  },

  /**
   * This method is only called when a record is being updated and
   * receives the before and after record data.
   *
   * @param  {Object} data
   * @param  {Object} oldData
   * @return {Object}
   */
  onUpdate: function onUpdate(data, oldData) {
    return _lodash2.default.merge(oldData, data);
  },

  /**
   * This method is always called when a record is being saved and is
   * triggered AFTER onCreate or onUpdate.
   *
   * @param  {Object} data
   * @return {Object}
   */
  onSave: function onSave(data) {
    return data;
  },

  /**
   * This method is called when a record is being deleted.  Returning
   * false will remove the record for good.  Alternatively, you could
   * add a "deleted_at" column and add custom filters to simulate soft
   * deletes.
   *
   * @param  {Object} data
   * @return {Object|false}
   */
  onDelete: function onDelete(data) {
    return false;
  }
};

/**
 * Creates a complete set of RESTful routes.
 *
 * @param  {Object} options
 * @return {Object}
 */
function factory(options) {

  // throw an error if no resource is defined
  if (!options.name) {
    throw new Error('You must define a name for a resource!');
  }

  // capture the name for the resource
  var name = options.name;

  // create our new options object
  options = _lodash2.default.merge({}, defaultOptions, options);

  // create our new rows array for the resource's records
  var rows = [];

  // create the router that handles requests for this resource
  var router = new _express2.default.Router();

  // loop over the seed data (if any) and add it to the resource
  if (options.seed && Array.isArray(options.seed)) {
    rows = options.seed.map(function (seedItem) {
      return options.onSave(options.onCreate(_lodash2.default.clone(seedItem)));
    });
  }

  /**
   * This route covers GET /index which will run all rows through
   * the "filter" method before handing the filtered data to the
   * `format()` method.
   */
  router.get('/' + name, function (req, res, next) {
    var filtered = options.indexQueryFilter.call(req, _lodash2.default.clone(rows));
    res.send(options.format.call(req, filtered));
  });

  /**
   * This route covers POST /index for creating new rows.  Notice that
   * the data is passed to both `onCreate` and `onSave` events here before
   * the saved row is returned through `format()`.
   */
  router.post('/' + name, function (req, res, next) {
    var newRecord = options.onSave(options.onCreate(req.body));
    rows.push(newRecord);
    res.send(options.format.call(req, newRecord));
  });

  /**
   * Fetches the row matching the primaryKey if available, and passes
   * it along to the next routes in the chain.  Otherwise, a 404 is thrown.
   */
  router.use('/' + name + '/:' + name, function (req, res, next) {
    var id = req.param(name);
    var rowIndex = _lodash2.default.findIndex(rows, options.primaryKey, id);

    // if we found the row index successfully, pass along the row
    // to the next route in the chain.
    if (rowIndex && rowIndex >= 0) {
      req.rowIndex = rowIndex;
      req.row = _lodash2.default.clone(rows[rowIndex]);
      return next();
    }

    // send a "resource not found" response
    res.send(404);
  });

  /**
   * Return the requested record to the client.
   */
  router.get('/' + name + '/:' + name, function (req, res, next) {
    res.send(options.format.call(req, req.row));
  });

  /**
   * Creates a new record using the found record and the onUpdate
   * and onSave methods before replacing it in the rows array.
   */
  router.put('/' + name + '/:' + name, function (req, res, next) {
    var newRecord = options.onSave(options.onUpdate(req.body, req.row));

    rows[req.rowIndex] = newRecord;

    res.send(options.format.call(req, newRecord));
  });

  /**
   * Removes the record completely from the rows array if the onDelete
   * method returns false or simply updates it with any new truthy
   * value given.
   */
  router.delete('/' + name + '/:' + name, function (req, res, next) {
    var deleteResult = options.onDelete(req.row);

    // perform an update
    if (deleteResult) {
      rows[req.rowIndex] = deleteResult;
      res.send(options.format.call(req, deleteResult));
    }
    // splice the record out of the array
    else {
        rows.splice(req.rowIndex, 1);
        res.send(options.format.call(req, req.row));
      }
  });

  return router;
}