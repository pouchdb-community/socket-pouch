'use strict';

module.exports = function (buffer, callback) {
  process.nextTick(function () {
    callback(null, buffer.toString('binary'));
  });
};