'use strict';

module.exports = function (buffer, callback) {
  process.nextTick(function () {
    callback(buffer.toString('binary'));
  });
};