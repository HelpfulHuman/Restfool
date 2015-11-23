import _ from 'lodash';
import shortid from 'shortid';
import events from 'events';
import moment from 'moment';

/**
 * Creates and returns a new bridge object that can be used to
 * tie RESTfool middleware together.
 *
 * @param  {Object} options
 * @return {Object}
 */
export function factory (options) {
  var _records = []
  var _events  = new events.EventEmitter()

  return {
    on: _events.on.bind(_events),

    emit: _events.emit.bind(_events),

    all () {
      return _records;
    },

    find (id) {
      for (var i = 0; i < _records.length; i++) {
        if (_records[i].id === id) {
          return _records[i]
        }
      }

      return false
    },

    clear () {
      _records = []
    },

    record (req) {
      var id  = shortid.generate()
      var record = {
        id: id,
        status: 'open',
        method: req.method,
        path: req.path,
        request: req,
        started_at: moment(),
        ended_at: null,
        meta: [],
        tags: []
      }

      _records.push(record)
      _events.emit('request-open', record)

      return record
    },

    close (record) {
      record.status = 'closed'
      record.ended_at = moment()
      _events.emit('request-close', record)
    }
  }
}
