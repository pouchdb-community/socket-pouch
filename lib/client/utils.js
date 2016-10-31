'use strict';

var utils = require('../shared/utils');
var log = require('debug')('pouchdb:socket:client');
var isBrowser = typeof process === 'undefined' || process.browser;

exports.preprocessAttachments = function preprocessAttachments(doc) {
  if (!doc._attachments || !Object.keys(doc._attachments)) {
    return utils.Promise.resolve();
  }

  var atts = doc._attachments;
  return utils.Promise.all(Object.keys(atts).map(function (key) {
    var att = atts[key];
    if (att.data && typeof att.data !== 'string') {
      if (isBrowser) {
        return new utils.Promise(function (resolve) {
          utils.readAsBinaryString(att.data, function (binary) {
            att.data = utils.btoa(binary);
            resolve();
          });
        });
      } else {
        att.data = att.data.toString('base64');
      }
    }
  }));
};

var b64StringToBluffer =
  require('./base64StringToBlobOrBuffer');

exports.readAttachmentsAsBlobOrBuffer = function (row) {
  var atts = (row.doc && row.doc._attachments) ||
    (row.ok && row.ok._attachments);
  if (!atts) {
    return;
  }
  Object.keys(atts).forEach(function (filename) {
    var att = atts[filename];
    att.data = b64StringToBluffer(att.data, att.content_type);
  });
};

exports.stringifyArgs = function stringifyArgs(args) {
  var funcArgs = ['filter', 'map', 'reduce'];
  args.forEach(function (arg) {
    if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
      funcArgs.forEach(function (funcArg) {
        if (funcArg in arg && typeof arg[funcArg] === 'function') {
          arg[funcArg] = {
            type: 'func',
            func: arg[funcArg].toString()
          };
        }
      });
    }
  });
  return JSON.stringify(args);
};

exports.padInt = function padInt(i, len) {
  var res = i.toString();
  while (res.length < len) {
    res = '0' + res;
  }
  return res;
};


exports.adapterFun = function adapterFun(name, callback) {

  function logApiCall(self, name, args) {
    if (!log.enabled) {
      return;
    }
    // db.name was added in pouch 6.0.0
    var dbName = self.name || self._db_name;
    var logArgs = [dbName, name];
    for (var i = 0; i < args.length - 1; i++) {
      logArgs.push(args[i]);
    }
    log.apply(null, logArgs);

    // override the callback itself to log the response
    var origCallback = args[args.length - 1];
    args[args.length - 1] = function (err, res) {
      var responseArgs = [dbName, name];
      responseArgs = responseArgs.concat(
        err ? ['error', err] : ['success', res]
      );
      log.apply(null, responseArgs);
      origCallback(err, res);
    };
  }


  return utils.toPromise(utils.getArguments(function (args) {
    if (this._closed) {
      return utils.Promise.reject(new Error('database is closed'));
    }
    var self = this;
    logApiCall(self, name, args);
    if (!this.taskqueue.isReady) {
      return new utils.Promise(function (fulfill, reject) {
        self.taskqueue.addTask(function (failed) {
          if (failed) {
            reject(failed);
          } else {
            fulfill(self[name].apply(self, args));
          }
        });
      });
    }
    return callback.apply(this, args);
  }));
};