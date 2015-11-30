'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (bridge) {
  return function (req, res, next) {
    var chunks = [];
    var oldWrite = res.write;
    var oldEnd = res.end;
    var record = bridge.record(req);

    // add the record to the request
    req.record = record;

    // add the bridge to the request
    req.restfool = bridge;

    // replace the write() method
    res.write = function (chunk) {
      chunks.push(chunk);
      oldWrite.apply(res, arguments);
    };

    // replace the end() method
    res.end = function (chunk) {
      if (chunk) chunks.push(chunk);
      // var body = Buffer.concat(chunks).toString('utf8')
      record.response = {
        statusCode: res.statusCode,
        body: 'n/a'
      };
      bridge.close(record);
      oldEnd.apply(res, arguments);
    };

    next();
  };
};