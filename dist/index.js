'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resource = exports.fixture = exports.create = undefined;

var _server = require('./factories/server');

var _fixture = require('./factories/fixture');

var _resource = require('./factories/resource');

exports.create = _server.factory;
exports.fixture = _fixture.factory;
exports.resource = _resource.factory;