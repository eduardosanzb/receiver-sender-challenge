'use strict';

const request = require('request');
const http = require('http');

// TODO: Move to a config file
const SERVER_URL = 'http://localhost:8080/event';
const keepAliveAgent = new http.Agent({
  keepAlive: true,
});

const isArrayOrString = x => {
  const isString = typeof x === 'string';
  return Array.isArray(x) || isString;
};

const isEmptyObject = x => {
  return x.constructor === Object && Object.keys(x).length === 0;
};

const handleError = callback => (err, res, body) => {
  callback(err);
};

/**
 * @description Passthrough function to send requests 
 * @param {*} eventMsg - The body to post
 * @param {string} encoding
 * @param {function} callback
 */
function main(eventMsg, encoding, callback) {
  if (isArrayOrString(eventMsg) && eventMsg.length === 0) {
    return;
  }
  if (isEmptyObject(eventMsg)) {
    return;
  }

  const options = {
    json: true,
    body: eventMsg,
    gzip: true,
    agent: keepAliveAgent,
  };

  request.post(SERVER_URL, options, handleError(callback));
}

module.exports = main;
