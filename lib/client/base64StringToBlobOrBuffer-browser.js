'use strict';

var binaryStringToBlobOrBuffer = require('./binaryStringToBlobOrBuffer');

module.exports = function (b64, type) {
  return binaryStringToBlobOrBuffer(atob(b64), type);
};