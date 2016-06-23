/*jshint expr:true */
'use strict';

var SocketPouch = require('../lib/client');

global.PouchDB = require('pouchdb')
  .plugin(require('pouchdb-legacy-utils'));
global.testUtils = require('../test/pouchdb/integration/utils');
var chai = require('chai');
global.should = chai.should();
chai.use(require('chai-as-promised'));

global.PouchDB.adapter('socket', SocketPouch);
global.PouchDB.preferredAdapters = ['socket'];

global.PouchDB = global.PouchDB.defaults({
  url: 'ws://localhost:8080'
});