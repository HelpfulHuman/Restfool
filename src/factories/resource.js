import _ from 'lodash';
import shortid from 'shortid';
import express from 'express';

/**
 * The default options for a resource.
 *
 * @var {Object}
 */
export const defaultOptions = {

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
  format (data) {
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
  indexQueryFilter (data) {
    let startIndex = (this.query.page ? this.query.page - 1 : 0);
    let limitIndex = startIndex + (this.query.limit || 50);
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
  onCreate (data) {
    data.id = shortid.generate();
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
  onUpdate (data, oldData) {
    return _.merge(oldData, data);
  },

  /**
   * This method is always called when a record is being saved and is
   * triggered AFTER onCreate or onUpdate.
   *
   * @param  {Object} data
   * @return {Object}
   */
  onSave (data) {
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
  onDelete (data) {
    return false;
  }

}

/**
 * Creates a complete set of RESTful routes.
 *
 * @param  {Object} options
 * @return {Object}
 */
export function factory (options) {

  // throw an error if no resource is defined
  if ( ! options.name) {
    throw new Error('You must define a name for a resource!');
  }

  // capture the name for the resource
  let name   = options.name;

  // create our new options object
  options    = _.merge({}, defaultOptions, options);

  // create our new rows array for the resource's records
  let rows   = [];

  // create the router that handles requests for this resource
  let router = new express.Router();

  // loop over the seed data (if any) and add it to the resource
  if (options.seed && Array.isArray(options.seed)) {
    rows = options.seed.map(function (seedItem) {
      return options.onSave(options.onCreate(_.clone(seedItem)));
    });
  }

  /**
   * This route covers GET /index which will run all rows through
   * the "filter" method before handing the filtered data to the
   * `format()` method.
   */
  router.get(`/${name}`, function (req, res, next) {
    let filtered = options.indexQueryFilter.call(req, _.clone(rows));
    res.send(options.format.call(req, filtered));
  });

  /**
   * This route covers POST /index for creating new rows.  Notice that
   * the data is passed to both `onCreate` and `onSave` events here before
   * the saved row is returned through `format()`.
   */
  router.post(`/${name}`, function (req, res, next) {
    let newRecord = options.onSave(options.onCreate(req.body));
    rows.push(newRecord);
    res.send(options.format.call(req, newRecord));
  });

  /**
   * Fetches the row matching the primaryKey if available, and passes
   * it along to the next routes in the chain.  Otherwise, a 404 is thrown.
   */
  router.use(`/${name}/:${name}`, function (req, res, next) {
    let id       = req.param(name);
    let rowIndex = _.findIndex(rows, options.primaryKey, id);

    // if we found the row index successfully, pass along the row
    // to the next route in the chain.
    if (rowIndex && rowIndex >= 0) {
      req.rowIndex = rowIndex;
      req.row = _.clone(rows[rowIndex]);
      return next();
    }

    // send a "resource not found" response
    res.send(404);
  });

  /**
   * Return the requested record to the client.
   */
  router.get(`/${name}/:${name}`, function (req, res, next) {
    res.send(options.format.call(req, req.row));
  });

  /**
   * Creates a new record using the found record and the onUpdate
   * and onSave methods before replacing it in the rows array.
   */
  router.put(`/${name}/:${name}`, function (req, res, next) {
    let newRecord = options.onSave(
      options.onUpdate(req.body, req.row));

    rows[req.rowIndex] = newRecord;

    res.send(options.format.call(req, newRecord));
  });

  /**
   * Removes the record completely from the rows array if the onDelete
   * method returns false or simply updates it with any new truthy
   * value given.
   */
  router.delete(`/${name}/:${name}`, function (req, res, next) {
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
