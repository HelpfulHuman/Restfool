'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.factory = factory;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _events2 = require('events');

var _events3 = _interopRequireDefault(_events2);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates and returns a new bridge object that can be used to
 * tie RESTfool middleware together.
 *
 * @param  {Object} options
 * @return {Object}
 */
function factory(options) {
  var _records = [];
  var _events = new _events3.default.EventEmitter();

  return {
    on: _events.on.bind(_events),

    emit: _events.emit.bind(_events),

    all: function all() {
      return _records;
    },
    find: function find(id) {
      for (var i = 0; i < _records.length; i++) {
        if (_records[i].id === id) {
          return _records[i];
        }
      }

      return false;
    },
    clear: function clear() {
      _records = [];
    },
    record: function record(req) {
      var id = _shortid2.default.generate();
      var record = {
        id: id,
        status: 'open',
        method: req.method,
        path: req.path,
        request: req,
        started_at: (0, _moment2.default)(),
        ended_at: null,
        meta: [],
        tags: []
      };

      _records.push(record);
      _events.emit('request-open', record);

      return record;
    },
    close: function close(record) {
      record.status = 'closed';
      record.ended_at = (0, _moment2.default)();
      _events.emit('request-close', record);
    }
  };
}