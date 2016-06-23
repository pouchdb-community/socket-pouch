/*jshint expr:true */
'use strict';

var SocketPouch = require('../lib/client');

window.PouchDB = require('pouchdb')
  .plugin(require('pouchdb-legacy-utils'));

window.PouchDB.adapter('socket', SocketPouch);
window.PouchDB.preferredAdapters = ['socket'];

window.PouchDB = window.PouchDB.defaults({
  url: 'ws://localhost:8080'
});